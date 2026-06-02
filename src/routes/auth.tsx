import { zValidator } from "@hono/zod-validator";
import { factory } from "../utils/createHono";
import { AuthCodePayload, AuthorizeSchema, ProfileSchema, SigninSchema, SignupSchema } from "../utils/zodSchemas";
import { validatorHook } from "../utils/formateZodError";
import { hashPassword, verifyPassword } from "../services/passwordService";
import * as authRepository from "../repositories/userRepository";
import { HttpStatusCode } from "../utils/statusCodes";
import { authedMware } from "../middleware/authMware";
import { getConnInfo } from "hono/cloudflare-workers";
import type { Context } from "hono";
import type { MyEnv } from "../utils/types";
import { authCookie, dataCookie } from "../services/cookieService";
import * as applicationRepository from "../repositories/applicationRepository"
import { randomUUID } from "node:crypto";
import z from "zod";
import { sha256Base64Url } from "../utils/sha256BaseUrl";
import { cors } from "hono/cors";
import { db } from "../drizzle/db";
import { validator } from "hono/validator";
import { userConsent } from "../drizzle/schema";
import { and, eq, sql } from "drizzle-orm";
import { Consent } from "../ui/pages/consent";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { compareArrays } from "../utils/compareArrays";

export const authRoutes = factory.createApp()

// authRoutes.use(csrf())

const getClientInfo = (c: Context<MyEnv>) => ({
    ip: getConnInfo(c).remote.address ?? "127.0.0.1",
    userAgent: c.req.header("User-Agent") ?? ""
})

authRoutes
    .post(
        "/signup",
        zValidator("form", SignupSchema, validatorHook),
        async c => {
            const form = c.req.valid("form");
            const passwordHash = await hashPassword(form.password);
            const clientInfo = getClientInfo(c)
            const sessionId = await authRepository.createUser({ ...form, passwordHash }, clientInfo);
            await authCookie.set(sessionId, c)
            const redirect = c.req.query("navigateTo")
            return c.json({ navigateTo: redirect ?? "/profile" })
        }
    )
    .post(
        "/signin",
        zValidator("form", SigninSchema, validatorHook),
        async c => {
            const badRequestResponse = c.json({ errors: ["Invalid credentials"] }, HttpStatusCode.BAD_REQUEST);
            const { identifier, password } = c.req.valid("form")
            const record = await authRepository.getUser(identifier);
            if (!record) return badRequestResponse
            const isValid = await verifyPassword(password, record.passwordHash);
            if (!isValid) return badRequestResponse;
            const clientInfo = getClientInfo(c)
            const { insertSession, sessionId } = authRepository.createSession(record.userId, clientInfo);
            await insertSession;
            await authCookie.set(sessionId, c)
            const redirect = c.req.query("navigateTo");
            return c.json({ navigateTo: redirect ?? "/profile" })
        }
    )
    .get(
        "/logout",
        async c => {
            authCookie.delete(c);
            dataCookie.delete(c);
            return c.redirect("/signin")
        }
    )
    .post(
        "/profile",
        authedMware,
        zValidator("form", ProfileSchema, validatorHook),
        async c => {
            const { name, surname, image } = c.req.valid("form");
            let key: string | undefined
            if (image) {
                key = `/oauth/users/${c.var.user.userId}`;
                const buffer = await image.arrayBuffer();
                await c.env.R2.put(key, buffer, {
                    httpMetadata: {
                        cacheControl: "public, max-age=86400"
                    }
                })
            }
            const [record] = (await authRepository.updateUser({
                name, surname, image: key
            }))
            dataCookie.delete(c)

            return c.json(record)
        }
    )
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

                    for (const issue of res.error.issues) {
                        if (issue.path[0] == "response_type") return c.redirect(client.redirectUri + "?error=unsupported_response_type")
                        if (issue.path[0] == "scope") return c.redirect(client.redirectUri + "?error=invalid_scope")
                    }
                    return c.redirect(client.redirectUri + "?error=invalid_request")
                }
            }),
        async c => {
            const valid = c.req.valid("query");
            const client = await db.query.clients.findFirst({
                where: {
                    clientId: valid.client_id
                },
                with: {
                    owner: {
                        columns: {
                            username: true,
                            email: true,
                            userId: true,
                            image: true
                        }
                    }
                }
            })
            if (!client)
                return c.json({ error: "Invalid Client ID" }, 400)

            const consent = await db.query.userConsent.findFirst({
                where: {
                    userId: c.var.user.userId,
                    clientId: valid.client_id
                }
            })
            
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
                userId: c.var.user.userId
            }), { expirationTtl: 60 * 5 })
            const redirect = new URL(valid.redirect_uri);
            redirect.searchParams.set("code", code)
            if (valid.state) redirect.searchParams.set("state", valid.state);
            return c.redirect(redirect, 307)
        }
    )
    .post(
        "/authorize/approve",
        authedMware,
        async c => {
            const consentCookie = await getSignedCookie(c, c.env.COOKIE_SECRET, "consent")
            if (!consentCookie) return c.text("Forbidden", 403);
            const valid: z.infer<typeof AuthorizeSchema> = JSON.parse(consentCookie)
            await db.insert(userConsent).values({
                clientId: valid.client_id,
                modifiedOn: new Date,
                userId: c.var.user.userId,
                scopes: valid.scope,                
            }).onConflictDoUpdate({
                target: [userConsent.clientId, userConsent.userId],
                set: {
                    scopes: sql`excluded.scopes`,
                    modifiedOn: sql`excluded.modified_on`
                }
            })
            return c.text("OK")
        }
    )
    .post(
        "/token",
        cors({
            allowMethods: ["POST"]
        }),
        zValidator("query", AuthCodePayload),
        async c => {
            const valid = c.req.valid("query");
            const client = await c.env.KV.get<z.infer<typeof AuthorizeSchema> & { userId: string }>(`codes:${valid.code}`, "json");
            if (!client) return c.json({ error: "Code invalid or expired" }, 400);
            if (valid.redirect_uri != client.redirect_uri) return c.json({ error: "Redirect URI Mismatch" }, 400)
            const isMatch = sha256Base64Url(valid.code_verifier) == client.code_challenge
            if (isMatch === false) return c.json({ error: "Code Challenge Failed" }, 400)
            return c.json({
                token: "askdfjsdkfksdf",
                refresh: "sdkflasdkvamsdvkvsadfkaks"
            })
        }
    )
