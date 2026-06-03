import { zValidator } from "@hono/zod-validator";
import { factory } from "../utils/createHono";
import { ProfileSchema, SigninSchema, SignupSchema } from "../utils/zodSchemas";
import { validatorHook } from "../utils/formateZodError";
import { hashPassword, verifyPassword } from "../services/passwordService";
import * as authRepository from "../repositories/userRepository";
import { HttpStatusCode } from "../utils/statusCodes";
import { authedMware } from "../middleware/authMware";
import { getConnInfo } from "hono/cloudflare-workers";
import type { Context } from "hono";
import type { MyEnv } from "../utils/types";
import { authCookie, dataCookie } from "../services/cookieService";

export const authRoutes = factory.createApp()

// authRoutes.use(csrf())

const getClientInfo = (c: Context<MyEnv>) => ({
    ip: getConnInfo(c).remote.address ?? "127.0.0.1",
    userAgent: c.req.header("User-Agent") ?? ""
})

authRoutes
    .post(
        "/signup",
        zValidator("form", SignupSchema, validatorHook),
        async c => {
            const form = c.req.valid("form");
            const passwordHash = await hashPassword(form.password);
            const clientInfo = getClientInfo(c)
            const sessionId = await authRepository.createUser({ ...form, passwordHash }, clientInfo);
            await authCookie.set(sessionId, c)
            const redirect = c.req.query("navigateTo")
            return c.json({ navigateTo: redirect ?? "/profile" })
        }
    )
    .post(
        "/signin",
        zValidator("form", SigninSchema, validatorHook),
        async c => {
            const badRequestResponse = c.json({ errors: ["Invalid credentials"] }, HttpStatusCode.BAD_REQUEST);
            const { identifier, password } = c.req.valid("form")
            const record = await authRepository.getUser(identifier);
            if (!record) return badRequestResponse
            const isValid = await verifyPassword(password, record.passwordHash);
            if (!isValid) return badRequestResponse;
            const clientInfo = getClientInfo(c)
            const { insertSession, sessionId } = authRepository.createSession(record.userId, clientInfo);
            await insertSession;
            await authCookie.set(sessionId, c)
            const redirect = c.req.query("navigateTo");
            return c.json({ navigateTo: redirect ?? "/profile" })
        }
    )
    .get(
        "/logout",
        async c => {
            authCookie.delete(c);
            dataCookie.delete(c);
            return c.redirect("/signin")
        }
    )
    .post(
        "/profile",
        authedMware,
        zValidator("form", ProfileSchema, validatorHook),
        async c => {
            const { name, surname, image } = c.req.valid("form");
            let key: string | undefined
            if (image) {
                key = `/oauth/users/${c.var.user.userId}`;
                const buffer = await image.arrayBuffer();
                await c.env.R2.put(key, buffer, {
                    httpMetadata: {
                        cacheControl: "public, max-age=86400"
                    }
                })
            }
            const [record] = (await authRepository.updateUser({
                name, surname, image: key
            }))
            dataCookie.delete(c)

            return c.json(record)
        }
    )
    