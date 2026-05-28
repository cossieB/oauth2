import { csrf } from "hono/csrf";
import { renderer } from "../middleware/renderer";
import { Signup } from "../ui/pages/signup";
import { factory } from "../utils/createHono";

export const pagesRoutes = factory.createApp()

pagesRoutes.use(csrf(), renderer)

pagesRoutes
    .get("/")
    .get("/signup", c => {
        if (c.var.user)
            return c.redirect("/", 307)
        return c.render(<Signup />, { title: "Signup" })
    })