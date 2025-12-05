# Mastodon Frontend - Implementation Plan

## Project Overview
A minimal, performant social media frontend for Mastodon with modern React patterns.

## Progress Tracking

**Legend:**
- ✅ Completed & Verified
- 🔄 Completed (Awaiting Verification)
- 🚧 In Progress
- ⏳ Pending

### Phase 1: Project Foundation
- ✅ Task 1: Initialize Next.js 16 with App Router
- ✅ Task 2: Configure PostCSS with Open Props
- ✅ Task 3: Setup Atomic Architecture
- ✅ Task 4: Configure React Compiler & View Transitions

### Phase 2: Core Infrastructure (Reusable from TanStack Start)
- ✅ Task 5: Setup Next.js App Router routes
- ✅ Task 6: Explore Mastodon API (Completed - Reusable)
- ✅ Task 7: Port Mastodon API Client to Next.js
- ✅ Task 8: Port MobX Stores to Next.js

### Phase 3: Authentication
- ✅ Task 9: Implement Authentication Flow with Next.js
- ✅ Task 9.1: Setup Next.js middleware for auth protection

### Phase 4: Component Library
- ✅ Task 10: Build Base UI Atoms
- ✅ Task 11: Build Molecules (PostCard ✅, UserCard ✅)
- ✅ Task 12: Setup Tiptap Editor (with StarterKit & Placeholder)

### Phase 5: Feature Pages
- ✅ Task 13: Implement Article List Page (Timeline with infinite scroll)
- ✅ Task 14: Implement Create Article Page (Compose with Tiptap, visibility, CW)
- ✅ Task 15: Implement Article Detail Page (Status with full thread context)
- ✅ Task 16: Implement Bookmarks Page (with infinite scroll)
- ✅ Task 17: Implement Account Detail Page (with profile & posts)
- ✅ Task 18: Implement Search Page (with tabs for accounts, statuses, hashtags)
- ⏳ Task 19: Implement Account Settings Page

