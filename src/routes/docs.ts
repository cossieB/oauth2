import { etag } from "hono/etag";
import { factory } from "../utils/createHono";

export const docsRoutes = factory.createApp()

docsRoutes.get("/.well-known/openid-configuration", etag(), c => c.json({
    issuer: c.env.ISSUER,
    authorization_endpoint: `${c.env.ISSUER}/authorize`,
    token_endpoint: `${c.env.ISSUER}/token`,
    revocation_endpoint: `${c.env.ISSUER}/revoke`,
    jwks_uri: `${c.env.ISSUER}/.well-known/jwks`,
    userinfo_endpoint: `${c.env.ISSUER}/userinfo`,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    subject_types_supported: ["public"],
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
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code", "refresh_token",]
}))