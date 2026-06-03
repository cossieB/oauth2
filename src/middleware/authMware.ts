import { factory } from "../utils/createHono";
import { type Authed } from "../utils/types";
import { HttpStatusCode } from "../utils/statusCodes";
import { createMiddleware } from "hono/factory";
import { db } from "../drizzle/db";
import { sessions } from "../drizzle/schema";
import { authCookie, dataCookie } from "../services/cookieService";

export const authenticateMware = factory.createMiddleware(async (c, next) => {
    const cachedUser = await dataCookie.getUser(c);
    if (cachedUser) {
        c.set("user", cachedUser)
        return next()
    }
    const sessionId = await authCookie.get(c);
    if (!sessionId) {
        c.set("user", null);
        return next()
    }
    const session = await db.query.sessions.findFirst({
        where: {
            AND: [{
                sessionId,
                expiresAt: {
                    gt: new Date
                }
            }]
        },
        with: {
            user: {
                columns: {
                    passwordHash: false,
                },
            }
        }
    })
    if (!session || !session.user) {
        authCookie.delete(c)
        dataCookie.delete(c)
        c.set("user", null);
        return next()
    }
    await Promise.all([db.update(sessions).set({ lastActivity: new Date }), dataCookie.set(session.user, c)])
    c.set("user", session.user)
    return next()
})

export const authedMware = createMiddleware<Authed>(async (c, next) => {
    if (c.var.user)
        return next()
    const url = new URL(c.req.url)
    url.searchParams.set("navigateTo", url.pathname)
    url.pathname = "/signin"
    return c.redirect(url, HttpStatusCode.TEMPORARY_REDIRECT);
})