# Codebase Review — 2026-07-19

Scope: full review of the API layer (`src/api`), MobX stores, streaming, hooks,
cookie/auth utilities, and HTML rendering paths. Findings are ordered by severity.
Each finding notes whether it was fixed in the accompanying commit.

---

## 1. Unsanitized instance HTML rendered via `dangerouslySetInnerHTML` (XSS) — **fixed**

**Files:** `src/components/molecules/StatusContent.tsx`, `src/components/atoms/EmojiText.tsx`,
`src/app/(main)/about/page.tsx`, `src/app/(main)/about/privacy/page.tsx`, `src/app/(main)/about/terms/page.tsx`

Status content, bios, and instance pages (privacy policy, terms, extended description)
were injected into the DOM without any client-side sanitization. The official Mastodon
web UI can trust its own server because it is served *by* that server, but this app is a
third-party client that connects to **any user-chosen instance**. A malicious or
compromised instance could return HTML containing scripts/event handlers and execute
code in the app's origin — where the `accessToken` cookie is readable by JavaScript.

**Fix:** added `dompurify` and a shared `sanitizeHtml()` util (`src/utils/sanitize.ts`),
applied at every `dangerouslySetInnerHTML` site that renders API-provided HTML.

## 2. Real-time notifications never appear in the list (query-key mismatch) — **fixed**

**Files:** `src/api/queries.ts:427`, `src/hooks/useStreaming.ts:41`

The streaming handler prepends incoming notifications to the cache under
`queryKeys.notifications.list()` → `['notifications', 'list', undefined]`, but the
notifications page reads from `infiniteNotificationsOptions(types)` whose key is
`queryKeys.notifications.list({ types })` → `['notifications', 'list', { types: undefined }]`.
TanStack Query hashes these differently (`[..., null]` vs `[..., {}]`), so the
streamed update writes to a cache entry nothing reads. Result: while on the
notifications page, new notifications never appear live (only the unread badge moves).

**Fix:** `infiniteNotificationsOptions` now only includes the params object in the key
when `types` is non-empty, so the default list key matches the streaming writer's key.
(Live prepend into the filtered "mentions" tab is still not done; that tab refreshes on
mount via `staleTime: 0`.)

## 3. Axios interceptor strips the response object, breaking 404 handling — **fixed**

**Files:** `src/api/client/base.ts:82-83`, `src/api/queries.ts` (`privacyPolicyOptions`,
`termsOfServiceOptions`, `extendedDescriptionOptions`)

The response interceptor rethrows every HTTP error as `new Error(message)`, discarding
`error.response`. But the privacy-policy / terms / extended-description queries detect
"not configured on this server" by checking `'response' in error` and
`response.status === 404` — which can never match a plain `Error`. On instances without
those documents configured, the about pages show an error state instead of gracefully
hiding the section, and any similar status-based branching downstream is dead code.

**Fix:** the interceptor now attaches `response` and `status` to the thrown error, so
the message stays clean for display while status-code checks keep working.

## 4. Cookie domain hardcoded to `.mastodon.website` — **fixed**

**Files:** `src/utils/cookies.ts:26-35`, `src/app/api/auth/actions.ts:8-15`

Both the client util and the server action return `.mastodon.website` for **every**
non-localhost host. Deployed on any other domain (a Vercel preview URL, a fork, a
custom domain), browsers reject cookies whose `Domain` doesn't match the current host —
so `accessToken` / `instanceURL` / `clientSecret` silently fail to persist and sign-in
breaks entirely.

**Fix:** the domain is now derived from the actual host: `.mastodon.website` is used only
when the hostname is `mastodon.website` or a subdomain of it; otherwise host-only cookies
(no `Domain` attribute) are set.

## 5. Stale WebSocket handlers can clobber the new connection — **fixed**

**File:** `src/stores/streamingStore.ts`

`connect()` closes any existing socket but leaves its handlers attached. The old
socket's `onclose` fires *after* the new socket has been assigned to `this.socket`, and
unconditionally runs `this.socket = null; this.status = 'disconnected'` and may schedule
a reconnect — clobbering the brand-new connection's state (losing the socket reference
means later `subscribe()`/`disconnect()` calls become no-ops). Reachable whenever
`connect()` is called while an errored socket hasn't finished closing.

**Fix:** `onmessage`/`onerror`/`onclose` now ignore events from any socket that is no
longer the current one, and `connect()` detaches the old socket's handlers before
closing it.

## 6. Failed posts gave the user no feedback — **fixed**

**Files:** `src/api/mutations.ts` (`useCreateStatus`, `useUpdateStatus`),
`src/components/organisms/ComposerPanel.tsx:239`

Callers of `useCreateStatus` / `useUpdateStatus` catch errors and only `console.error`
them. If publishing fails (rate limit, network, server error), the composer stays open
with no visible indication of what happened.

**Fix:** added an `onError` toast to both mutations (new `toast.postFailed` message added
to all 10 locale files).

## 7. Streamed duplicate notifications double-increment the unread badge — **fixed**

**File:** `src/hooks/useStreaming.ts`

The duplicate check in `handleNotification` only guarded the list prepend; the
unread-count increment ran unconditionally, so a re-delivered notification (e.g. after
a reconnect replay) inflated the badge.

**Fix:** the increment is skipped when the notification already exists in the list cache.

## 8. Optimistic poll vote undercounts multi-choice votes — **fixed**

**File:** `src/api/mutations.ts` (`useVotePoll`)

The optimistic update always did `votes_count + 1` even when several choices were
selected in a multiple-choice poll (Mastodon counts each selected option as a vote),
and never bumped `voters_count`. The percentages shown between the optimistic update
and the server response were wrong.

**Fix:** `votes_count` now increases by `choices.length` and `voters_count` by 1 (when
the instance reports it).

## 9. Dead non-infinite query hooks share cache keys with infinite variants — **fixed (removed)**

**File:** `src/api/queries.ts`

`useFollowers`, `useFollowing`, `useBookmarks`, `useAccountStatuses`, and
`useNotifications` (plus their `*Options` factories) are unused anywhere in the app, and
each one shares its exact query key with an infinite-query variant that stores a
different data shape (`PaginatedResponse<T>` vs `InfiniteData<PaginatedResponse<T>>`).
If any of them were ever used on a page that also uses the infinite variant, the two
would overwrite each other's cache entries and crash consumers expecting `pages`.

**Fix:** removed the dead hooks/options. If a non-paginated variant is needed later, it
must get a distinct query key.

---

## Notes / not changed (lower priority)

- **`src/utils/oauth.ts`:** `REDIRECT_URI` is computed at module load with a
  `localhost:9003` fallback for SSR. Harmless today (only used client-side), but a
  function would be safer than a module-level constant.
- **`src/hooks/useStreaming.ts`:** the context-cache walk in `handleConversation` scans
  every `['statuses', *, 'context']` entry on each streamed conversation; fine at current
  scale.
- **`src/stores/authStore.ts`:** `signOut()` calls `localStorage.clear()`, which also
  wipes search history and theme preference. Intentional-looking, so left as-is.
- **`CLAUDE.md`:** mentions `package-lock.json`, but the repo uses `bun.lock`.
