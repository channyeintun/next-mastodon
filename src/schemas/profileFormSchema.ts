import * as z from 'zod/mini';

export const profileFieldSchema = z.object({
    name: z.string(),
    value: z.string(),
    verified_at: z.nullable(z.string()),
});

export const profileFormSchema = z.object({
    displayName: z.string().check(
        z.maxLength(30, 'Display name must be at most 30 characters')
    ),
    bio: z.string().check(
        z.maxLength(500, 'Bio must be at most 500 characters')
    ),
    locked: z.boolean(),
    bot: z.boolean(),
    discoverable: z.boolean(),
    fields: z.array(profileFieldSchema),
    avatarFile: z.optional(z.instanceof(File)),
    headerFile: z.optional(z.instanceof(File)),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type ProfileField = z.infer<typeof profileFieldSchema>;
