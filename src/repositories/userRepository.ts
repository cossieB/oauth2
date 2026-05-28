import { randomUUID } from "node:crypto";
import titleCase from "../utils/titleCase";
import { AppError } from "../utils/AppError";
import type { User } from "../utils/types";

type U = {
    username: string,
    email: string,
    hash: string
}

export async function createUser(user: U, DB: D1Database) {
    try {
        return await DB
            .prepare("INSERT INTO users (user_id, username, email, password) VALUES (?,?,?,?) RETURNING user_id, username, email, image")
            .bind(
                randomUUID(),
                user.username,
                user.email,
                user.hash,
            ).first() as { user_id: string, username: string, email: string, image: string };
    } 
    catch (error) {
        const duplicateField = getDuplicateField((error as Error).message)
        if (!duplicateField) throw error
        throw new AppError(`${titleCase(duplicateField)} has already been taken`, 400)
    }
}

function getDuplicateField(errorMessage: string) {
    const match = errorMessage.match(/users\.(\w+)/);
    return match ? match[1] : null
}

export async function getUser(identifier: string, DB: D1Database) {
    return await DB.prepare("SELECT * FROM users WHERE username = ? OR email = ?")
        .bind(identifier, identifier)
        .first() as User | null
}