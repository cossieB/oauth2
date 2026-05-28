import { deleteCookie, getSignedCookie } from "hono/cookie";
import { factory } from "../utils/createHono";
import { AUTH_COOKIE_NAME } from "../utils/constants";
import type { User } from "../utils/types";

export const authenticateMware = factory.createMiddleware(async (c, next) => {
    const sessionId = await getSignedCookie(c, c.env.COOKIE_SECRET, AUTH_COOKIE_NAME)
    if (!sessionId) {
        c.set("user", null);
        return next()
    }
    const user = await c.env.KV.get(sessionId, "json") as User | null;
    if (!user) deleteCookie(c, AUTH_COOKIE_NAME)
    c.set("user", user)
    return next()
})