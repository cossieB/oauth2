import z from "zod";

export const SignupSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    username: z
        .string()
        .min(3, "Username must be between 3 and 15 characters")
        .max(15, "Username must be between 3 and 15 characters")
        .regex(/^\w+$/, "Username should only have letters and underscores"),
    email: z.email("Email is required"),
    password: z
        .string("Password is required")
        .min(8)
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character") ,
    confirmPassword: z.string()
}).superRefine((data, ctx) => {
    if (data.password != data.confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["confirmPassword"]
        })
    }
})