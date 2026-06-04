import { zValidator } from "@hono/zod-validator";
import { factory } from "../utils/createHono";
import { GrantType, AuthorizeSchema } from "../utils/zodSchemas";
import { authedMware } from "../middleware/authMware";
import * as applicationRepository from "../repositories/applicationRepository"
import * as consentRepository from "../repositories/consentRepository"
import { randomUUID } from "node:crypto";
import z from "zod";
import { sha256Base64Url } from "../utils/sha256BaseUrl";
import { cors } from "hono/cors";
import { Consent } from "../ui/pages/consent";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { compareArrays } from "../utils/compareArrays";
import * as refreshTokenRepository from "../repositories/refreshTokenRepository"
import { generateJwt, getIdTokenClaims, verifyToken } from "../services/tokenService";
import { db } from "../drizzle/db";
import { keys, refreshTokens, userConsent, users } from "../drizzle/schema";
import { and, desc, eq, isNull } from "drizzle-orm";

export const oauthRoutes = factory.createApp()

oauthRoutes
    .get(
        "/authorize",
        authedMware,
        zValidator(
            "query",
            AuthorizeSchema,
            async (res, c) => {
                if (!res.success) {
                    const hasInvalidRedirectUri = res.error.issues.some(issue => issue.path[0] === "redirect_uri")
                    if (hasInvalidRedirectUri) return c.json({ error: "Redirect URI Mismatch" }, 400);
                    const hasNoClientId = res.error.issues.some(issue => issue.path[0] === "client_id")
                    if (hasNoClientId) return c.json({ error: "Invalid Client ID" }, 400)
                    const client = await applicationRepository.findById(res.data.client_id)
                    if (!client) return c.json({ error: "Invalid client id" }, 400);
                    if (client.redirectUri !== res.data.redirect_uri) return c.json({ error: "Redirect URI Mismatch" }, 400);

                    const url = new URL(client.redirectUri)
                    if (res.data.state) url.searchParams.set("state", res.data.state)
                    for (const issue of res.error.issues) {
                        if (issue.path[0] == "response_type") {
                            url.searchParams.set("error", "unsupported_response_type")
                            return c.redirect(url)
                        }
                        if (issue.path[0] == "scope") {
                            url.searchParams.set("error", "invalid_scope")
                            return c.redirect(url)
                        }
                    }
                    url.searchParams.set("error", "invalid_request")
                    return c.redirect(url)
                }
            }),
        async c => {
            const valid = c.req.valid("query");
            const client = await applicationRepository.findById(valid.client_id)
            if (!client)
                return c.json({ error: "Invalid Client ID" }, 400)

            const consent = await consentRepository.getConsent(c.var.user.userId, valid.client_id)

            if (!consent || !compareArrays(valid.scope, consent.scopes)) {
                await setSignedCookie(c, "consent", JSON.stringify(valid), c.env.COOKIE_SECRET, {
                    maxAge: 60 * 5,
                    httpOnly: true,
                    secure: c.env.NODE_ENV == "production",
                    sameSite: "Strict",
                    path: "/"
                })
                return c.render(<Consent {...client} scopes={valid.scope} user={c.var.user} />, { title: "Approve application" })
            }
            const code = randomUUID();
            await c.env.KV.put(`codes:${code}`, JSON.stringify({
                ...valid,
                user: c.var.user,
                consentId: consent.consentId
            }), { expirationTtl: 60 * 5 })
            const redirect = new URL(valid.redirect_uri);
            redirect.searchParams.set("code", code)
            if (valid.state) redirect.searchParams.set("state", valid.state);
            return c.redirect(redirect)
        }
    )
    .post(
        "/authorize/approve",
        authedMware,
        async c => {
            const consentCookie = await getSignedCookie(c, c.env.COOKIE_SECRET, "consent")
            if (!consentCookie) return c.text("Forbidden", 403);
            const valid: z.infer<typeof AuthorizeSchema> = JSON.parse(consentCookie)
            await consentRepository.addConsent(valid.client_id, c.var.user.userId, valid.scope)
            return c.text("OK")
        }
    )
    .post(
        "/token",
        cors({
            allowMethods: ["POST"]
        }),
        zValidator("query", GrantType),
        async c => {
            const valid = c.req.valid("query");
            if (valid.grant_type === "authorization_code") {
                const client = await c.env.KV.get<z.infer<typeof AuthorizeSchema> & { user: NonNullable<typeof c.var.user>, consentId: number }>(`codes:${valid.code}`, "json");

                if (!client) return c.json({
                    error: "invalid_grant",
                    error_description: "The provided authorization code is invalid, expired, or revoked."
                }, 400);

                await c.env.KV.delete(`codes:${valid.code}`)
                if (valid.redirect_uri != client.redirect_uri) return c.json({ error: "Redirect URI Mismatch" }, 400)
                const isMatch = sha256Base64Url(valid.code_verifier) == client.code_challenge

                if (isMatch === false) {
                    return c.json({
                        error: "invalid_grant",
                        error_description: "The PKCE code_verifier does not match the stored code challenge."
                    }, 400)
                }
                const refreshToken = client.scope.includes("offline_access") ? await refreshTokenRepository.createRefreshToken(client.consentId, client.scope) : undefined
                const [key] = await db.select().from(keys).orderBy(desc(keys.keyId)).limit(1)                
                const access_token = await generateJwt({
                    scope: client.scope,
                    client_id: client.client_id,
                    ucid: client.consentId
                }, key)
                const claims = getIdTokenClaims(client.scope, client.user)

                const id_token = claims ? await generateJwt(claims, key, "jwt") : undefined
                return c.json({
                    refresh_token: refreshToken?.token,
                    access_token,
                    id_token,
                    token_type: "bearer",
                    expires_in: 15 * 60
                })
            }
            // grant_type=refresh_token
            const { refresh_token, client_id } = valid;
            const invalidGrantResponse = c.json({ error: "invalid_grant" }, 400)
            const tokens = await db
                .select()
                .from(refreshTokens)
                .innerJoin(userConsent, eq(refreshTokens.consentId, userConsent.consentId))
                .innerJoin(users, eq(userConsent.userId, users.userId))
                .where(eq(refreshTokens.token, refresh_token))

            const token = tokens.at(0)
            if (!token) return invalidGrantResponse;
            if (token.refresh_tokens.revokedAt) {
                if ((Date.now() - token.refresh_tokens.revokedAt.getTime() > 1000 * 60)) {
                    // possible stolen refresh token 
                    await db
                        .update(refreshTokens)
                        .set({
                            revokedAt: new Date
                        })
                        .where(and(
                            eq(
                                refreshTokens.consentId,
                                db
                                    .select({
                                        consentId: refreshTokens.consentId,
                                    })
                                    .from(refreshTokens)
                                    .where(eq(refreshTokens.token, refresh_token))
                            ),
                            isNull(refreshTokens.revokedAt)
                        ))
                }
                return invalidGrantResponse
            }
            if (token.refresh_tokens.expiresAt < new Date) return invalidGrantResponse
            if (token.user_consent.clientId != client_id) return invalidGrantResponse
            const [key] = await db.select().from(keys).orderBy(desc(keys.keyId)).limit(1)            
            const access_token = await generateJwt({
                scope: token.user_consent.scopes,
                client_id: token.user_consent.clientId,
                ucid: token.user_consent.consentId
            }, key, "at+jwt")
            const claims = getIdTokenClaims(token.user_consent.scopes as any, token.users)
            const id_token = claims ? await generateJwt(claims, key, "jwt") : undefined
            const newRefreshToken = randomUUID()
            const revokeToken = db.update(refreshTokens)
                .set({
                    revokedAt: new Date
                })
                .where(eq(refreshTokens.token, refresh_token))
            const insert = db.insert(refreshTokens).values({ token: newRefreshToken, consentId: token.user_consent.consentId })
            await db.batch([revokeToken, insert])
            return c.json({
                refresh_token: newRefreshToken,
                access_token,
                id_token,
                token_type: "bearer",
                expires_in: 15 * 60
            })
        }
    )
    .get("/userinfo", async c => {
        const authHeader = c.req.header("Authorization")
        if (!authHeader) return c.json({ errror: "No access token" }, 401)
        const token = authHeader.split(/^Bearer /).at(1)
        if (!token) return c.json({ error: "No access token" }, 401)
        const result = await verifyToken(token, "at+jwt");
        if (!result) return c.json({ error: "Invalid access token" }, 401)
        if (!(result.payload.scope as any).includes("openid")) return c.json({ error: "insufficient_scope" }, 403)

        const u = await db
            .select()
            .from(users)
            .where(
                eq(
                    users.userId,
                    db
                        .select({ userId: userConsent.userId })
                        .from(userConsent)
                        .where(eq(userConsent.consentId, result.payload.ucid as number))
                    ))
        const user = u.at(0)
        if (!user) return c.json({ error: "User not found" }, 404)

        const claims = getIdTokenClaims(result.payload.scope as any, user)!
        return c.json(claims)
    })
    .post("/revoke", zValidator("query", z.object({
        token: z.string(),
        token_type_hint: z.literal("refresh_token").optional(),
        client_id: z.string()
    })), async c => {
        const valid = c.req.valid("query");
        await refreshTokenRepository.deleteRefreshToken(valid.token, valid.client_id);
        return c.json({message: "OK"})
    })