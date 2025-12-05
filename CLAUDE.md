# Project: Mastodon (Next.js)

A minimal, performant social media frontend for Mastodon built with Next.js 16 and modern React patterns.

## Project Structure
```
mastodon-nextjs-client/
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [acct]/           # Account detail pages (/@username or /@username@domain)
│   │   │   └── page.tsx
│   │   ├── auth/             # Authentication routes
│   │   │   ├── callback/     # OAuth callback handler
│   │   │   │   └── page.tsx
│   │   │   └── signin/       # Sign in page
│   │   │       └── page.tsx
│   │   ├── bookmarks/        # Bookmarks page
│   │   │   └── page.tsx
│   │   ├── compose/          # Create post page
│   │   │   └── page.tsx
│   │   ├── search/           # Search page
│   │   │   └── page.tsx
│   │   ├── settings/         # Settings page
│   │   │   └── page.tsx
│   │   ├── status/[id]/      # Status detail pages
│   │   │   └── page.tsx
│   │   ├── tags/[tag]/       # Hashtag feed pages
│   │   │   └── page.tsx
│   │   ├── favicon.ico       # App favicon
│   │   ├── globals.css       # Global styles with Open Props
│   │   ├── layout.tsx        # Root layout with providers
│   │   └── page.tsx          # Home page (timeline)
│   ├── api/                  # Mastodon API client and TanStack Query
│   │   ├── client.ts         # Base API client with fetch wrapper
│   │   ├── queries.ts        # TanStack Query hooks for data fetching
│   │   ├── mutations.ts      # TanStack Query mutations with optimistic updates
│   │   ├── queryKeys.ts      # Query key factory for cache management
│   │   └── index.ts          # API exports
│   ├── components/           # Atomic design components
│   │   ├── atoms/            # Basic UI elements (Button, Input, Avatar, etc.)
│   │   ├── molecules/        # Simple combinations (PostCard, UserCard, etc.)
│   │   ├── organisms/        # Complex components (Timeline, ComposerPanel, etc.)
│   │   ├── templates/        # Page layouts
│   │   └── providers/        # React context providers
│   │       ├── QueryProvider.tsx   # TanStack Query provider
│   │       └── StoreProvider.tsx   # MobX store provider
│   ├── hooks/                # Custom React hooks
│   │   ├── useStores.ts      # MobX store hooks
│   │   ├── useViewTransition.ts  # View Transitions API hook
│   │   └── README.md
│   ├── stores/               # MobX global state stores
│   │   ├── authStore.ts      # Authentication state (tokens, instance URL)
│   │   ├── userStore.ts      # Current user data
│   │   ├── uiStore.ts        # UI state (modals, sidebars, theme)
│   │   ├── rootStore.ts      # Root store combining all stores
│   │   ├── index.ts          # Store exports
│   │   └── README.md
│   ├── types/                # TypeScript type definitions
│   │   ├── mastodon.ts       # Mastodon API types
│   │   └── index.ts          # Type exports
│   └── utils/                # Utility functions
│       ├── oauth.ts          # OAuth helper functions
│       ├── viewTransitions.ts  # View Transitions API helpers
│       └── README.md
├── .git/                     # Git repository
├── .gitignore                # Git ignore rules
├── .next/                    # Next.js build output (gitignored)
├── node_modules/             # Dependencies
├── MASTODON_API_REFERENCE.md # Mastodon API reference documentation
├── README.md                 # Project readme
├── CLAUDE.md                 # This file - project structure documentation
├── next-env.d.ts             # Next.js TypeScript declarations
├── next.config.ts            # Next.js configuration (with React Compiler)
├── package.json              # Dependencies and scripts
├── package-lock.json         # Lockfile
├── postcss.config.mjs        # PostCSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Directory Descriptions

### `/src/app/`
Next.js App Router with file-based routing. Each folder with a `page.tsx` becomes a route:
- **Root** (`/`): Home timeline page
- **`/compose`**: Create new post page
- **`/status/[id]`**: Status detail with thread context
- **`/bookmarks`**: Bookmarked posts
- **`/[acct]`**: User profile and posts (accessed via `/@username` or `/@username@domain`, requires @ prefix)
- **`/tags/[tag]`**: Hashtag feed page with infinite scroll (e.g., `/tags/opensource`)
- **`/search`**: Search functionality
- **`/settings`**: Account settings
- **`/auth/signin`**: OAuth sign in
- **`/auth/callback`**: OAuth callback handler

**Special files:**
- `layout.tsx`: Root layout with QueryProvider and StoreProvider
- `globals.css`: Global styles using Open Props

### `/src/api/`
Mastodon API client and TanStack Query integration. Contains:
- **client.ts**: Base HTTP client with authentication and request/response handling
- **queries.ts**: TanStack Query hooks for data fetching (including infinite queries)
- **mutations.ts**: TanStack Query mutations with optimistic updates
- **queryKeys.ts**: Centralized query key factory for consistent caching

### `/src/components/`
Atomic design pattern components:
- **atoms/**: Smallest UI building blocks (Button, Input, Avatar, Card, Icon, Badge, Spinner, Link)
- **molecules/**: Simple component combinations (PostCard, UserCard, SearchBar, Navigation, ActionBar, MediaGallery)
- **organisms/**: Complex components (Timeline, ComposerPanel, ThreadView, ProfileHeader)
- **templates/**: Page layouts (MainLayout, AuthLayout, SettingsLayout)
- **providers/**: React context providers for app-wide state

### `/src/hooks/`
Custom React hooks:
- **useStores.ts**: Access MobX stores (useAuthStore, useUserStore, useUIStore)
- **useViewTransition.ts**: View Transitions API wrapper

### `/src/stores/`
MobX stores for global state management:
- **authStore.ts**: Authentication (access token, instance URL, client credentials)
- **userStore.ts**: Current user profile and data
- **uiStore.ts**: UI state (theme, modals, sidebars)
- **rootStore.ts**: Combines all stores into singleton

### `/src/types/`
TypeScript type definitions:
- **mastodon.ts**: Comprehensive types for Mastodon API entities (Status, Account, Context, etc.)

### `/src/utils/`
Utility functions:
- **oauth.ts**: OAuth flow helpers (URL generation, token exchange)
- **viewTransitions.ts**: View Transitions API helpers

## Key Files

### `package.json`
Dependencies and scripts:
- **Main dependencies**: Next.js 16, React 19, TanStack Query, MobX, Motion, Tiptap, Open Props
- **Scripts**:
  - `dev`: Start development server with Turbopack
  - `build`: Build for production
  - `start`: Start production server

### `next.config.ts`
Next.js configuration:
- **reactCompiler: true**: Enables React Compiler for automatic memoization
- Uses Turbopack for fast development builds

### `postcss.config.mjs`
PostCSS configuration:
- postcss-import
- postcss-nesting
- autoprefixer

### `src/app/globals.css`
Global styles using Open Props:
- Open Props imports (style, normalize, buttons)
- Custom CSS properties (app-specific variables)
- View Transitions CSS
- Utility classes (container, spinner)

### `tsconfig.json`
TypeScript configuration:
- Path alias: `@/*` → `./src/*`
- Configured for Next.js and React 19

## Dependencies

### Production
- **next** (^16.0.7): React framework with App Router
- **react** (^19.2.0): UI library
- **react-dom** (^19.2.0): React DOM renderer
- **@tanstack/react-query** (^5.66.5): Server state management
- **@tanstack/react-query-devtools**: DevTools for React Query
- **@tanstack/react-virtual**: Virtual scrolling for lists
- **@tanstack/react-form**: Form state management
- **mobx**: State management
- **mobx-react-lite**: React bindings for MobX
- **mobx-persist-store**: MobX state persistence
- **motion**: Animation library
- **@tiptap/react**: Rich text editor
- **@tiptap/starter-kit**: Tiptap base extensions
- **@tiptap/extension-placeholder**: Placeholder extension
- **@tiptap/extension-mention**: Mention extension
- **open-props**: CSS design tokens
- **postcss-import**: PostCSS imports
- **postcss-nesting**: CSS nesting
- **autoprefixer**: CSS autoprefixing
- **lucide-react**: Icon library

### Development
- **@types/node** (^20): Node.js type definitions
- **@types/react** (^19): React type definitions
- **@types/react-dom** (^19): React DOM type definitions
- **babel-plugin-react-compiler** (^1.0.0): React Compiler for optimization
- **typescript** (^5): TypeScript compiler

## Architecture Patterns

### Next.js App Router
- **File-based routing**: Each folder in `app/` with `page.tsx` becomes a route
- **Server Components by default**: Components are Server Components unless marked with `'use client'`
- **Dynamic routes**: Use `[param]` for dynamic segments (e.g., `status/[id]`)
- **Layouts**: `layout.tsx` wraps child pages with shared UI

### Atomic Design
Components are organized by complexity:
1. **Atoms**: Basic building blocks
2. **Molecules**: Simple combinations
3. **Organisms**: Complex components
4. **Templates**: Page layouts

### State Management Strategy
- **MobX**: Global state (auth, user, UI preferences)
- **TanStack Query**: Server state (API data, caching, optimistic updates)
- **TanStack Form**: Form state
- **React state**: Local component state

### Data Fetching Pattern
- Use TanStack Query hooks from `/src/api/queries.ts`
- Infinite queries for timelines with virtual scrolling
- Optimistic updates for all mutations
- Consistent query key structure via factory

### Styling Approach
- **Open Props**: CSS design tokens for consistent design ([Documentation](https://open-props.style/) | [DeepWiki Reference](https://deepwiki.com/argyleink/open-props))
- **PostCSS**: Nesting, imports, autoprefixing
- **No Tailwind**: Custom CSS with Open Props variables
- **View Transitions**: Native browser animations
- **CSS animations**: Using CSS keyframes and transitions (Motion library removed due to TypeScript compatibility issues in strict mode)
- **CSS Modules**: Available for component-scoped styles (use `*.module.css`)

## Authentication Flow

1. User enters Mastodon instance URL
2. App creates OAuth application on that instance
3. User is redirected to instance for authorization
4. Instance redirects to `/auth/callback` with auth code
5. App exchanges auth code for access token
6. Token and instance URL stored in MobX authStore (persisted to localStorage)
7. All API requests include `Authorization: Bearer {token}` header

## Features Status

### Completed Infrastructure & Features
- [x] Next.js 16 project with App Router
- [x] TanStack Query with provider
- [x] MobX stores ported from TanStack Start
- [x] PostCSS with Open Props (with documentation references)
- [x] Atomic component architecture folders
- [x] React Compiler enabled
- [x] Mastodon API client ported
- [x] All route pages created
- [x] TypeScript types ported
- [x] View Transitions utilities
- [x] Authentication flow (OAuth) with Next.js
- [x] Next.js proxy for route protection
- [x] UI atoms (Button, Input, Avatar, Card, IconButton, Spinner, TextArea, Badge, EmojiText, StatusContent)
- [x] UI molecules (PostCard, UserCard, MentionSuggestions)
- [x] UI organisms (ComposerPanel with Tiptap, EmojiPicker with emoji-mart, Header, AuthGuard)
- [x] Timeline page with infinite scroll (TanStack Virtual + deduplication)
- [x] Status detail page with full thread context
- [x] Bookmarks page with infinite scroll (+ deduplication)
- [x] Account page with profile & posts timeline (+ deduplication)
- [x] Search page with tabs (accounts, statuses, hashtags)
- [x] Compose page with Tiptap editor (visibility, content warnings, character count)
- [x] Optimistic updates for all mutations (favorite, reblog, bookmark, poll voting)
- [x] Content Warning hiding/revealing in PostCard
- [x] Interactive poll voting with two modes (voting interface & results visualization)
- [x] Media upload functionality (images, videos, up to 4 attachments) in ComposerPanel
- [x] Poll creation in composer (PollComposer component)
- [x] Custom emoji rendering (EmojiText component for Mastodon custom emojis)
- [x] Mention suggestions in composer (useMentionAutocomplete hook with @ detection)
- [x] Professional emoji picker (emoji-mart library) with custom emoji support
- [x] Duplicate status deduplication in virtualized lists (pagination overlap handling)
- [x] Production build passing with TypeScript strict mode
- [x] Clickable mentions and hashtags with internal navigation (no external redirects)
- [x] Highlighted mentions (blue) and hashtags (indigo) in post content
- [x] Dedicated hashtag feed page with infinite scroll (`/tags/[tag]`)

### To Be Implemented
- [ ] Settings page (profile editing)
- [ ] Activity component (visibility toggling)
- [ ] Link preview cards
- [ ] Notifications page

## Implementation Notes

### Content Warning (Spoiler Text)
- PostCard checks for `spoiler_text` presence and trims whitespace
- **Two-step reveal process for sensitive content**:

  **Step 1 - Show Content Button**:
  - Initial state: Content warning banner displayed, text/polls/media all hidden
  - User clicks "Show content" button → reveals text content and polls
  - Media appears but heavily blurred (32px blur)

  **Step 2 - Media Unblur Button**:
  - After Step 1, blurred media shown with semi-transparent overlay
  - Overlay displays "👁️ Click to view sensitive content" button
  - User clicks button → media unblurs with smooth transition (0.2s ease)

- **Separate state management**:
  - `showCWContent` controls text/polls visibility and media visibility
  - `showCWMedia` controls media blur state
- Preserves user's choices during session

### Poll Functionality
- **Two modes in PostCard**:
  1. **Voting mode** (not voted & not expired): Shows radio/checkbox inputs, Vote button
  2. **Results mode** (voted or expired): Shows percentage bars, vote counts, own votes highlighted
- **Poll creation in ComposerPanel**:
  - PollComposer component with add/remove options
  - Configurable as single or multiple choice
  - Expiration time selector (30 mins to 7 days)
- **API integration**: `getPoll()`, `votePoll()` with optimistic cache updates

### Emoji System
- **emoji-mart library**: Professional picker with full Unicode database
  - Skin tone support, search, frequently used tracking
  - Two tabs: Standard emojis and Custom Mastodon emojis
- **EmojiText component**: Renders custom Mastodon emojis in display names and content
  - Regex-based shortcode detection (`:emoji_name:`)
  - Replaces with `<img>` tags from emoji.url

### Mention Autocomplete
- **useMentionAutocomplete hook**: Detects `@` in composer
- Searches Mastodon API for matching accounts
- MentionSuggestions component with keyboard navigation (↑/↓, Enter, Esc)
- Calculates popup position based on cursor location

### Media Upload
- MediaUpload component in ComposerPanel
- Supports up to 4 attachments (images/videos)
- Preview thumbnails with remove button
- File input with drag & drop (future enhancement)

### Virtualized List Deduplication
- **Problem**: Pagination overlaps caused duplicate status IDs, triggering React key errors
- **Solution**: Map-based deduplication in all infinite query pages
```typescript
const uniqueStatuses = Array.from(
  new Map(allStatuses.map((status) => [status.id, status])).values()
);
```
- Applied to: Home timeline, Bookmarks, Account pages

### TypeScript Strict Mode Fixes
- Motion library incompatible with DOM element animation types
- Replaced with CSS transitions and keyframe animations
- Fixed RefObject nullable types in hooks
- Added null assertion for poll rendering (IIFE pattern for type narrowing)

### Account Routing by Handle
- **Route**: `/[acct]/page.tsx` - dynamic route for account profiles
- **URL Pattern**: `/@username` or `/@username@domain.com` (requires @ prefix)
- **Implementation**:
  - Route folder: `/app/[acct]`
  - URL decoding: `decodeURIComponent()` to handle `@` → `%40` encoding
  - Parameter validation: Checks if `acct` starts with `@`, throws error if not (shows 404)
  - Handle extraction: Strips @ prefix, uses result for API lookup
  - API: `lookupAccount(acct)` endpoint (`/api/v1/accounts/lookup?acct=username`)
- **Links**: All account links use `/@${account.acct}` format
  - PostCard: User avatar and display name
  - UserCard: Entire card wrapper
  - Settings: Back button navigation
- **Benefits**:
  - Cleaner URLs (no `/accounts` prefix)
  - Consistent with social media conventions
  - Supports both local (`/@user`) and remote (`/@user@instance`) handles

### Search Query Parameter Handling
- **Issue**: `URLSearchParams` converts `undefined` values to literal string `"undefined"`
- **Example**: `{ q: 'test', type: undefined }` → `"?q=test&type=undefined"`
- **Solution**: Filter out undefined values before creating URLSearchParams
```typescript
const filteredParams = Object.fromEntries(
  Object.entries(params).filter(([_, value]) => value !== undefined)
)
const query = new URLSearchParams(filteredParams).toString()
```
- **Result**: When searching with "all" tab, URL becomes `?q=test` instead of `?q=test&type=undefined`
- **URL Parameters**: Search page reads `?q=` parameter from URL and automatically populates search box
- **Hashtag Auto-tab**: If query starts with `#`, automatically switches to "hashtags" tab

### Clickable Mentions and Hashtags
- **Component**: `StatusContent` - replaces `dangerouslySetInnerHTML` for status content
- **Styling**:
  - Mentions: `var(--blue-6)` color, bold font weight
  - Hashtags: `var(--indigo-6)` color, bold font weight
- **Click Behavior**:
  - **Mentions**: Click navigates to `/@username` (internal routing, no external redirect)
  - **Hashtags**: Click navigates to `/tags/hashtag` - dedicated hashtag feed page
  - **Other Links**: Open in new tab with `noopener,noreferrer`
- **Implementation**:
  - Uses `useEffect` to attach click listeners after HTML is rendered
  - Queries for `.mention`, `.u-url`, and `.hashtag` classes (Mastodon API classes)
  - Extracts username/hashtag from link text content
  - Uses Next.js `useRouter` for internal navigation
  - Prevents default link behavior and stops propagation

### Hashtag Feed Page
- **Route**: `/tags/[tag]/page.tsx` - dedicated page for hashtag timelines
- **API**: `getHashtagTimeline(hashtag)` endpoint (`/api/v1/timelines/tag/:hashtag`)
- **Features**:
  - Infinite scroll with TanStack Virtual
  - Deduplication of statuses
  - Header with hashtag icon and name
  - Empty state when no posts found
  - Back button navigation to home
- **Query Hook**: `useInfiniteHashtagTimeline(hashtag)` - fetches paginated hashtag timeline
- **URL Format**: `/tags/opensource`, `/tags/nextjs`, etc.

## Development Workflow

1. **Start dev server**: `npm run dev` (runs on http://localhost:3000)
2. **Build for production**: `npm run build`
3. **Start production server**: `npm run start`

## API Integration

All Mastodon API interactions go through `/src/api/client.ts`. The client:
- Handles base URL configuration
- Manages authentication headers
- Provides typed methods for all endpoints
- Integrates with TanStack Query for caching and optimistic updates

See `MASTODON_API_REFERENCE.md` for detailed API documentation.

## Migration from TanStack Start

This project was migrated from TanStack Start to Next.js due to persistent CSS loading issues (FOUC) in TanStack Start. See `MIGRATION_DECISION.md` in the parent directory for details.

**What was reused (100%):**
- Mastodon API client code
- TanStack Query hooks (queries, mutations, query keys)
- MobX stores
- TypeScript types
- Utility functions
- OAuth logic

**What was replaced:**
- TanStack Start → Next.js App Router
- TanStack Router → Next.js file-based routing
- SSR configuration → Next.js automatic SSR

## Configuration

### Environment Variables
(To be added for production deployment)
- Instance URL: Stored in authStore
- Client credentials: Stored in authStore (persisted to localStorage)

### TypeScript
- Strict mode enabled
- Path alias `@/*` configured for clean imports
- React 19 types

### Code Quality
- React Compiler for automatic optimization
- TypeScript for type safety
- Next.js built-in linting (can add ESLint config if needed)

## Notes

- This is a client-side application that connects to any Mastodon instance
- No backend server required (Next.js handles SSR/SSG)
- All data fetched from Mastodon instance APIs
- State persistence via localStorage (MobX stores)
- Optimistic UI updates for instant feedback
- **No CSS loading issues** - Next.js handles SSR/CSS extraction properly
