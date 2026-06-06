import type z from "zod";
import * as applicationRepository from "../repositories/applicationRepository"

export async function handleAuthorizeRouteError(res: ({ success: true; data: { response_type: "code"; client_id: string; redirect_uri: string; scope: ("email" | "openid" | "offline_access" | "profile")[]; code_challenge: string; code_challenge_method: "S256"; state?: string | undefined; }; } | { success: false; error: z.core.$ZodError<{ response_type: "code"; client_id: string; redirect_uri: string; scope: ("email" | "openid" | "offline_access" | "profile")[]; code_challenge: string; code_challenge_method: "S256"; state?: string | undefined; }>; data: { response_type: "code"; client_id: string; redirect_uri: string; scope: ("email" | "openid" | "offline_access" | "profile")[]; code_challenge: string; code_challenge_method: "S256"; state?: string | undefined; }; }) & { target: "query"; }, c: import("hono").Context<import("hono").Env, string, {}>): Promise<(Response & import("hono").TypedResponse<{ error: string; }, 400, "json">) | (Response & import("hono").TypedResponse<undefined, 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308, "redirect">) | undefined> {
    if (!res.success) {
        const hasInvalidRedirectUri = res.error.issues.some(issue => issue.path[0] === "redirect_uri");
        if (hasInvalidRedirectUri) return c.json({ error: "Redirect URI Mismatch" }, 400);
        const hasNoClientId = res.error.issues.some(issue => issue.path[0] === "client_id");
        if (hasNoClientId) return c.json({ error: "Invalid Client ID" }, 400);
        const client = await applicationRepository.findById(res.data.client_id);
        if (!client) return c.json({ error: "Invalid client id" }, 400);
        if (client.redirectUri !== res.data.redirect_uri) return c.json({ error: "Redirect URI Mismatch" }, 400);

        const url = new URL(client.redirectUri);
        if (res.data.state) url.searchParams.set("state", res.data.state);
        for (const issue of res.error.issues) {
            if (issue.path[0] == "response_type") {
                url.searchParams.set("error", "unsupported_response_type");
                return c.redirect(url);
            }
            if (issue.path[0] == "scope") {
                url.searchParams.set("error", "invalid_scope");
                return c.redirect(url);
            }
        }
        url.searchParams.set("error", "invalid_request");
        return c.redirect(url);
    }
};