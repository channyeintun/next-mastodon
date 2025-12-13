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
├── scripts/                    # Build and deployment scripts
│   └── ignore-build.sh        # Vercel build ignore script
├── example/                    # Example files and documentation
│   └── compose/
│       └── README.md          # Compose feature documentation
├── src/
│   ├── app/                   # Next.js App Router with route groups
│   │   ├── (main)/           # Main app layout route group
│   │   │   ├── [acct]/       # User profile pages (/@username or /@username@domain)
│   │   │   │   ├── followers/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── following/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── styles.ts  # Profile page styled components
│   │   │   │   └── page.tsx
│   │   │   ├── bookmarks/    # Bookmarks page
│   │   │   │   └── page.tsx
│   │   │   ├── compose/      # Create post page
│   │   │   │   └── page.tsx
│   │   │   ├── conversations/  # Direct messages (conversations)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx  # Conversation thread with messages
│   │   │   │   └── page.tsx     # Conversations list
│   │   │   ├── explore/      # Explore/discover page
│   │   │   │   └── page.tsx
│   │   │   ├── follow-requests/  # Follow requests management
│   │   │   │   └── page.tsx
│   │   │   ├── lists/        # Lists management
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── members/
│   │   │   │   │   │   ├── MemberComponents.tsx  # List member UI components
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── ListComponents.tsx  # List UI components
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/  # Notifications page
│   │   │   │   ├── NotificationsV1.tsx  # V1 notifications implementation
│   │   │   │   ├── NotificationsV2.tsx  # V2 grouped notifications implementation
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
│   │   │   │   ├── preferences/  # User preferences settings
│   │   │   │   │   ├── SelectStyles.tsx  # Styled select components
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── SettingsClient.tsx  # Settings client component
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
│   ├── components/           # Atomic design components (strict LOC limits enforced by ESLint)
│   │   ├── atoms/            # Basic UI elements (max 120 LOC)
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CheckboxField.tsx         # Reusable checkbox with label + description
│   │   │   ├── CircleSkeleton.tsx        # Circular skeleton loader for icons/avatars
│   │   │   ├── ContentWarningInput.tsx
│   │   │   ├── Dialog.tsx                # Base dialog/modal with Header, Body, Footer
│   │   │   ├── EmptyState.tsx            # Empty state with icon, title, description
│   │   │   ├── EmojiText.tsx
│   │   │   ├── FormField.tsx             # Reusable form field wrapper
│   │   │   ├── IconButton.tsx
│   │   │   ├── ImageSkeleton.tsx         # Image skeleton loader
│   │   │   ├── Input.tsx
│   │   │   ├── ScheduleInput.tsx
│   │   │   ├── ScrollToTopButton.tsx
│   │   │   ├── SensitiveContentButton.tsx # Sensitive media toggle button
│   │   │   ├── SkipToMain.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── TextSkeleton.tsx          # Text skeleton loader
│   │   │   ├── TiptapEditor.tsx
│   │   │   └── index.ts
│   │   ├── molecules/        # Simple component combinations (max 200 LOC)
│   │   │   ├── AccountCard.tsx
│   │   │   ├── AccountProfileSkeleton.tsx
│   │   │   ├── AuthModalBridge.tsx
│   │   │   ├── ComposerToolbar.tsx
│   │   │   ├── ContentWarningSection.tsx  # Extracted from PostCard
│   │   │   ├── ConversationCard.tsx       # Conversation list item with unread indicator
│   │   │   ├── DeletePostModal.tsx
│   │   │   ├── GroupedNotificationCard.tsx
│   │   │   ├── HandleExplainer.tsx
│   │   │   ├── ImageCropper.tsx
│   │   │   ├── LinkPreview.tsx
│   │   │   ├── ListItemSkeleton.tsx      # List item skeleton loader
│   │   │   ├── MediaGrid.tsx
│   │   │   ├── MediaGridSkeleton.tsx     # Media grid skeleton loader
│   │   │   ├── MediaModal.tsx            # Fullscreen media viewer with navigation
│   │   │   ├── MediaUpload.tsx
│   │   │   ├── MentionSuggestions.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── NotificationCard.tsx
│   │   │   ├── NotificationSkeleton.tsx
│   │   │   ├── PageHeaderSkeleton.tsx    # Page header skeleton loader
│   │   │   ├── PollComposer.tsx
│   │   │   ├── PostActions.tsx
│   │   │   ├── PostCardSkeleton.tsx
│   │   │   ├── PostHeader.tsx
│   │   │   ├── PostPoll.tsx
│   │   │   ├── PrivacySettingsForm.tsx    # Extracted from profile/edit
│   │   │   ├── ProfileActionButtons.tsx
│   │   │   ├── ProfileBio.tsx
│   │   │   ├── ProfileEditorSkeleton.tsx  # Extracted from profile/edit
│   │   │   ├── ProfileFields.tsx
│   │   │   ├── ProfileFieldsEditor.tsx    # Extracted from profile/edit
│   │   │   ├── ProfileImageUploader.tsx   # Extracted from profile/edit
│   │   │   ├── ProfilePillSkeleton.tsx    # Loading skeleton for profile pill
│   │   │   ├── ProfileStats.tsx
│   │   │   ├── ReblogIndicator.tsx
│   │   │   ├── ScheduledCardSkeleton.tsx
│   │   │   ├── SearchHistory.tsx         # Search history UI component
│   │   │   ├── StatusContent.tsx
│   │   │   ├── StatusEditHistory.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── TrendingLinkCard.tsx
│   │   │   ├── TrendingTagCard.tsx
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserCardSkeleton.tsx      # User card skeleton loader
│   │   │   ├── VisibilitySettingsModal.tsx
│   │   │   └── index.ts
│   │   ├── organisms/        # Complex components (max 350 LOC)
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── ComposerPanel.tsx
│   │   │   ├── EmojiPicker.tsx
│   │   │   ├── NavigationWrapper.tsx
│   │   │   ├── PostCard.tsx              # Now organism with usePostActions hook
│   │   │   ├── ProfileContent.tsx        # Profile content with tabs
│   │   │   ├── SearchContent.tsx         # Search results content
│   │   │   ├── TimelinePage.tsx          # Reusable timeline page component
│   │   │   ├── TrendingContent.tsx
│   │   │   ├── TrendingPage.tsx          # Trending page with navigation
│   │   │   ├── VirtualizedList.tsx
│   │   │   └── index.ts                  # Organisms index file
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
│   │   ├── useCropper.ts     # Reusable image cropper state management
│   │   ├── usePostActions.ts # NEW: PostCard mutations and event handlers (extracted from PostCard)
│   │   ├── useScrollDirection.ts
│   │   ├── useSearchHistory.ts
│   │   ├── useStores.ts      # MobX store hooks
│   │   ├── useStreaming.ts   # Real-time streaming hooks (notifications + conversations)
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
│   │   ├── mastodon.ts       # Mastodon API types (includes Conversation, Emoji array in Status)
│   │   └── index.ts          # Type exports
│   ├── utils/                # Utility functions
│   │   ├── account.ts        # Account helper functions
│   │   ├── conversationUtils.ts  # Conversation utilities (find, build message lists, strip mentions)
│   │   ├── cookies.ts        # Cookie management utilities
│   │   ├── fp.ts             # Ramda-based functional programming utilities
│   │   ├── oauth.ts          # OAuth flow helpers
│   │   ├── tiptapExtensions.ts  # Tiptap extension utilities
│   │   ├── RAMDA.md          # Ramda functions documentation
│   │   └── README.md
│   └── proxy.ts              # Proxy configuration
├── .claude/                  # Claude Code configuration
├── .git/                     # Git repository
├── .gitignore                # Git ignore rules
├── .next/                    # Next.js build output (gitignored)
├── .vscode/                  # VS Code configuration
├── node_modules/             # Dependencies
├── buy-me-coffee.png         # Buy me a coffee badge image
├── CLAUDE.md                 # This file - project structure documentation
├── README.md                 # Project readme
├── eslint.config.js          # ESLint configuration with CSS baseline linting
├── next-env.d.ts             # Next.js TypeScript declarations
├── next.config.ts            # Next.js configuration (with React Compiler)
├── package-lock.json         # Lockfile
├── package.json              # Dependencies and scripts (type: module)
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
- **`/conversations`**: Direct messages (conversations) list
- **`/conversations/[id]`**: Individual conversation thread with real-time updates
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
- **`/settings/preferences`**: User preferences (posting defaults, media, accessibility)
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
  - Avatar, Badge, Button, Card, CheckboxField, CircleSkeleton (circular skeleton loader), ContentWarningInput, Dialog (base modal), EmptyState, EmojiText, FormField, IconButton, ImageSkeleton (image loader), Input, ScheduleInput, ScrollToTopButton, SensitiveContentButton, SkipToMain, Spinner, Tabs, TextArea, TextSkeleton (text loader), TiptapEditor
