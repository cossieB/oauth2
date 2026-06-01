import { createHash } from "node:crypto";

export function sha256Base64Url(str: string): string {
    return createHash("sha256").update(str).digest().toString("base64url")
}