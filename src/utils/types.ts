import type { User } from "../models"

export type MyEnv = {
    Bindings: CloudflareBindings,
    Variables: {
        user?: Pick<User, "userId" | "email" | "image" | "surname" | "username" | "name"> | null
        sessionId?: string
    }
}