import { csrf } from "hono/csrf";
import { renderer } from "../middleware/renderer";
import { Signup } from "../ui/pages/signup";
import { factory } from "../utils/createHono";
import { alreadyLoggedIn } from "../middleware/alreadyLoggedIn";
import { SigninPage } from "../ui/pages/signin";

export const pagesRoutes = factory.createApp()

pagesRoutes.use(renderer)

pagesRoutes
    .get("/")
    .get("/signup", alreadyLoggedIn,
        c => c.render(<Signup />, { title: "Signup" })
    )
    .get("/signin", alreadyLoggedIn,
        c => c.render(<SigninPage />, {title: "Sign In"} )
    )