### Phase 6: Polish & Optimization
- ⏳ Task 20: Use Activity Component (for toggling visibility which is React's official way now)
- ✅ Task 21: Implement Optimistic Updates (for article actions - completed in mutations.ts)
- ⏳ Task 22: Add Motion Animations
- ⏳ Task 23: Optimize with useEffectEvent (if necessary)
- ✅ Task 24: Update CLAUDE.md Documentation (initial version completed)

**Overall Progress: 18/24 tasks completed (75%)**
**Status: Core features complete - Settings page and polish remaining**

## Tech Stack

### Core Framework
- **Next.js 16** - Production-ready React framework with App Router
- **React 19** - Latest React with Server Components
- **TanStack Query** - Server state management
- **TanStack Virtual** - Infinite scroll with virtual lists
- **TanStack Form** - Form state management
- **React Compiler** - Automatic memoization and optimization

### UI & Animations
- **Open Props** - CSS variables and design tokens (https://open-props.style/)
- **PostCSS** - CSS processing (No Tailwind CSS)
- **Motion** - Detailed animations
- **View Transition API** - Page transition animations

### State & Data
- **MobX** - Global state management
- **Tiptap** - Rich text editor for composing posts
- **Optimistic Updates** - All mutations update query cache

### Best Practices
- **useEffectEvent** - Optimize event handlers where appropriate
- **Activity Component** - Visibility toggling
- **Atomic Design** - Component architecture

## Architecture

### Atomic Design Pattern
```
src/
├── components/
│   ├── atoms/          # Basic building blocks (Button, Input, Avatar)
│   ├── molecules/      # Simple combinations (PostCard, UserCard, SearchBar)
│   ├── organisms/      # Complex components (Timeline, ComposerPanel)
│   ├── templates/      # Page layouts
│   └── pages/          # Complete pages
```

## Features

### 0. Article
- content rendering using TipTap
- Link preview
- CTA such as fav, bookmark, repost, quote, report, follow, unfollow, etc (same as Mastodon)

### 1. Authentication
- Sign in with Mastodon (OAuth flow)
- Instance selection
- Token management

### 2. Timeline (Article List)
- Infinite scroll with virtual lists
- Home timeline
- Public timeline
- In account details pages, account timeline [account detail page]
- Performance optimized rendering

### 3. Create Article (Compose) (Explore at: https://docs.joinmastodon.org/user/posting/)
- Rich text editor (Tiptap)
- Mention, Hashtag
- Media attachments [can be multiples - max 4, make the layout responsive based on the numbers of it]
- Visibility settings
- Character count
- Content warnings
- Mastodon's custom Emoji + emoji mart [Remember that must render custom emoji in names too, it's not just in the post - in the compose, can use mastodon custom emoji api, in the post and names, there's a attribute for emoji - different instances can have different custom emojis]
- Alt text
- Poll [single/multiple]
- See more [for very long post]
- Translate [low priority]

### 4. Article Detail Page
- Status context (full thread)
- Ancestors (parent posts)
- Descendants (replies)
- Mentions display
- Private mentions handling
- Reply functionality

### 5. Bookmarks
- Bookmark list
- Add/remove bookmarks
- Optimistic updates

### 6. Account Detail Page
- User profile information
- User's posts
- Followers/Following
- Follow/Unfollow actions

### 7. Search Page
- Search accounts
- Search posts
- Search hashtags
- Filter results

### 8. Account Settings
- Own profile/Others profile[follow/unfollow/block/unblock/mute/unmute etc]
- Profile editing
- Preferences
- Privacy settings

### 9. Notifications

## Implementation Tasks

### Phase 1: Project Foundation

#### ~~Task 1: Initialize TanStack Start Project~~ **DEPRECATED**
**Reason:** TanStack Start has persistent CSS loading issues in SSR/dev mode (GitHub Issue #16515, #3023)
- Flash of Unstyled Content (FOUC) on OAuth redirects
- Styles load after hydration (~300ms delay)
- No clean solution without inline CSS duplication

#### Task 1.1: Initialize Next.js 16 with App Router
```bash
npx create-next-app@latest mastodon-next --typescript --app --no-tailwind --no-src-dir --import-alias "@/*"
```
- Setup App Router structure
- Install base dependencies
- Configure for React 19
- No CSS loading issues - proven SSR/CSS handling

#### Task 2: Configure PostCSS with Open Props
- Install `open-props` and `postcss`
- Configure `postcss.config.js`
- Setup CSS import structure
- Create base design tokens

#### Task 3: Setup Atomic Architecture
Create folder structure:
```
src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── pages/
├── stores/           # MobX stores
├── api/              # API client
├── hooks/            # Custom hooks
├── utils/            # Utilities
├── types/            # TypeScript types
└── styles/           # Global styles
```

#### Task 4: Configure React Compiler & View Transitions
- Setup React Compiler in build config
- Configure View Transitions API
- Create transition helpers

### Phase 2: Core Infrastructure

#### Task 5: Setup Next.js App Router
Define routes (file-based):
- `app/page.tsx` - Home timeline (/)
- `app/compose/page.tsx` - Create post (/compose)
- `app/status/[id]/page.tsx` - Article detail (/status/:id)
- `app/bookmarks/page.tsx` - Bookmarks (/bookmarks)
- `app/accounts/[id]/page.tsx` - Account detail (/accounts/:id)
- `app/search/page.tsx` - Search (/search)
- `app/settings/page.tsx` - Account settings (/settings)
- `app/auth/signin/page.tsx` - Sign in (/auth/signin)
- `app/auth/callback/page.tsx` - OAuth callback (/auth/callback)

#### Task 6: Explore Mastodon API
**Reference:** https://docs.joinmastodon.org/api/

Key endpoints to understand:
- **Authentication**: OAuth flow, token management
- **Timelines**: `/api/v1/timelines/home`, `/api/v1/timelines/public`
- **Statuses**:
  - GET `/api/v1/statuses/:id` - Get status
  - POST `/api/v1/statuses` - Create status
  - GET `/api/v1/statuses/:id/context` - Get ancestors/descendants
  - POST `/api/v1/statuses/:id/bookmark` - Bookmark
- **Accounts**:
  - GET `/api/v1/accounts/:id` - Get account
  - GET `/api/v1/accounts/:id/statuses` - Get account's statuses
  - POST `/api/v1/accounts/:id/follow` - Follow account
- **Search**: GET `/api/v2/search`
- **Bookmarks**: GET `/api/v1/bookmarks`

#### Task 7: Create Mastodon API Client
- Create typed API client
- Setup TanStack Query hooks
- Configure query keys structure
- Implement error handling
- Setup request/response interceptors

#### Task 8: Setup MobX Stores
Create stores:
- `authStore` - Authentication state
- `userStore` - Current user data
- `uiStore` - UI state (modals, sidebars)

### Phase 3: Authentication

#### Task 9: Implement Authentication Flow
- Instance selection form (TanStack Form)
- OAuth authorization flow
- Token storage and management
- Protected routes
- Auto-refresh tokens

### Phase 4: Component Library

#### Task 10: Build Base UI Atoms
Components:
- Button
- Input
- Textarea
- Avatar
- Icon
- Badge
- Spinner
- Card
- Link

#### Task 11: Build Molecules
Components:
- PostCard (status display)
- UserCard (account card)
- SearchBar
- Navigation (nav bar)
- ComposeButton
- ActionBar (like, boost, reply buttons)
- MediaGallery

#### Task 12: Setup Tiptap Editor
- Configure Tiptap with extensions
- Create ComposerPanel organism
- Implement mention suggestions
- Character counter
- Media upload integration

### Phase 5: Feature Pages

#### Task 13: Implement Article List Page
- Home timeline route
- Infinite scroll with TanStack Virtual
- TanStack Query for data fetching
- Pull-to-refresh
- Optimistic updates for interactions

#### Task 14: Implement Create Article Page
- Compose form with Tiptap
- Media upload
- Visibility selector
- Content warning input
- Post button with validation

#### Task 15: Implement Article Detail Page
- Status display
- Context fetching (ancestors/descendants)
- Thread visualization
- Reply form
- Mention handling
- Private mention display

#### Task 16: Implement Bookmarks Page
- Bookmark list with virtual scroll
- Remove bookmark action
- Empty state

#### Task 17: Implement Account Detail Page
- Profile header
- Account stats
- User's posts timeline
- Follow/Unfollow button
- Followers/Following tabs

#### Task 18: Implement Search Page
- Search input with debounce
- Tabbed results (All, Accounts, Statuses, Hashtags)
- Result lists
- Navigation to results

#### Task 19: Implement Account Settings Page
- Profile editing form
- Avatar/header upload
- Bio editing
- Privacy settings
- Notification preferences

### Phase 6: Polish & Optimization

#### Task 20: Setup Activity Component
- Visibility toggle component
- Animation states
- Intersection observer integration

#### Task 21: Implement Optimistic Updates
- Like/Unlike optimistic update
- Boost/Unboost optimistic update
- Bookmark optimistic update
- Follow/Unfollow optimistic update
- Post creation optimistic update
- Query cache synchronization

#### Task 22: Add Motion Animations
- Page transitions
- Card hover effects
- Button interactions
- Modal animations
- Slide-in panels

#### Task 23: Optimize with useEffectEvent
- Event handlers in components
- Callback optimizations
- Effect dependencies cleanup

#### Task 24: Create CLAUDE.md Documentation
- Project structure overview
- Directory descriptions
- Key dependencies
- Entry points
- Configuration files
- Naming conventions

## Query Key Structure

```typescript
// Examples of TanStack Query keys
const queryKeys = {
  timelines: {
    home: ['timelines', 'home'],
    public: ['timelines', 'public'],
  },
  statuses: {
    detail: (id: string) => ['statuses', id],
    context: (id: string) => ['statuses', id, 'context'],
  },
  accounts: {
    detail: (id: string) => ['accounts', id],
    statuses: (id: string) => ['accounts', id, 'statuses'],
  },
  bookmarks: ['bookmarks'],
  search: (q: string, type?: string) => ['search', q, type],
};
```

## Optimistic Update Pattern

```typescript
// Example mutation with optimistic update
const likeMutation = useMutation({
  mutationFn: (statusId: string) => api.statuses.favourite(statusId),
  onMutate: async (statusId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['statuses', statusId]);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['statuses', statusId]);

    // Optimistically update
    queryClient.setQueryData(['statuses', statusId], (old) => ({
      ...old,
      favourited: true,
      favourites_count: old.favourites_count + 1,
    }));

    return { previous };
  },
  onError: (err, statusId, context) => {
    // Rollback on error
    queryClient.setQueryData(['statuses', statusId], context.previous);
  },
  onSettled: (statusId) => {
    // Refetch after mutation
    queryClient.invalidateQueries(['statuses', statusId]);
  },
});
```

## Styling Approach

Using Open Props with PostCSS:

```css
/* Example component styles */
.post-card {
  background: var(--surface-2);
  border-radius: var(--radius-2);
  padding: var(--size-3);
  box-shadow: var(--shadow-2);
}

.post-card:hover {
  box-shadow: var(--shadow-3);
  transform: translateY(var(--size-1));
}
```

## Development Workflow

1. Start with foundation (Tasks 1-4)
2. Build infrastructure (Tasks 5-8)
3. Implement auth (Task 9)
4. Create component library (Tasks 10-12)
5. Build features page by page (Tasks 13-19)
6. Polish and optimize (Tasks 20-24)

## Success Criteria

- Fast, responsive UI with virtual scrolling
- Smooth animations with View Transitions and Motion
- Optimistic updates for all user actions
- Type-safe API integration
- Clean atomic component architecture
- Comprehensive documentation
