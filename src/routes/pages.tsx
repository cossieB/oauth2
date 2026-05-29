import { csrf } from "hono/csrf";
import { renderer } from "../middleware/renderer";
import { Signup } from "../ui/pages/signup";
import { factory } from "../utils/createHono";
import { alreadyLoggedIn } from "../middleware/alreadyLoggedIn";
import { SigninPage } from "../ui/pages/signin";
import { authedMware } from "../middleware/authMware";
import { ProfilePage } from "../ui/pages/profile";

export const pagesRoutes = factory.createApp()

pagesRoutes.use(renderer)

pagesRoutes
    .get("/")
    .get("/signup", alreadyLoggedIn,
        c => c.render(<Signup />, { title: "Signup" })
    )
    .get("/signin", alreadyLoggedIn,
        c => c.render(<SigninPage />, { title: "Sign In" })
    )
    .get("/profile", authedMware,
        c => c.render(<ProfilePage />, { title: "Profile" }))