- **molecules/**: Simple component combinations
  - AccountCard, AccountProfileSkeleton, AuthModalBridge, ComposerToolbar, ContentWarningSection, ConversationCard (conversation list item with unread indicator and actions), DeletePostModal, GroupedNotificationCard, HandleExplainer, ImageCropper (cropperjs-based image cropping with zoom, rotate, flip), LinkPreview, ListItemSkeleton, MediaGrid, MediaGridSkeleton, MediaModal (fullscreen media viewer with keyboard navigation), MediaUpload (media upload with cropping), MentionSuggestions, Navigation, NotificationCard, NotificationSkeleton, PageHeaderSkeleton, PollComposer, PostActions, PostCardSkeleton, PostHeader, PostPoll, PrivacySettingsForm, ProfileActionButtons, ProfileBio, ProfileEditorSkeleton, ProfileFields, ProfileFieldsEditor, ProfileImageUploader, ProfilePillSkeleton, ProfileStats, ReblogIndicator, ScheduledCardSkeleton, SearchHistory, StatusContent, StatusEditHistory, ThemeSelector, TrendingLinkCard, TrendingTagCard, UserCard, UserCardSkeleton, VisibilitySettingsModal
- **organisms/**: Complex components
  - AuthGuard (authentication route protection), ComposerPanel (post composition), EmojiPicker, NavigationWrapper (auth integration), PostCard (with usePostActions hook), ProfileContent (profile tabs), SearchContent (search results), TimelinePage (reusable timeline), TrendingContent, TrendingPage (trending with navigation), VirtualizedList (infinite scroll)
- **templates/**: Page layouts (currently empty, layouts handled by route groups)
- **providers/**: React context providers
  - QueryProvider (TanStack Query), ScrollRestorationProvider, StoreProvider (MobX), StreamingProvider (real-time updates), ThemeProvider

### `/src/hooks/`
Custom React hooks:
- **useCropper.ts**: Reusable image cropper state management (used in profile edit)
- **useMediaUpload.ts**: Media upload management with cropping support for post attachments
  - Manages media state, upload queue, and cropping workflow
  - Supports alt text updates via `handleAltTextChange`
  - Used in ComposerPanel for post media attachments
- **usePostActions.ts**: PostCard mutations and event handlers (extracted from PostCard for reusability)
- **useStores.ts**: Access MobX stores (useAuthStore, useUserStore, useStreamingStore)
- **useStreaming.ts**: Real-time Mastodon streaming API integration
  - **useNotificationStream()**: Real-time notification updates via WebSocket
  - **useConversationStream()**: Real-time direct message updates via WebSocket
- **useScrollDirection.ts**: Detect scroll direction for UI enhancements
- **useSearchHistory.ts**: Manage search history in localStorage

### `/src/stores/`
MobX stores for global state management:
- **authStore.ts**: Authentication (access token, instance URL, client credentials)
- **userStore.ts**: Current user profile and data
- **streamingStore.ts**: Real-time streaming state with single multiplexed WebSocket connection
  - Single WebSocket connection with dynamic stream subscriptions (JSON multiplexing)
  - Subscribes to multiple streams: `user:notification` and `direct`
  - Automatic reconnection with exponential backoff
  - Event handlers: `onNotification`, `onConversation`
- **rootStore.ts**: Combines all stores into singleton

### `/src/contexts/`
React context definitions:
- **GlobalModalContext.tsx**: Global modal management context

### `/src/types/`
TypeScript type definitions:
- **mastodon.ts**: Comprehensive types for Mastodon API entities
  - Core types: Status, Account, Context, Notification, etc.
  - Conversation types: Conversation, ConversationParams
  - Request/response types for all API endpoints

### `/src/utils/`
Utility functions:
- **conversationUtils.ts**: Conversation-related utilities (find conversations, build message lists, strip mentions from HTML)
- **fp.ts**: Ramda-based functional programming utilities for data transformation (deduplication, nested maps, status helpers)
- **oauth.ts**: OAuth flow helpers (URL generation, token exchange)
- **account.ts**: Account-related utility functions
- **cookies.ts**: Cookie management utilities (using native cookieStore API)
- **tiptapExtensions.ts**: Tiptap editor extension utilities
- **RAMDA.md**: Comprehensive documentation of Ramda functions used in the project
- **README.md**: Utils directory overview and documentation index

### `/scripts/`
Build and deployment scripts:
- **ignore-build.sh**: Vercel build ignore script (skips builds when no relevant changes detected)

### `/example/`
Example files and documentation:
- **compose/README.md**: Documentation for the compose feature and post creation workflow

## Key Files

### `package.json`
Dependencies and scripts:
- **Type**: ES module (`"type": "module"`)
- **Main dependencies**: Next.js 16, React 19, TanStack Query, MobX, Tiptap, Open Props, @emotion/styled, @emotion/react, cropperjs/react-cropper (image cropping)
- **Dev dependencies**: ESLint, @eslint/css (CSS baseline linting)
- **Styling approach**: Emotion styled components (replaces inline styles for better maintainability and performance)
- **Scripts**:
  - `dev`: Start development server with Turbopack
  - `build`: Build for production
  - `start`: Start production server
  - `lint`: Run ESLint on all files
  - `lint:css`: Run ESLint on CSS files only
  - `lint:fix`: Run ESLint with auto-fix

### `eslint.config.js`
ESLint configuration with CSS baseline linting and atomic design LOC limits:

**CSS Linting:**
- **@eslint/css plugin**: Official ESLint CSS language plugin
- **Baseline checking**: Warns when using CSS features not widely available
- **CSS Rules**:
  - `css/no-duplicate-imports`: Error on duplicate CSS @import rules
  - `css/no-empty-blocks`: Warn on empty CSS blocks
  - `css/use-baseline`: Warn when using non-widely-available CSS features
- **Ignored directories**: .next/, node_modules/, dist/, build/, out/, *.min.css

**Atomic Design LOC Limits:**
Enforces maximum lines of code (LOC) to maintain component simplicity:
- **Atoms** (src/components/atoms/\*\*/\*.tsx): max 120 LOC
  - max 50 LOC per function
