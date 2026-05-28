import z from "zod";

export const PasswordSchema = z
        .string("Password is required")
        .min(8)


export const SignupSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    username: z
        .string()
        .min(3, "Username must be between 3 and 15 characters")
        .max(15, "Username must be between 3 and 15 characters")
        .regex(/^\w+$/, "Username should only have letters and underscores"),
    email: z.email("Email is required"),
    password: PasswordSchema ,
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

export const SigninSchema = z.object({
    identifier: z.string(),
    password: z.string()
})