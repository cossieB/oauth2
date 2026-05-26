import { factory } from "../utils/createHono";
import { Signup } from "./ui/Signup";

export const signupRoutes = factory.createApp()

signupRoutes
    .get("/", c => c.render(<Signup />, {title: "Signup"}))