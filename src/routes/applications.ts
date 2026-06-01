import { zValidator } from "@hono/zod-validator";
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
            const [client] = await applicationRepository.createApplication({
                ...form,
                clientId,
                logo: key
            }, c.var.user.userId)

            return c.json({client, navigateTo: "/applications/owned"}, 201)
        }
    )
    .post(
        "/applications/:id",
        authedMware,
        zValidator("form", AppCreateSchema, validatorHook),
        async c => {
            const form = c.req.valid("form")
            const clientId = c.req.param("id")
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
            const clients = await applicationRepository.editApplication({
                ...form,
                logo: key,
                clientId
            }, c.var.user.userId)
            if (clients.length == 0) return c.notFound()
            return c.json({client: clients[0], navigateTo: "/applications/owned"})
        }
    )
    .delete(
        "/applications/:id",
        authedMware,
        async c => {
            const clients = await applicationRepository.deleteApplication(c.req.param("id"), c.var.user.userId)
            if (clients.length == 0) return c.notFound();
            return c.json({client: clients[0], navigateTo: "/applications/owned"})
        }
    )