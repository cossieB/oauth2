import { createFactory } from "hono/factory";
import { type MyEnv } from "./types";

export const factory = createFactory<MyEnv>({
    defaultAppOptions: {
        strict: false
    },
})