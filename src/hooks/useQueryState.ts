'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

/**
 * Parser interface for type-safe URL parameter parsing
 */
export interface QueryStateParser<T> {
    /** Parse URL string value to typed value */
    parse: (value: string | null) => T;
    /** Serialize typed value to URL string (return null to remove param) */
    serialize: (value: T) => string | null;
}

/**
 * Options for useQueryState hook
 */
export interface UseQueryStateOptions<T> {
    /** Default value when param is not present */
    defaultValue: T;
    /** Custom parser for the value */
    parser?: QueryStateParser<T>;
}

// Built-in parsers
export const parseAsString = {
    parse: (value: string | null) => value ?? '',
    serialize: (value: string) => value || null,
} satisfies QueryStateParser<string>;

export const parseAsInteger = {
    parse: (value: string | null) => {
        if (value === null) return null;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    },
    serialize: (value: number | null) => value?.toString() ?? null,
} satisfies QueryStateParser<number | null>;

export const parseAsBoolean = {
    parse: (value: string | null) => value === 'true',
    serialize: (value: boolean) => value ? 'true' : null,
} satisfies QueryStateParser<boolean>;

/**
 * Create a parser for string literal unions (enums)
 * @param validValues Array of valid string values
 * @param defaultValue Default value when param is invalid or missing
 */
export function parseAsStringLiteral<T extends string>(
    validValues: readonly T[],
    defaultValue: T
): QueryStateParser<T> {
    return {
        parse: (value: string | null) => {
            if (value === null) return defaultValue;
            return validValues.includes(value as T) ? (value as T) : defaultValue;
        },
        serialize: (value: T) => value === defaultValue ? null : value,
    };
}

/**
 * Create a parser with custom serialize/parse functions and value mapping
 * Useful when URL param values differ from internal values (e.g., 'people' in URL -> 'foryou' internally)
 */
export function createMappedParser<T extends string>(options: {
    validValues: readonly T[];
    defaultValue: T;
    /** Map URL param value to internal value */
    urlToValue?: Record<string, T>;
    /** Map internal value to URL param value (only specify values that differ) */
    valueToUrl?: Partial<Record<T, string>>;
}): QueryStateParser<T> {
    const { validValues, defaultValue, urlToValue = {} } = options;
    const valueToUrlMap = options.valueToUrl ?? {} as Partial<Record<T, string>>;

    return {
        parse: (value: string | null) => {
            if (value === null) return defaultValue;
            // Check if URL value needs mapping
            if (urlToValue[value]) return urlToValue[value];
            // Check if it's a valid value directly
            return validValues.includes(value as T) ? (value as T) : defaultValue;
        },
        serialize: (value: T) => {
            // Check if value needs mapping to URL
            const urlValue = value in valueToUrlMap ? valueToUrlMap[value] : value;
            // Don't include default value in URL
            return urlValue === defaultValue || value === defaultValue ? null : (urlValue ?? null);
        },
    };
}

type SetQueryState<T> = (value: T | ((prev: T) => T)) => void;

/**
 * Hook for syncing state with URL query parameters.
 * Provides a useState-like API that persists to the URL.
 * 
 * @example
 * // Simple string usage
 * const [query, setQuery] = useQueryState('q', { defaultValue: '' });
 * 
 * @example
 * // With string literal parser (for tabs)
 * const tabs = ['posts', 'tags', 'links'] as const;
 * const [tab, setTab] = useQueryState('tab', {
 *   defaultValue: 'posts',
 *   parser: parseAsStringLiteral(tabs, 'posts'),
 * });
 * 
 * @example
 * // With mapped parser (URL value differs from internal value)
 * const [tab, setTab] = useQueryState('tab', {
 *   defaultValue: 'posts',
 *   parser: createMappedParser({
 *     validValues: ['posts', 'tags', 'foryou'] as const,
 *     defaultValue: 'posts',
 *     urlToValue: { 'people': 'foryou' },
 *     valueToUrl: { 'foryou': 'people' },
 *   }),
 * });
 */
export function useQueryState<T = string>(
    key: string,
    options: UseQueryStateOptions<T>
): [T, SetQueryState<T>] {
    const router = useRouter();
    const pathname = router.pathname;
    const query = router.query;

    const { defaultValue, parser } = options;

    // Default parser for strings
    const effectiveParser = useMemo(() => {
        if (parser) return parser;
        // Default string parser
        return {
            parse: (value: string | null) => (value ?? defaultValue) as T,
            serialize: (value: T) => {
                const strValue = String(value);
                return strValue === String(defaultValue) ? null : strValue;
            },
        } as QueryStateParser<T>;
    }, [parser, defaultValue]);

    // Parse current value from URL
    const value = useMemo(() => {
        const rawValue = query[key];
        const stringValue = typeof rawValue === 'string' ? rawValue : null;
        return effectiveParser.parse(stringValue);
    }, [query, key, effectiveParser]);

    // Setter function
    const setValue: SetQueryState<T> = useCallback(
        (valueOrFn) => {
            const newValue = typeof valueOrFn === 'function'
                ? (valueOrFn as (prev: T) => T)(value)
                : valueOrFn;

            const serialized = effectiveParser.serialize(newValue);
            const newQuery = { ...query };

            if (serialized === null) {
                delete newQuery[key];
            } else {
                newQuery[key] = serialized;
            }

            router.replace({ pathname, query: newQuery }, undefined, { shallow: true });
        },
        [router, pathname, query, key, effectiveParser, value]
    );

    return [value, setValue];
}
