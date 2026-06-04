import { randomUUID } from "node:crypto";
import { db } from "../drizzle/db";
import { refreshTokens, userConsent } from "../drizzle/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";

export async function createRefreshToken(consentId: number, scopes: string[]) {
    await db.update(refreshTokens).set({
        revokedAt: new Date()
    })
    .where(and(
        isNull(refreshTokens.revokedAt),
        eq(refreshTokens.consentId, consentId)
    ))
    const token = randomUUID()
    const [refreshToken] = await db.insert(refreshTokens).values({        
        token,
        consentId,        
    })
    .returning()
    return refreshToken
}

export async function deleteRefreshToken(token: string, clientId: string) {
    
    return db.delete(refreshTokens).where(
        and(
            eq(refreshTokens.token, token),
            inArray(refreshTokens.consentId, db
                .select({consentId: userConsent.consentId})
                .from(userConsent)
                .where(eq(userConsent.clientId, clientId))
            )
        )
    )
}

export async function deleteByConsentId(consentId: number) {
    return db.delete(refreshTokens).where(eq(refreshTokens.consentId, consentId))
}

export async function getRefreshToken(token: string) {
    return db.query.refreshTokens.findFirst({
        where:{
            token
        }
    })
}