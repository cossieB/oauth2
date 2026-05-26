import { Layout } from "../ui/Layout";
import { factory } from "../utils/createHono";

export const renderer = factory.createMiddleware(async (c, next) => {
            c.setRenderer((content, head) => {
                return c.html(
                    <Layout title={head.title}>
                        {content as any}
                    </Layout>
                )
            })
            await next()
        })