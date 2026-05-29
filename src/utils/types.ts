export type MyEnv = {
    Bindings: CloudflareBindings,
    Variables: {
        user: User | null
        sessionId?: string
    }
}

export type User = {
    user_id: string,
    email: string,
    email_verified_at: number
    image: string | undefined | null,
    username: string
    password: string
    name?: string
    surname?: string
}