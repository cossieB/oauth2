import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema"
import { relations } from "./relations";

export const db = drizzle(env.DB, {
    schema, 
    relations, 
    logger: env.NODE_ENV == "development"
})