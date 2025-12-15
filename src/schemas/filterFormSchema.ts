import * as z from 'zod/mini';
import type { FilterContext, FilterAction } from '@/types/mastodon';

export const filterKeywordSchema = z.object({
    id: z.optional(z.string()),
    keyword: z.string(),
    whole_word: z.boolean(),
});

export const filterFormSchema = z.object({
    title: z.string().check(
        z.minLength(1, 'Title is required'),
        z.maxLength(100, 'Title must be at most 100 characters')
    ),
    expiresIn: z.string(), // Empty string means "never expires"
    contexts: z.array(z.enum(['home', 'notifications', 'public', 'thread', 'account'] as const)).check(
        z.minLength(1, 'Please select at least one context')
    ),
    filterAction: z.enum(['warn', 'blur', 'hide'] as const),
    keywords: z.array(filterKeywordSchema),
});

export type FilterFormData = z.infer<typeof filterFormSchema>;
export type FilterKeywordData = z.infer<typeof filterKeywordSchema>;

// Helper to convert FilterContext array for type-safe usage
export const FILTER_CONTEXTS: FilterContext[] = ['home', 'notifications', 'public', 'thread', 'account'];
export const FILTER_ACTIONS: FilterAction[] = ['warn', 'blur', 'hide'];
