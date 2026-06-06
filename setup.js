import { exportPKCS8, generateKeyPair, exportSPKI } from "jose";
import { execSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";

execSync("npx drizzle-kit push")

const db = new DatabaseSync(".wrangler/state/v3/d1/miniflare-D1DatabaseObject/e0bbf4d80c7b0ad387218905fb5b32fd5d6c9bc5983ea846838b10cc393926e8.sqlite");

const pair = await generateKeyPair("ES256", {extractable: true})

const [privateKey, publicKey] = await Promise.all([
    exportPKCS8(pair.privateKey),    
    exportSPKI(pair.publicKey)
]) 

const insertKeys = db.prepare("INSERT INTO keys (private_key, public_key) VALUES (?, ?)")
insertKeys.run(privateKey, publicKey)