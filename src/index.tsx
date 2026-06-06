import { factory } from './utils/createHono'
import { pagesRoutes } from './routes/pages'
import { authenticateMware } from './middleware/authMware'
import { authRoutes } from './routes/auth'
import { HttpStatusCode } from './utils/statusCodes'
import { applicationsRoutes } from './routes/applications'
import { docsRoutes } from './routes/docs'
import { oauthRoutes } from './routes/oauth'
import { env } from 'cloudflare:workers'
import { devRoute } from './routes/dev'
import { helmet } from './middleware/secureHeaders'

const app = factory.createApp()

app.use( '*', helmet)

app
    .route("/", docsRoutes)
    .use(authenticateMware)
    .get('/', async (c) => {
        const redirect = c.var.user ? "/profile" : "/signin?navigateTo=/profile"
        return c.redirect(redirect, HttpStatusCode.TEMPORARY_REDIRECT)
    })
    .route("/", pagesRoutes)
    .route("/", authRoutes)
    .route("/", applicationsRoutes)
    .route("/", oauthRoutes)

if (env.NODE_ENV !== "production")
    app.route("/", devRoute)

export default app
