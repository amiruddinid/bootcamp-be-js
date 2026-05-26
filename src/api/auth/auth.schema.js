const z = require('zod'); // import library zod untuk validasi schema

const registerSchema = z.object({
    USERNAME: z.string().min(3, 'Username must be at least 3 characters long'),
    PASSWORD: z.string().min(6, "Must be at least 6 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    NOREG: z.string().min(6, 'NOREG must be at least 6 characters long'),
    EMAIL: z.string().email('Invalid email address'),
    ROLE_ID: z.number().int().positive('ROLE_ID must be a positive integer')
})

const postRegisterSchema = z.object({
    body: registerSchema
})

const loginSchema = z.object({
    username: z.string(),
    password: z.string()
})

const postLoginSchema = z.object({
    body: loginSchema
})

module.exports = {
    postRegisterSchema,
    postLoginSchema
}