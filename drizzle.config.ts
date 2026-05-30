import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/drizzle/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/e0bbf4d80c7b0ad387218905fb5b32fd5d6c9bc5983ea846838b10cc393926e8.sqlite"
    },
    out: "./src/drizzle/"
})