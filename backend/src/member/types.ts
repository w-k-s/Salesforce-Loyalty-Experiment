import { z } from 'zod';

const NAME_REGEX = /^[A-Za-z][A-Za-z\-\s]*[A-Za-z]$/;

export const CreateMemberRequestSchema = z.object({
    firstName: z.string().trim().regex(NAME_REGEX, {
        message: 'Invalid first name format',
    }),
    middleName: z
        .string()
        .trim()
        .regex(NAME_REGEX, { message: 'Invalid middle name format' })
        .optional(),
    password: z
        .string()
        .min(8)
        .regex(/^[a-zA-Z0-9]+$/, { message: 'Password must be alphanumeric' }),
    lastName: z.string().trim().regex(NAME_REGEX, {
        message: 'Invalid last name format',
    }),
    gender: z.enum(['Male', 'Female']).optional(),
    mobileNumber: z
        .string()
        .regex(/^971[0-9]{9}$/, {
            message: 'Mobile number must start with 971 and contain 9 digits after',
        }),
    email: z.string().email(),
    birthDate: z
        .string()
        .date()
        .refine((dateStr) => new Date(dateStr) <= new Date(), {
            message: 'Birth date must not be in the future',
        }),
});

export type CreateMemberRequest = z.infer<typeof CreateMemberRequestSchema>;