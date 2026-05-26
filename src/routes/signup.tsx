import { Signup } from "../ui/Signup";
import { factory } from "../utils/createHono";

export const signupRoutes = factory.createApp()

signupRoutes
    .get("/", c => c.render(<Signup />, {title: "Signup"}))