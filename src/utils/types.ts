export type MyEnv = {
    Bindings: CloudflareBindings,
    Variables: {
        user: User | null
    }
}

export type User = {
    user_id: string,
    email: string,
    image: string | undefined | null,
    username: string
}