import type { Context } from "hono";
import { deleteCookie, setSignedCookie,  } from "hono/cookie";
import { AUTH_COOKIE_NAME, COOKIE_TTL } from "../utils/constants";
import type { MyEnv } from "../utils/types";

export async function setSecureCookie(sessionId: string, c: Context<MyEnv>) {
    await setSignedCookie(c, AUTH_COOKIE_NAME, sessionId, c.env.COOKIE_SECRET, {
        maxAge: COOKIE_TTL,
        httpOnly: true,
        secure: c.env.NODE_ENV == "production",
        sameSite: "Lax",
        path: "/"
    })
}

export function clear(name: string, c: Context<MyEnv>) {
    return deleteCookie(c, name)
}