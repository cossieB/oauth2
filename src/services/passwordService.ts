import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)
const KEY_LEN = 32

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex")
    const derivedKey = await scryptAsync(password, salt, KEY_LEN) as Buffer<ArrayBuffer>
    const hash = derivedKey.toString("hex");
    return `${salt}:${hash}`;
}

export async function verifyPassword(requestPassword: string, hashFromDb: string) {
    const [salt, hash] = hashFromDb.split(":")
    const hashBuf = Buffer.from(hash, "hex")
    const derivedKey = await scryptAsync(requestPassword, salt, KEY_LEN) as Buffer
    return timingSafeEqual(derivedKey, hashBuf)
}
