import { factory } from "../utils/createHono";

export const devRoute = factory.createApp()

devRoute.get("/oauth/:var{(users|apps)}/*", async c => {
    const img = await c.env.R2.get(c.req.path)
    if (!img) return c.notFound();
    return c.body(img.body)
})