/**
 * Conversation utility functions using Ramda
 */

import * as R from 'ramda'
import type { Status, Context, Conversation } from '@/types/mastodon'
import { sanitizeHtml } from './sanitize'

// Check if status with given id exists in array
export const hasStatusWithId = (id: string) => R.any<Status>(R.propEq(id, 'id'))

// Get last status id or fallback
export const getLastStatusId = (statuses: Status[], fallback?: string) =>
    R.pipe(
        R.last<Status>,
        R.ifElse(R.isNil, R.always(fallback), R.prop('id'))
    )(statuses)

// Find conversation by id in pages
export const findConversationById = (id: string | null) =>
    R.pipe(
        R.chain<Conversation[], Conversation>(R.identity),
        R.find<Conversation>(R.propEq(id, 'id'))
    )

// Build message list from context
export const buildMessageList = (ancestors: Status[], descendants: Status[], original: Status | null): Status[] => {
    const isInArray = (statusId: string, arr: Status[]) => R.any(R.propEq(statusId, 'id'), arr)

    if (original && !isInArray(original.id, ancestors) && !isInArray(original.id, descendants)) {
        return [...ancestors, original, ...descendants]
    }
    return [...ancestors, ...descendants]
}

// Append status to descendants if not exists
export const appendIfNotExists = (status: Status) => (old: Context | undefined): Context | undefined => {
    if (!old) return old
    if (hasStatusWithId(status.id)(old.descendants)) return old
    return { ...old, descendants: R.append(status, old.descendants) }
}

// Strip mentions from HTML content.
//
// The input is status HTML from the instance, i.e. untrusted. Assigning it to
// `innerHTML` on an element created by `document` builds nodes attached to the
// live document's loader, so a payload like `<img src=x onerror=...>` executes
// during parsing — before any render-time sanitization can help. Parsing inside
// an inert document created by `createHTMLDocument` has no browsing context, so
// nothing loads and no handler runs; the markup is sanitized as well, so what
// this returns is safe for the caller to render.
export const stripMentions = (html: string): string => {
    if (typeof document === 'undefined') return html

    const inertDocument = document.implementation.createHTMLDocument('')
    const temp = inertDocument.createElement('div')
    temp.innerHTML = sanitizeHtml(html)
    temp.querySelectorAll('.mention, a.mention, span.mention').forEach(m => m.remove())
    let text = temp.innerHTML
    let prev = ''
    while (prev !== text) {
        prev = text
        text = text.replace(/^(<p[^>]*>)?\s*@[\w.-]+(@[\w.-]+)?\s*/gi, '$1')
    }
    text = text.replace(/<p[^>]*>\s*<\/p>/gi, '')
    return R.ifElse(R.complement(R.isEmpty), R.identity, R.always('<p>&nbsp;</p>'))(text.trim())
}
