import { randomUUID } from "node:crypto";
import titleCase from "../utils/titleCase";
import { AppError } from "../utils/AppError";
import { db } from "../drizzle/db";
import { sessions, users } from "../drizzle/schema";
import type { User } from "../utils/models";

type U = {
    username: string,
    email: string,
    passwordHash: string,
}

type C = {
    ip: string,
    userAgent: string
}

export async function createUser(user: U, client: C) {
    const userId = randomUUID()
    try {
        const insertUser = db.insert(users).values({
            ...user,
            userId
        })
        const { insertSession, sessionId } = createSession(userId, client)
        await db.batch([insertUser, insertSession])
        return sessionId
    }
    catch (error) {
        const duplicateField = getDuplicateField((error as Error).message)
        if (!duplicateField) throw error
        throw new AppError(`${titleCase(duplicateField)} has already been taken`, 400)
    }
}

export function createSession(userId: string, client: C) {
    const sessionId = randomUUID();
    const now = new Date()
    const insertSession = db.insert(sessions).values({
        createdAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        lastActivity: now,
        sessionId,
        userId,
        ...client
    })
    return { insertSession, sessionId }
}

export function getUser(identifier: string) {
    return db.query.users.findFirst({
        where: {
            OR: [{
                email: identifier,
                username: identifier
            }]
        },
        columns: {
            userId: true,
            emailVerifiedAt: true,
            passwordHash: true
        }
    })
}

export function updateUser(user: Pick<Partial<User>, "name" | "surname" | "image">) {
    return db
        .update(users)
        .set(user)
        .returning({
            userId: users.userId,
            name: users.name,
            surname: users.surname,
            image: users.image,
            email: users.email,
            emailVerifiedAt: users.emailVerifiedAt,
            username: users.username
        })
}

function getDuplicateField(errorMessage: string) {
    const match = errorMessage.match(/users\.(\w+)/);
    return match ? match[1] : null
}