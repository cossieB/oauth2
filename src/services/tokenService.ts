import { exportJWK, importPKCS8, importSPKI, SignJWT } from "jose";
import { db } from "../drizzle/db";
import { keys } from "../drizzle/schema";
import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";
import type { AuthorizeSchema } from "../utils/zodSchemas";
import type { User } from "../utils/models";
import type z from "zod";

export async function generateJwt(claims: Record<string, unknown>) {
    const [key] = await db.select().from(keys).orderBy(desc(keys.keyId)).limit(1)
    const privateKey = await importPKCS8(key.privateKey, "ES256");
    return new SignJWT(claims)
        .setAudience("https://cossie.dev")
        .setIssuer(env.ISSUER)
        .setExpirationTime("15m")
        .setIssuedAt()
        .setProtectedHeader({
            alg: "ES256",
            kid: key.keyId.toString()
        })
        .sign(privateKey)
}

export async function getJWK(key: string, kid: string) {
    const publicKey = await importSPKI(key, "ES256");
    const jwk = await exportJWK(publicKey)
    jwk.use = "sig"
    jwk.alg = "EC256"
    jwk.kid = kid
    return jwk
}

export function getIdTokenClaims(scope: z.infer<typeof AuthorizeSchema>["scope"], user: Omit<User, "passwordHash">) {
    if (!scope.includes("openid")) return
    const claims: Record<string, unknown> = {
        sub: user.userId
    };
    if (scope.includes("email")) {
        claims.email = user.email
        claims.email_verified = Boolean(user.emailVerifiedAt)
    }
    if (scope.includes("profile")) {
        claims.name = user.name
        claims.surname = user.surname
        claims.image = user.image
    }
    return claims
}