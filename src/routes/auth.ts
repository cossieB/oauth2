import { zValidator } from "@hono/zod-validator";
import { factory } from "../utils/createHono";
import { SignupSchema } from "../zodSchemas";
import { randomUUID } from "node:crypto"
import { csrf } from "hono/csrf";
import titleCase from "../utils/titleCase";
import { setSignedCookie } from "hono/cookie";
import { validatorHook } from "../utils/formateZodError";
import { AUTH_COOKIE_NAME } from "../utils/constants";
import { hashPassword } from "../services/passwordService";
import { createUser } from "../repositories/authRepository";

export const authRoutes = factory.createApp()

authRoutes
    .post(
        "/signup",
        csrf(),
        zValidator("form", SignupSchema, validatorHook),
        async c => {
            const form = c.req.valid("form");
            const hash = await hashPassword(form.password)

            const record = await createUser({ ...form, hash }, c.env.DB);

            const sessionId = randomUUID();
            const ttl = 60 * 60 * 24
            await c.env.KV.put(sessionId, JSON.stringify(record), { expirationTtl: ttl })

            await setSignedCookie(c, AUTH_COOKIE_NAME, sessionId, c.env.COOKIE_SECRET, {
                maxAge: ttl,
                httpOnly: true,
                secure: c.env.NODE_ENV == "production",
                sameSite: "Lax",
                path: "/"
            })
            return c.text("OK")
        }
    )