import z from "zod";

export const PasswordSchema = z
    .string("Password is required")
    .min(8)
.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
.regex(/[a-z]/, "Password must contain at least one lowercase letter")
.regex(/[0-9]/, "Password must contain at least one number")
.regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

export const SignupSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    username: z
        .string()
        .min(3, "Username must be between 3 and 15 characters")
        .max(15, "Username must be between 3 and 15 characters")
        .regex(/^\w+$/, "Username should only have letters and underscores")
        .toLowerCase(),
    email: z.email("Email is required").toLowerCase(),
    password: PasswordSchema,
    confirmPassword: z.string()
})
    .superRefine((data, ctx) => {
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

export const ProfileSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    image: z.preprocess(
        value => value === "" ? undefined : value,
        z.instanceof(File)
            .optional()
            .refine(file => !file || file.type.startsWith("image/"), "Only images are allowed")
            .refine(file => !file || file.size < 2 * 1024 * 1024, "Maximum allowed file size is 2 MB")
    )
})

export const AppCreateSchema = z.object({
    name: z.string().max(50),
    redirectUri: z.url(),
    homepage: z.preprocess(
        value => value === "" ? undefined : value,
        z.url().optional()
    ),
    privacyPolicyLink: z.preprocess(
        value => value === "" ? undefined : value,
        z.url().optional()
    ),
    tosLink: z.preprocess(
        value => value === "" ? undefined : value,
        z.url().optional()
    ),
    logo: z.preprocess(
        value => value === "" ? undefined : value,
        z.instanceof(File)
            .optional()
            .refine(file => !file || file.type.startsWith("image/"), "Only images are allowed")
            .refine(file => !file || file.size < 2 * 1024 * 1024, "Maximum allowed file size is 2 MB")
    )
})

const ScopesSchema = z.string()
    .optional()
    .default("")
    .transform(val => val ? [...new Set(val.split(/(?:%20)|\s+/))].sort() : [])
    .pipe(z.array(z.enum(["openid", "offline_access", "email", "profile"])))

export const AuthorizeSchema = z.object({
    response_type: z.literal("code"),
    client_id: z.string(),
    redirect_uri: z.url(),
    scope: ScopesSchema,
    state: z.string().optional(),
    code_challenge: z.string(),
    code_challenge_method: z.literal("S256")
})

const AuthCodePayload = z.object({
    grant_type: z.literal("authorization_code"),
    code: z.string(),
    redirect_uri: z.string(),
    client_id: z.string(),
    code_verifier: z.string()
})    

const RefreshPayload = z.object({
    grant_type: z.literal("refresh_token"),
    refresh_token: z.string(), 
    client_id: z.string()
})

export const GrantType = z.discriminatedUnion("grant_type", [AuthCodePayload, RefreshPayload])