import { deleteCookie, getSignedCookie } from "hono/cookie";
import { factory } from "../utils/createHono";
import { AUTH_COOKIE_NAME } from "../utils/constants";
import { type MyEnv } from "../utils/types";
import { HttpStatusCode } from "../utils/statusCodes";
import { createMiddleware } from "hono/factory";
import { db } from "../drizzle/db";
import type { User } from "../models";

export const authenticateMware = factory.createMiddleware(async (c, next) => {
    const sessionId = await getSignedCookie(c, c.env.COOKIE_SECRET, AUTH_COOKIE_NAME)
    if (!sessionId) {
        c.set("user", null);
        return next()
    }
    const user = await db.query.users.findFirst({
        where: {
            sessions: {
                sessionId
            }
        },
        columns: {
            passwordHash: false,            
        }
    })
    if (!user) deleteCookie(c, AUTH_COOKIE_NAME);
    c.set("user", user)
    c.set("sessionId", sessionId)
    return next()
})
type T = MyEnv & {
    Variables: {
        user: User,
        sessionId: string
    }
}
export const authedMware = createMiddleware<T>(async (c, next) => {
    if (!c.var.user) return c.redirect("/signin", HttpStatusCode.TEMPORARY_REDIRECT);
    return next()
})