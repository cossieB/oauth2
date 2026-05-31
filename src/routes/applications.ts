import { zValidator } from "@hono/zod-validator";
import { db } from "../drizzle/db";
import { authedMware } from "../middleware/authMware";
import { factory } from "../utils/createHono";
import { AppCreateSchema } from "../utils/zodSchemas";
import { validatorHook } from "../utils/formateZodError";
import * as applicationRepository from "../repositories/applicationRepository"
import { randomUUID } from "node:crypto";

export const applicationsRoutes = factory.createApp()

applicationsRoutes
    .post(
        "/applications",
        authedMware,
        zValidator("form", AppCreateSchema, validatorHook),
        async c => {
            const form = c.req.valid("form");
            const clientId = randomUUID()
            let key: string | undefined
            if (form.logo) {
                key = `/oauth/apps/${clientId}`
                const buffer = await form.logo.arrayBuffer();
                await c.env.R2.put(key, buffer, {
                    httpMetadata: {
                        cacheControl: "public, max-age=86400"
                    }
                })
            }
            const client = await applicationRepository.createApplication({
                ...form,
                clientId,
                logo: key
            }, c.var.user.userId)

            return c.json(client[0], 201)
        }
    )