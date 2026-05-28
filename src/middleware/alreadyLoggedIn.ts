import { factory } from "../utils/createHono";
import { HttpStatusCode } from "../utils/statusCodes";

export const alreadyLoggedIn = factory.createMiddleware(async (c, next) => {
    if (c.var.user) return c.redirect("/", HttpStatusCode.TEMPORARY_REDIRECT)
    return next()
})