import { factory } from './utils/createHono'
import { pagesRoutes } from './routes/pages'
import { authenticateMware } from './middleware/authMware'
import { authRoutes } from './routes/auth'
import { AppError } from './utils/AppError'
import { HttpStatusCode } from './utils/statusCodes'
import { applicationsRoutes } from './routes/applications'

const app = factory.createApp()

app
    .use(authenticateMware)
    .get('/', async (c) => {
        const redirect = c.var.user ? "/profile" : "/signin?redirect=/profile"
        return c.redirect(redirect, HttpStatusCode.TEMPORARY_REDIRECT)
    })
    .route("/", pagesRoutes)
    .route("/", authRoutes)
    .route("/", applicationsRoutes)

app.onError((err, c) => {
    if (err instanceof AppError)
        return c.json({errors: [err.message]}, err.status ?? HttpStatusCode.INTERNAL_SERVER_ERROR)
    console.error(err)
    return c.json({errors: ["Something went wrong."]}, HttpStatusCode.INTERNAL_SERVER_ERROR)
})

export default app
