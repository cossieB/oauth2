import { etag } from "hono/etag";
import { factory } from "../utils/createHono";
import { db } from "../drizzle/db";
import { keys as keysTable } from "../drizzle/schema";
import { cors } from "hono/cors";
import { getJWK } from "../services/tokenService";

export const docsRoutes = factory.createApp()

docsRoutes
    .get("/.well-known/openid-configuration", cors(), etag(), c => c.json({
        issuer: c.env.ISSUER,
        authorization_endpoint: `${c.env.ISSUER}/authorize`,
        token_endpoint: `${c.env.ISSUER}/token`,
        revocation_endpoint: `${c.env.ISSUER}/revoke`,
        jwks_uri: `${c.env.ISSUER}/.well-known/jwks`,
        userinfo_endpoint: `${c.env.ISSUER}/userinfo`,
        response_types_supported: ["code"],
        response_modes_supported: ["query"],
        subject_types_supported: ["public"],
        token_endpoint_auth_methods_supported: [
            "none"
        ],
        id_token_signing_alg_values_supported: [
            "ES256"
        ],
        scopes_supported: [
            "openid", "email", "profile", "offline_access"
        ],
        claims_supported: [
            "aud",
            "email",
            "email_verified",
            "exp",
            "name",
            "surname",
            "iat",
            "iss",
            "name",
            "image",
            "sub"
        ],
        authorization_response_iss_parameter_supported: true,
        code_challenge_methods_supported: ["S256"],
        grant_types_supported: ["authorization_code", "refresh_token",]
    }))
    .get("/.well-known/jwks", cors(), etag(), async c => {
        const keys = await db.select({publicKey: keysTable.publicKey, kid: keysTable.keyId}).from(keysTable);
        const jwks = await Promise.all(keys.map(k => getJWK(k.publicKey, k.kid.toString())))
        return c.json({
            keys: jwks
        })
    })