import { factory } from "../utils/createHono";
import { HttpStatusCode } from "../utils/statusCodes";

export const alreadyLoggedIn = factory.createMiddleware(async (c, next) => {
    if (!c.var.user) return next()
    // redirect while keeping query params
    const url = new URL(c.req.url);
    url.pathname = "/profile"
    return c.redirect(url, HttpStatusCode.TEMPORARY_REDIRECT)
})