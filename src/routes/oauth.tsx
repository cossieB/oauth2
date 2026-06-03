import { zValidator } from "@hono/zod-validator";
import { factory } from "../utils/createHono";
import { AuthCodePayload, AuthorizeSchema } from "../utils/zodSchemas";
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
                userId: c.var.user.userId
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
