import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "../ui/components/Layout";

export const renderer = jsxRenderer(({children}) => (
    <Layout>
        {children}
    </Layout>
))