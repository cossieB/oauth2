import { importPKCS8, SignJWT } from "jose";
import { db } from "../drizzle/db";
import { keys } from "../drizzle/schema";
import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";

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

