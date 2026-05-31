import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie,  } from "hono/cookie";
import type { MyEnv } from "../utils/types";
import type { User } from "../models";

const AUTH_COOKIE_NAME = "iff"
const COOKIE_TTL = 60 * 60 * 24 * 28

export const authCookie = {
    set: setAuthCookie,
    delete: (c: Context<MyEnv>) => deleteAuthCookie("iff", c),
    get: getAuthCookie
}

export const dataCookie = {
    getUser: getUserFromDataCookie,
    set: setDataCookie,
    delete: (c: Context) => deleteAuthCookie("data", c),    
}

async function setAuthCookie(sessionId: string, c: Context<MyEnv>) {
    await setSignedCookie(c, AUTH_COOKIE_NAME, sessionId, c.env.COOKIE_SECRET, {
        maxAge: COOKIE_TTL,
        httpOnly: true,
        secure: c.env.NODE_ENV == "production",
        sameSite: "Lax",
        path: "/"
    })
}

function deleteAuthCookie(name: string, c: Context<MyEnv>) {
    return deleteCookie(c, name)
}

function getAuthCookie(c: Context<MyEnv>) {
    return getSignedCookie(c, c.env.COOKIE_SECRET, AUTH_COOKIE_NAME)
}

async function setDataCookie(data: UserData, c: Context<MyEnv>) {
    await setSignedCookie(c, "data", JSON.stringify(data), c.env.COOKIE_SECRET, {
        maxAge: 60 * 5,
        httpOnly: true,
        secure: c.env.NODE_ENV == "production",
        sameSite: "Lax",
        path: "/"
    })
}

async function getUserFromDataCookie(c: Context<MyEnv>) {
    const cookie =  await getSignedCookie(c, c.env.COOKIE_SECRET, "data")
    if (!cookie) return null
    return JSON.parse(cookie) as UserData
} 

type UserData = Omit<User, "passwordHash">