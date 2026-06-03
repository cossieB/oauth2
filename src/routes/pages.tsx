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
import { ApprovedApps } from "../ui/pages/approved-apps";
import * as consentRepository from "../repositories/consentRepository"

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
    .get(
        "/applications/approved",
        authedMware,
        async c => {
            const consented = await consentRepository.getConsentedApps(c.var.user.userId)
            return c.render(
                <ApprovedApps
                    consent={consented}
                />, {title: "Approved Apps"}
            )
        }
    )       
    .get(
        "/applications/:clientId", authedMware,
        async c => {
            const app = await db.query.clients.findFirst({
                where: {
                    clientId: c.req.param("clientId"),
                    userId: c.var.user.userId
                }
            })
            if (!app) return c.notFound();
            return c.render(<AddApplication app={app} />, {title: "Edit Application"})
        }
    )
 
