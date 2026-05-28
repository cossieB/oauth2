import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)
const KEY_LEN = 32

export async function hashPassword(password: string) {
    const salt = randomBytes(16)
    const derivedKey = await scryptAsync(password, salt, KEY_LEN) as Buffer<ArrayBuffer>
    const saltHex = salt.toString("hex");
    const hashHex = derivedKey.toString("hex");
    return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(requestPassword: string, hashFromDb: string) {
    const [salt, hash] = hashFromDb.split(":")
    const saltBuf = Buffer.from(salt)
    const hashBuf = Buffer.from(hash)

    const derivedKey = await scryptAsync(requestPassword, saltBuf, KEY_LEN) as Buffer
    return timingSafeEqual(derivedKey, hashBuf)
}
