import {z} from "zod"

export const usernameValidation = z
.string()
.min(4, "Username must be at least 4 characters") // Changed from 6 to 4
.max(15, "Username must be no more than 15 characters")
.regex(/^[\w._-]+$/, "Username must not contain special characters")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: "Password must be at least 6 characters"})
})