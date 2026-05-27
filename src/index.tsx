import { factory } from './utils/createHono'
import { signupRoutes } from './routes/signup'
import { renderer } from './middleware/renderer'
import { csrf } from 'hono/csrf'

const app = factory.createApp()

app
    .use("/pages/*", csrf(), renderer)
    .get('/', async (c) => {
        const statement = c.env.DB.prepare("SELECT 1");
        await statement.raw()
        return c.text('Hello Hono!')
    })
    .route("/", signupRoutes)


export default app
