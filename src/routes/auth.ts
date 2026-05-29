import { zValidator } from "@hono/zod-validator";
import { factory } from "../utils/createHono";
import { ProfileSchema, SigninSchema, SignupSchema } from "../zodSchemas";
import { randomUUID } from "node:crypto"
import { validatorHook } from "../utils/formateZodError";
import { AUTH_COOKIE_NAME, COOKIE_TTL } from "../utils/constants";
import { hashPassword, verifyPassword } from "../services/passwordService";
import * as authRepository from "../repositories/userRepository";
import { HttpStatusCode } from "../utils/statusCodes";
import * as cookieService from "../services/cookieService";
import { authedMware } from "../middleware/authMware";

export const authRoutes = factory.createApp()

// authRoutes.use(csrf())

authRoutes
    .post(
        "/signup",
        zValidator("form", SignupSchema, validatorHook),
        async c => {
            const form = c.req.valid("form");
            const hash = await hashPassword(form.password)
            const record = await authRepository.createUser({ ...form, hash }, c.env.DB);
            const sessionId = randomUUID();
            await c.env.KV.put(sessionId, JSON.stringify(record), { expirationTtl: COOKIE_TTL })
            await cookieService.setSecureCookie(sessionId, c)
            return c.text("OK")
        }
    )
    .post(
        "/signin",
        zValidator("form", SigninSchema, validatorHook),
        async c => {
            const badRequestResponse = c.json({ errors: ["Invalid credentials"] }, HttpStatusCode.BAD_REQUEST);
            const { identifier, password } = c.req.valid("form")
            const record = await authRepository.getUser(identifier, c.env.DB)
            if (!record) return badRequestResponse
            const isValid = await verifyPassword(password, record.password);
            if (!isValid) return badRequestResponse;
            const sessionId = randomUUID();
            const { password: p, email_verified_at, ...rest } = record
            await c.env.KV.put(sessionId, JSON.stringify(rest), { expirationTtl: COOKIE_TTL })
            await cookieService.setSecureCookie(sessionId, c)
            return c.text("OK")
        }
    )
    .get(
        "/logout",
        async c => {
            const sessionId = cookieService.clear(AUTH_COOKIE_NAME, c);
            sessionId && await c.env.KV.delete(sessionId);
            return c.redirect("/")
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
                key = `/oauth/users/${c.var.user.user_id}`;
                const buffer = await image.arrayBuffer();
                await c.env.R2.put(key, buffer, {
                    httpMetadata: {
                        cacheControl: "public, max-age=86400"
                    }
                })
            }
            const record = key ?
                await c.env.DB.prepare("UPDATE users SET name = ?, surname = ?, image = ? WHERE user_id = ? RETURNING user_id, username, email, image, name, surname")
                    .bind(name, surname, key, c.var.user.user_id)
                    .first() :
                await c.env.DB.prepare("UPDATE users SET name = ?, surname = ? WHERE user_id = ? RETURNING user_id, username, email, image, name, surname")
                    .bind(name, surname, c.var.user.user_id)
                    .first()
                    console.log(await c.env.KV.get(c.var.sessionId))
            await c.env.KV.put(c.var.sessionId, JSON.stringify(record), {expirationTtl: COOKIE_TTL})
            return c.json(record)
        }
    )