import type { User } from "./models"

export type MyEnv = {
    Bindings: CloudflareBindings,
    Variables: {
        user?: Omit<User, "passwordHash"> | null
    }
}

export type Authed = MyEnv & {
    Variables: {
        user: NonNullable<MyEnv["Variables"]['user']>
    }
}
