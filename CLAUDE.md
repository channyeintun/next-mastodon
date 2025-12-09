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
│   ├── app/                   # Next.js App Router with route groups
│   │   ├── (main)/           # Main app layout route group
│   │   │   ├── [acct]/       # User profile pages (/@username or /@username@domain)
│   │   │   │   ├── followers/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── following/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── bookmarks/    # Bookmarks page
│   │   │   │   └── page.tsx
│   │   │   ├── compose/      # Create post page
│   │   │   │   └── page.tsx
│   │   │   ├── explore/      # Explore/discover page
│   │   │   │   └── page.tsx
│   │   │   ├── follow-requests/  # Follow requests management
│   │   │   │   └── page.tsx
│   │   │   ├── lists/        # Lists management
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── members/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/  # Notifications page
│   │   │   │   └── page.tsx
│   │   │   ├── profile/      # Current user profile
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   ├── scheduled/    # Scheduled posts
│   │   │   │   └── page.tsx
│   │   │   ├── search/       # Search page
│   │   │   │   └── page.tsx
│   │   │   ├── settings/     # Settings pages
│   │   │   │   ├── blocks/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── mutes/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── status/[id]/  # Status detail pages
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── tags/[tag]/   # Hashtag feed pages
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx    # Main layout wrapper
│   │   │   └── page.tsx      # Home page (timeline)
│   │   ├── (auth)/           # Auth layout route group
│   │   │   ├── auth/
│   │   │   │   ├── callback/  # OAuth callback handler
│   │   │   │   │   └── page.tsx
│   │   │   │   └── signin/    # Sign in page
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx     # Auth layout wrapper
│   │   ├── globals.css       # Global styles with Open Props
│   │   └── layout.tsx        # Root layout with providers
│   ├── api/                  # Mastodon API client and TanStack Query
│   │   ├── client.ts         # Base API client with fetch wrapper
│   │   ├── mutations.ts      # TanStack Query mutations with optimistic updates
│   │   ├── queries.ts        # TanStack Query hooks for data fetching
│   │   ├── queryKeys.ts      # Query key factory for cache management
│   │   └── index.ts          # API exports
│   ├── components/           # Atomic design components
│   │   ├── atoms/            # Basic UI elements
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmojiText.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ScrollToTopButton.tsx
│   │   │   ├── SkipToMain.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── TiptapEditor.tsx
│   │   │   └── index.ts
│   │   ├── molecules/        # Simple component combinations
│   │   │   ├── AccountCard.tsx
│   │   │   ├── AccountProfileSkeleton.tsx
│   │   │   ├── AuthModalBridge.tsx
│   │   │   ├── DeletePostModal.tsx
│   │   │   ├── LinkPreview.tsx
│   │   │   ├── MediaUpload.tsx
│   │   │   ├── MentionSuggestions.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── NotificationCard.tsx
│   │   │   ├── NotificationSkeleton.tsx
│   │   │   ├── PollComposer.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostCardSkeleton.tsx
│   │   │   ├── ScheduledCardSkeleton.tsx
│   │   │   ├── StatusContent.tsx
│   │   │   ├── StatusEditHistory.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── TrendingLinkCard.tsx
│   │   │   ├── TrendingTagCard.tsx
│   │   │   ├── UserCard.tsx
│   │   │   ├── VisibilitySettingsModal.tsx
│   │   │   └── index.ts
│   │   ├── organisms/        # Complex components
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── ComposerPanel.tsx
│   │   │   ├── EmojiPicker.tsx
│   │   │   ├── NavigationWrapper.tsx
│   │   │   ├── TrendingContent.tsx
│   │   │   └── VirtualizedList.tsx
│   │   ├── providers/        # React context providers
│   │   │   ├── QueryProvider.tsx   # TanStack Query provider
│   │   │   ├── ScrollRestorationProvider.tsx
│   │   │   ├── StoreProvider.tsx   # MobX store provider
│   │   │   ├── StreamingProvider.tsx  # Real-time streaming provider
│   │   │   └── ThemeProvider.tsx
│   │   └── templates/        # Page layouts
│   ├── contexts/             # React context definitions
│   │   └── GlobalModalContext.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useScrollDirection.ts
│   │   ├── useSearchHistory.ts
│   │   ├── useStores.ts      # MobX store hooks
│   │   ├── useStreaming.ts   # Real-time streaming hooks
│   │   └── README.md
│   ├── lib/                  # Library code and extensions
│   │   └── tiptap/           # Tiptap extensions and configurations
│   │       ├── extensions/   # Custom Tiptap extensions
│   │       │   ├── CustomEmoji.ts      # Custom Mastodon emoji node
│   │       │   ├── ExternalLink.ts     # External link configuration
│   │       │   ├── Hashtag.ts          # Hashtag mark with click navigation
│   │       │   └── MentionWithClick.ts # Enhanced mention with click navigation
│   │       └── MentionSuggestion.tsx   # Mention autocomplete UI
│   ├── stores/               # MobX global state stores
│   │   ├── authStore.ts      # Authentication state (tokens, instance URL)
│   │   ├── rootStore.ts      # Root store combining all stores
│   │   ├── streamingStore.ts # Real-time streaming state
│   │   ├── userStore.ts      # Current user data
│   │   ├── index.ts          # Store exports
│   │   └── README.md
│   ├── types/                # TypeScript type definitions
│   │   ├── mastodon.ts       # Mastodon API types (includes Emoji array in Status)
│   │   └── index.ts          # Type exports
│   ├── utils/                # Utility functions
│   │   ├── account.ts        # Account helper functions
│   │   ├── cookies.ts        # Cookie management utilities
│   │   ├── oauth.ts          # OAuth flow helpers
│   │   ├── tiptapExtensions.ts  # Tiptap extension utilities
│   │   └── README.md
│   └── proxy.ts              # Proxy configuration
├── .claude/                  # Claude Code configuration
├── .git/                     # Git repository
├── .gitignore                # Git ignore rules
├── .next/                    # Next.js build output (gitignored)
├── .vscode/                  # VS Code configuration
├── example/                  # Example files and documentation
├── node_modules/             # Dependencies
├── CLAUDE.md                 # This file - project structure documentation
├── README.md                 # Project readme
├── eslint.config.js          # ESLint configuration with CSS baseline linting
├── next-env.d.ts             # Next.js TypeScript declarations
├── next.config.ts            # Next.js configuration (with React Compiler)
├── package-lock.json         # Lockfile
├── package.json              # Dependencies and scripts (type: module)
├── plan.md                   # Project planning document
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
└── tsconfig.tsbuildinfo      # TypeScript incremental build info (gitignored)
```

## Directory Descriptions

### `/src/app/`
Next.js App Router with file-based routing using route groups for different layouts:

**Route Group: `(main)/`** - Main application routes with navigation
- **Root** (`/`): Home timeline page (shows trending timeline from mastodon.social when not signed in)
- **`/compose`**: Create new post page
- **`/status/[id]`**: Status detail with thread context
- **`/status/[id]/edit`**: Edit existing status
- **`/bookmarks`**: Bookmarked posts
- **`/explore`**: Explore/discover page with trending content
- **`/notifications`**: Notifications page
- **`/scheduled`**: Scheduled posts management
- **`/follow-requests`**: Follow requests management
- **`/[acct]`**: User profile and posts (accessed via `/@username` or `/@username@domain`, requires @ prefix)
- **`/[acct]/followers`**: User's followers list
- **`/[acct]/following`**: User's following list
- **`/tags/[tag]`**: Hashtag feed page with infinite scroll (e.g., `/tags/opensource`)
- **`/search`**: Search functionality
- **`/profile/edit`**: Edit current user's profile
- **`/settings`**: Account settings
- **`/settings/blocks`**: Blocked accounts
- **`/settings/mutes`**: Muted accounts
- **`/lists`**: Lists overview
- **`/lists/[id]`**: Individual list timeline
- **`/lists/[id]/members`**: List members management

**Route Group: `(auth)/`** - Authentication routes without main navigation
- **`/auth/signin`**: OAuth sign in
- **`/auth/callback`**: OAuth callback handler

**Special files:**
- `layout.tsx`: Root layout with QueryProvider, StoreProvider, ThemeProvider, and StreamingProvider
- `(main)/layout.tsx`: Main layout with navigation wrapper
- `(auth)/layout.tsx`: Auth layout without navigation
- `globals.css`: Global styles using Open Props

### `/src/api/`
Mastodon API client and TanStack Query integration. Contains:
- **client.ts**: Base HTTP client with authentication and request/response handling
- **queries.ts**: TanStack Query hooks for data fetching (including infinite queries)
- **mutations.ts**: TanStack Query mutations with optimistic updates
- **queryKeys.ts**: Centralized query key factory for consistent caching

### `/src/components/`
Atomic design pattern components:
- **atoms/**: Smallest UI building blocks
  - Avatar, Badge, Button, Card, EmojiText, IconButton, Input, ScrollToTopButton, SkipToMain, Spinner, Tabs, TextArea, TiptapEditor
- **molecules/**: Simple component combinations
  - AccountCard, AccountProfileSkeleton, AuthModalBridge, DeletePostModal, LinkPreview, MediaUpload, MentionSuggestions, Navigation, NotificationCard, NotificationSkeleton, PollComposer, PostCard, PostCardSkeleton, ScheduledCardSkeleton, StatusContent, StatusEditHistory, ThemeSelector, TrendingLinkCard, TrendingTagCard, UserCard, VisibilitySettingsModal
- **organisms/**: Complex components
  - AuthGuard (authentication route protection), ComposerPanel (post composition), EmojiPicker, NavigationWrapper (auth integration), TrendingContent, VirtualizedList (infinite scroll)
- **templates/**: Page layouts (currently empty, layouts handled by route groups)
- **providers/**: React context providers
  - QueryProvider (TanStack Query), ScrollRestorationProvider, StoreProvider (MobX), StreamingProvider (real-time updates), ThemeProvider

### `/src/hooks/`
Custom React hooks:
- **useStores.ts**: Access MobX stores (useAuthStore, useUserStore, useStreamingStore)
- **useStreaming.ts**: Real-time Mastodon streaming API integration
- **useScrollDirection.ts**: Detect scroll direction for UI enhancements
- **useSearchHistory.ts**: Manage search history in localStorage

### `/src/stores/`
MobX stores for global state management:
- **authStore.ts**: Authentication (access token, instance URL, client credentials)
- **userStore.ts**: Current user profile and data
- **streamingStore.ts**: Real-time streaming state and WebSocket connections
- **rootStore.ts**: Combines all stores into singleton

### `/src/contexts/`
React context definitions:
- **GlobalModalContext.tsx**: Global modal management context

### `/src/types/`
TypeScript type definitions:
- **mastodon.ts**: Comprehensive types for Mastodon API entities (Status, Account, Context, etc.)

### `/src/utils/`
Utility functions:
- **oauth.ts**: OAuth flow helpers (URL generation, token exchange)
- **account.ts**: Account-related utility functions
- **cookies.ts**: Cookie management utilities (using native cookieStore API)
- **tiptapExtensions.ts**: Tiptap editor extension utilities

## Key Files

### `package.json`
Dependencies and scripts:
- **Type**: ES module (`"type": "module"`)
- **Main dependencies**: Next.js 16, React 19, TanStack Query, MobX, Motion, Tiptap, Open Props
- **Dev dependencies**: ESLint, @eslint/css (CSS baseline linting)
- **Scripts**:
  - `dev`: Start development server with Turbopack
  - `build`: Build for production
  - `start`: Start production server
  - `lint`: Run ESLint on all files
  - `lint:css`: Run ESLint on CSS files only
  - `lint:fix`: Run ESLint with auto-fix

### `eslint.config.js`
ESLint configuration with CSS baseline linting:
- **@eslint/css plugin**: Official ESLint CSS language plugin
- **Baseline checking**: Warns when using CSS features not widely available
- **Rules enabled**:
  - `css/no-duplicate-imports`: Error on duplicate CSS @import rules
  - `css/no-empty-blocks`: Warn on empty CSS blocks
  - `css/use-baseline`: Warn when using non-widely-available CSS features
- **Ignored directories**: .next/, node_modules/, dist/, build/, out/, *.min.css
- Helps ensure CSS compatibility across browsers

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
- Custom CSS properties:
  - `--app-max-width`: Maximum content width (1200px)
  - `--app-sidebar-width`: Desktop sidebar width (280px)
  - `--app-bottom-nav-height`: Mobile bottom navigation height (64px)
- View Transitions CSS
- Utility classes (container, spinner)
- Navigation styles:
  - Sidebar for desktop (full height with header, nav links, footer)
  - Bottom bar for mobile
  - Logo, instance URL, sign in/out buttons
- Responsive breakpoints (768px tablet, 1024px desktop)
- Layout adjustments (body margins/padding for sidebar and bottom nav)

### `tsconfig.json`
TypeScript configuration:
- Path alias: `@/*` → `./src/*`
- Configured for Next.js and React 19