import { zValidator } from "@hono/zod-validator";
import { factory } from "../utils/createHono";
import { SigninSchema, SignupSchema } from "../zodSchemas";
import { randomUUID } from "node:crypto"
import { csrf } from "hono/csrf";
import { setSignedCookie } from "hono/cookie";
import { validatorHook } from "../utils/formateZodError";
import { AUTH_COOKIE_NAME } from "../utils/constants";
import { hashPassword, verifyPassword } from "../services/passwordService";
import * as authRepository from "../repositories/userRepository";
import { HttpStatusCode } from "../utils/statusCodes";

export const authRoutes = factory.createApp()

// authRoutes.use(csrf())

const ttl = 60 * 60 * 24
authRoutes
    .post(
        "/signup",
        zValidator("form", SignupSchema, validatorHook),
        async c => {
            const form = c.req.valid("form");
            const hash = await hashPassword(form.password)

            const record = await authRepository.createUser({ ...form, hash }, c.env.DB);

            const sessionId = randomUUID();
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
    .post(
        "/signin",
        zValidator("form", SigninSchema, validatorHook),
        async c => {
            const badRequestResponse = c.json({errors: ["Invalid credentials"]}, HttpStatusCode.BAD_REQUEST);
            const { identifier, password } = c.req.valid("form")
            const record = await authRepository.getUser(identifier, c.env.DB)
            if (!record) return badRequestResponse
            const isValid = await verifyPassword(password, record.password);
            if (!isValid) return badRequestResponse;
            const sessionId = randomUUID();
            const {password: p, email_verified_at, ...rest} = record
            await c.env.KV.put(sessionId, JSON.stringify(rest), { expirationTtl: ttl })                        
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