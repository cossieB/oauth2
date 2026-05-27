import { zValidator } from "@hono/zod-validator";
import { Signup } from "../ui/pages/signup";
import { factory } from "../utils/createHono";
import { SignupSchema } from "../zodSchemas";
import { randomBytes, randomUUID, scrypt as s } from "node:crypto"
import { csrf } from "hono/csrf";
import { promisify } from "node:util";
import titleCase from "../utils/titleCase";
import { setSignedCookie } from "hono/cookie";
import { validatorHook } from "../utils/formateZodError";

const scrypt = promisify(s)

export const signupRoutes = factory.createApp()

signupRoutes
    .get("/pages/signup", c => c.render(<Signup />, { title: "Signup" }))
    .post(
        "/signup",
        csrf(),
        zValidator("form", SignupSchema, validatorHook),
        async c => {
            const form = c.req.valid("form");
            const salt = randomBytes(16).toHex()
            const derivedKey = await scrypt(form.password, salt, 32) as Buffer<ArrayBuffer>
            const hash = derivedKey.toHex()
            try {
                const record = await c.env.DB
                    .prepare("INSERT INTO users (user_id, username, email, password) VALUES (?,?,?,?) RETURNING user_id, username, email, image")
                    .bind(
                        randomUUID(),
                        form.username,
                        form.email,
                        `${salt}:${hash}`,
                    ).first();
                console.log(record)
                const sessionId = randomUUID();
                const ttl = 60 * 60 * 24
                await c.env.KV.put(sessionId, JSON.stringify(record), {expirationTtl: ttl})
                await setSignedCookie(c, "iff", sessionId, c.env.COOKIE_SECRET, {
                    maxAge: ttl,
                    httpOnly: true,
                    secure: c.env.NODE_ENV == "production",
                    sameSite: "Lax",
                    path: "/"   
                })
                return c.text("")
            }
            catch (error) {
                const duplicateField = getDuplicateField((error as Error).message)
                if (!duplicateField) throw error
                return c.json({errors: [`${titleCase(duplicateField)} has already been taken`]}, 400)
            }
        }
    )

function getDuplicateField(errorMessage: string) {
    const match = errorMessage.match(/users\.(\w+)/);
    return match ? match[1] : null
}
