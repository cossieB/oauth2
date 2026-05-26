import { factory } from './utils/createHono'
import { signupRoutes } from './routes/signup'
import { renderer } from './middleware/renderer'

const app = factory.createApp()

app
    .use("/pages/*", renderer)
    .get('/', (c) => {
        return c.text('Hello Hono!')
    })
    .route("/pages/signup", signupRoutes)

export default app
