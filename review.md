> Reviews are appended newest-last. Jump to the latest: [2026-07-30](#codebase-review--2026-07-30).

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

---

# Codebase Review — 2026-07-30

Scope: whole repository. Security findings are reported separately in
`CLAUDE-SECURITY-20260730-042547/CLAUDE-SECURITY-RESULTS.md` (7 findings: 1 HIGH,
3 MEDIUM, 3 LOW — all fixed); this section covers the non-security correctness,
robustness and maintainability findings from the same pass. Everything below was
fixed in the accompanying change set. `bun run lint` (tsc + eslint) passes with 0
errors, `bun run build` succeeds, `bun run lint:locales` reports all catalogues
synchronized.

## 1. Voting on a boosted poll updated nothing — **fixed**

**File:** `src/api/mutations.ts` (`updatePollInCaches`)

The cache fan-out matched polls with `status.poll?.id === pollId` only. A boosted
poll is not stored that way: timelines cache the *boost wrapper*, whose `poll` is
`null`, with the poll hanging off `wrapper.reblog.poll`. So for any boosted poll —
a common way polls travel — both the optimistic update in `onMutate` and the
authoritative update in `onSuccess` matched nothing, and `useVotePoll` does not
invalidate on success. The vote was sent, but the UI kept showing the pre-vote poll
(no "voted" state, no results) until the timeline happened to refetch.

Compounding it, the same ternary was written out inline in six places, which is how
the reblog case came to be missed in all of them.

**Fix:** one reblog-aware `updatePollInStatus` helper, used by every branch
(timelines, bookmarks, account statuses, trends, both search shapes, pinned
statuses, thread context).

## 2. Boost response filed under the wrong cache key — **fixed**

**File:** `src/api/mutations.ts` (`useReblogStatus`)

`POST /api/v1/statuses/:id/reblog` returns the newly created *boost*, whose `id` is
the boost's own id, with the boosted status nested in `reblog`. `onSuccess` used
`data.id` for both `setQueryData(statuses.detail(...))` and
`updateStatusInCaches(...)`, so the server's authoritative counts were written under
an id nothing reads (and a stray wrapper entry was added to the status-detail cache),
while the boosted status kept the optimistic guess from `onMutate` indefinitely.

**Fix:** unwrap with `data.reblog ?? data` and key both writes by the request's `id`.

## 3. Scroll-restoration cache grew without bound — **fixed**

**File:** `src/components/organisms/VirtualizedList.tsx`

`scrollStateCache` is a module-level `Map` keyed by `scrollRestorationKey`, and
nothing ever removed an entry. Each value holds a full `measurementsCache` — one
record per item ever measured in that list — so a session that visits many
timelines (home, explore, each hashtag, each list, each profile tab) accumulates
large arrays for lists the user will not return to.

**Fix:** bounded to the 20 most-recently-used keys, with reads re-inserting the key
so eviction follows actual use.

## 4. Card-menu scroll listener outlived the menu — **fixed**

**File:** `src/components/molecules/AccountCard/AccountCardActions.tsx:132`

`window.addEventListener('scroll', () => setShowMenu(false), { once: true })` was
registered with an inline function, so the effect's cleanup could not remove it
(only the `mousedown` listener was removed). Closing the menu any other way left the
listener attached until the next scroll — one more per menu open — firing
`setShowMenu` on a card that may already be unmounted.

**Fix:** named handler, removed in the cleanup alongside `mousedown`.

## 5. Wrapstodon generation polled for 30 s after unmount — **fixed**

**Files:** `src/app/(main)/wrapstodon/page.tsx`, `src/components/wrapstodon/WrapstodonModal.tsx`

Both entry points contained the same block: on a successful `generate` mutation,
`setInterval(refetchState, 2000)` plus `setTimeout(clearInterval, 30000)`, with
neither handle stored anywhere. Navigating away or closing the modal left the
interval refetching the annual-report state every two seconds for the remainder of
the 30 s window, against an unmounted component.

**Fix:** extracted `src/hooks/useAnnualReportGeneration.ts`, which keeps both timer
handles in refs, clears them on unmount, and is now shared by the page and the
modal (removing the duplicated block).

## 6. Unguarded `new URL()` / `decodeURIComponent()` in render and server paths — **fixed**

**Files:** `src/components/molecules/LinkPreview.tsx:37`, `src/app/layout.tsx`,
`src/app/(main)/[acct]/page.tsx`

Both APIs throw on invalid input, and in a render function or Server Component a
throw is an error page rather than a degraded feature: a link card without a
parseable URL took down the surrounding page, a malformed `instanceURL` cookie made
*every* route 500 (see security F7), and a malformed `[acct]` segment produced a 500
instead of a not-found page.

**Fix:** new `safeHostname()` in `src/utils/url.ts`; the layout validates the cookie
and computes the `files.` prefetch host once instead of parsing three times; the
`[acct]` route parses its segment through `parseAcctParam`, returning null →
`notFound()`.

## 7. CI could install versions that differ from the lockfile — **fixed**

**File:** `.github/workflows/ci.yml`

`bun install` without `--frozen-lockfile`. Bun applies frozen installs in CI by
default today, so this was latent rather than active, but relying on an implicit
default for a supply-chain-relevant step is not worth the ambiguity.

**Fix:** `bun install --frozen-lockfile`, with a comment saying why.

## 8. `CLAUDE.md` had drifted from the codebase — **fixed**

The file is loaded as project instructions every session, so its inaccuracies
actively mislead:

- **ESLint LOC limits were wrong in both directions.** Documented: atoms 120/50,
  molecules 200/80, organisms 350/80, pages 300/100. Actual (`eslint.config.js`):
  atoms 150/100, molecules 350/250, organisms 500/400, pages 300/250. Several
  organisms legitimately exceed the *documented* ceiling while passing lint.
- **`src/app/api/` was absent from the tree entirely** — i.e. nothing recorded that
  the app has server routes handling the OAuth `client_secret`, or a media proxy.
- Also missing: `src/i18n/`, `src/messages/`, `src/constants/`, `scripts/`, `docs/`,
  `browser-requirements.md`, and the newer `src/utils` modules.
- `package-lock.json` listed as the lockfile; the repo uses `bun.lock`.
- `src/proxy.ts` described as "Proxy configuration"; it is the Next.js middleware
  (renamed to `proxy` in Next 16) that gates protected routes.

**Fix:** corrected the limits, the lockfile, and the middleware description; added
the missing directories; and added a **Security invariants** section recording the
four rules the fixes in this pass depend on (instance HTML is untrusted; the
`instanceURL` cookie must be validated before it becomes a request target;
API-provided URLs go through `openExternalUrl`; `/api/proxy` must stay SSRF-guarded).

---

## Notes / not changed (lower priority)

- **`src/api/mutations.ts` (1.9k lines)** still carries three near-identical
  ~90-line cache fan-outs (`updateStatusInCaches`, `removeStatusFromCaches`,
  `updatePollInCaches`) that each enumerate the same eight cache shapes. Finding 1
  is exactly the bug this duplication invites. A single
  `forEachStatusCache(queryClient, mapFn)` walker would collapse all three; not done
  here because it touches every status mutation and deserves its own change.
- **`src/hooks/useNotificationSound.ts`:** the debounce timeout is never cleared on
  unmount, so a sound can play just after the component goes away, and
  `NotificationSound.destroy()` only runs if the `ended` event fires (a throttled
  tab can leave one `Audio` element alive). Bounded and inaudible in practice.
- **`useSearchHistory` / `DraftStore`** trust the shape of what they read back from
  `localStorage` (`JSON.parse` → `setHistory`, `→ this.draft`). A hand-edited or
  future-incompatible value can crash the search page or the composer. Only
  reachable by something that already has script access, so left alone.
- **`src/utils/oauth.ts`:** `REDIRECT_URI` is still a module-level constant computed
  at import time with a `localhost:9003` SSR fallback (carried over from the previous
  review's note).
- **Component counts in `CLAUDE.md`** (27 atoms / 57 molecules / 14 organisms) are
  stale — the tree now has 30 / 72 / 18 files. Left as-is rather than starting a
  count that will drift again next week.
- **No test suite.** `bun run lint` and `bun run build` are the only automated
  gates; every finding in both reports was found by reading, and every fix was
  verified only by tsc/eslint/build. The optimistic-update logic in `mutations.ts`
  (findings 1 and 2) is the highest-value place to add the first tests.
