import { csrf } from "hono/csrf";
import { renderer } from "../middleware/renderer";
import { Signup } from "../ui/pages/signup";
import { factory } from "../utils/createHono";
import { alreadyLoggedIn } from "../middleware/alreadyLoggedIn";
import { SigninPage } from "../ui/pages/signin";
import { authedMware } from "../middleware/authMware";
import { ProfilePage } from "../ui/pages/profile";
import { db } from "../drizzle/db";
import { YourApplications } from "../ui/pages/applications";
import { AddApplication } from "../ui/pages/add-app";

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
    .get(
        "/applications/owned", authedMware,
        async c => {
            const apps = await db.query.clients.findMany({
                where: {
                    userId: c.var.user.userId
                }
            })
            return c.render(<YourApplications apps={apps} />, {title: "Your Applications"})
        }
    )
    .get(
        "/applications/create", authedMware,
        c => c.render(<AddApplication />, {title: "Add Application"})
    )