- **Molecules** (src/components/molecules/\*\*/\*.tsx): max 200 LOC
  - max 80 LOC per function
- **Organisms** (src/components/organisms/\*\*/\*.tsx): max 350 LOC
  - max 80 LOC per function
- **Pages** (src/app/\*\*/page.tsx, layout.tsx): max 300 LOC
  - max 100 LOC per function
  - Pages should only orchestrate organisms, not contain presentational components

These limits encourage:
- Breaking down complex components into smaller, reusable pieces
- Following atomic design hierarchy properly
- Container/presentation pattern separation
- Extracting logic into custom hooks

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
- Utility classes:
  - `container`: Page container with max width and auto margins
  - `full-height-container`: Full viewport height container with flex layout
  - `spinner`: Loading spinner animation
  - `hide-on-mobile`: Hides content on screens ≤480px (for responsive button labels)
- Navigation styles:
  - Sidebar for desktop (full height with header, nav links, footer)
  - Bottom bar for mobile
  - Logo, instance URL, sign in/out buttons
- Responsive breakpoints (768px tablet, 1024px desktop)
- Layout adjustments (body margins/padding for sidebar and bottom nav)
- **Styling convention**: Components use @emotion/styled for styled components (replaced inline styles). Styled components are defined at the top of each file with the $ prefix for transient props (e.g., `$variant`, `$size`). Pages and components use semantic styled components for better maintainability, type safety, and performance.

### `tsconfig.json`
TypeScript configuration:
- Path alias: `@/*` → `./src/*`
- Configured for Next.js and React 19