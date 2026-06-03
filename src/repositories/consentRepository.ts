import { and, eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { userConsent, clients, users } from "../drizzle/schema";

export async function getConsentedApps(userId: string) {
    return await db
        .select()
        .from(userConsent)
        .innerJoin(clients, eq(userConsent.clientId, clients.clientId))
        .innerJoin(users, eq(clients.userId, users.userId))
        .where(eq(userConsent.userId, userId))
}

export async function revokeConsent(userId: string, clientId: string) {
    await db
        .delete(userConsent)
        .where(and(
            eq(userConsent.userId, userId),
            eq(userConsent.clientId, clientId),
        ))
}