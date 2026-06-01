import type z from "zod";
import { AppCreateSchema } from "../utils/zodSchemas";
import { db } from "../drizzle/db";
import { clients } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";

type App = Omit<z.infer<typeof AppCreateSchema>, "logo"> & { logo?: string, clientId: string }

export function createApplication(application: App, userId: string) {
    return db.insert(clients).values({
        ...application,
        userId
    })
        .returning()
}

export function findAll(filters: {ownerId?: string, consentee?: string}) {
    return db.query.clients.findMany({
        where: {
            userId: filters.ownerId,
            usersViaUserConsent: {
                userId: filters.consentee
            }
        }
    })
}

export function deleteApplication(clientId: string, userId: string) {
    return db.delete(clients).where(and(
        eq(clients.clientId, clientId),
        eq(clients.userId, userId)
    ))
        .returning()
}

export function editApplication(application: App, userId: string) {
    const {clientId, ...rest} = application
    return db.update(clients).set(rest).where(and(
        eq(clients.clientId, clientId),
        eq(clients.userId, userId)
    ))
    .returning()
}