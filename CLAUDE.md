# Project: Mastodon (Next.js)

A minimal, performant social media frontend for Mastodon built with Next.js 16 and modern React patterns.

## Project Structure
```
mastodon-nextjs-client/
├── public/                     # Static assets
│   ├── fonts/
│   │   └── silkscreen-regular.woff2  # Custom font for Wrapstodon
│   ├── icons/                  # PWA icons
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon-maskable.png
│   ├── images/                 # Static images
│   │   └── archetypes/         # Wrapstodon personality archetype images
│   │       ├── booster.png
│   │       ├── lurker.png
│   │       ├── oracle.png
│   │       ├── pollster.png
│   │       ├── replier.png
│   │       └── space_elements.png
│   ├── boop.mp3                # Notification sound (MP3)
│   ├── boop.ogg                # Notification sound (OGG)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── sw.js                   # Service worker for push notifications
│   ├── vercel.svg
│   └── window.svg
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
│   │   │   ├── about/        # Instance information pages
│   │   │   │   ├── privacy/
│   │   │   │   │   └── page.tsx  # Privacy policy
│   │   │   │   ├── terms/
│   │   │   │   │   └── page.tsx  # Terms of service
│   │   │   │   └── page.tsx     # Server info, rules, admin contact
│   │   │   ├── bookmarks/    # Bookmarks page
│   │   │   │   └── page.tsx
│   │   │   ├── compose/      # Create post page
│   │   │   │   └── page.tsx
│   │   │   ├── conversations/  # Direct messages (conversations)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx  # Conversation thread (legacy, redirects to /chat)
│   │   │   │   ├── chat/
│   │   │   │   │   └── page.tsx  # Chat interface with message bubbles
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  # Create new DM/conversation
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
│   │   │   │   ├── requests/
│   │   │   │   │   └── page.tsx  # Filtered notification requests
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
│   │   │   │   ├── filters/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx  # Edit filter
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx  # Create new filter
│   │   │   │   │   └── page.tsx     # Filters list
│   │   │   │   ├── mutes/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   └── page.tsx  # Push notification settings
│   │   │   │   ├── preferences/  # User preferences settings
│   │   │   │   │   ├── SelectStyles.tsx  # Styled select components
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── SettingsClient.tsx  # Settings client component
│   │   │   │   └── page.tsx
│   │   │   ├── status/[id]/  # Status detail pages
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── favourited_by/
│   │   │   │   │   └── page.tsx  # Users who favourited this post
│   │   │   │   ├── reblogged_by/
│   │   │   │   │   └── page.tsx  # Users who boosted this post
│   │   │   │   ├── quotes/
│   │   │   │   │   └── page.tsx  # Quote posts of this status
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
│   │   ├── client/           # Modular API client structure
│   │   │   ├── accounts.ts   # Account-related endpoints
│   │   │   ├── annual-reports.ts  # Wrapstodon/annual reports API
│   │   │   ├── auth.ts       # OAuth authentication
│   │   │   ├── base.ts       # Axios instance with auth interceptors
│   │   │   ├── conversations.ts  # Direct messages/conversations
│   │   │   ├── emojis.ts     # Custom emoji endpoints
│   │   │   ├── filters.ts    # Content filters
│   │   │   ├── index.ts      # Module exports
│   │   │   ├── instance.ts   # Instance information
│   │   │   ├── lists.ts      # List management
│   │   │   ├── media.ts      # Media uploads
│   │   │   ├── notifications.ts  # Notifications
│   │   │   ├── polls.ts      # Poll voting
│   │   │   ├── push.ts       # Push notification subscriptions
│   │   │   ├── reports.ts    # Content reporting
│   │   │   ├── scheduled.ts  # Scheduled posts
│   │   │   ├── search.ts     # Search functionality
│   │   │   ├── statuses.ts   # Status/post operations
│   │   │   ├── suggestions.ts  # Account suggestions
│   │   │   ├── timelines.ts  # Timeline feeds
│   │   │   └── trends.ts     # Trending content
│   │   ├── client.ts         # Legacy API client (may be deprecated)
│   │   ├── mutations.ts      # TanStack Query mutations with optimistic updates
│   │   ├── parseLinkHeader.ts  # Link header parsing utilities
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
│   │   │   ├── ConversationStyles.tsx    # Styled components for conversation UI
│   │   │   ├── Dialog.tsx                # Base dialog/modal with Header, Body, Footer
│   │   │   ├── EmptyState.tsx            # Empty state with icon, title, description
│   │   │   ├── EmojiText.tsx
│   │   │   ├── FormField.tsx             # Reusable form field wrapper
│   │   │   ├── IconButton.tsx
│   │   │   ├── ImageSkeleton.tsx         # Image skeleton loader
│   │   │   ├── Input.tsx
│   │   │   ├── MediaPreviewStyles.tsx    # Styled components for media previews
│   │   │   ├── ScheduleInput.tsx
│   │   │   ├── ScrollToTopButton.tsx
│   │   │   ├── SensitiveContentButton.tsx # Sensitive media toggle button
│   │   │   ├── ServiceWorkerRegister.tsx # Service worker registration component
│   │   │   ├── SkipToMain.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── StickyHeader.tsx          # Advanced sticky header with scroll-state
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
│   │   │   ├── ConversationCardSkeleton.tsx  # Loading skeleton for conversation cards
│   │   │   ├── ConversationStates.tsx     # Conversation loading/error state components
│   │   │   ├── DeletePostModal.tsx
│   │   │   ├── FamiliarFollowers.tsx      # Shows mutual followers for profiles
│   │   │   ├── GroupedNotificationCard.tsx
│   │   │   ├── HandleExplainer.tsx
│   │   │   ├── ImageCropper.tsx
│   │   │   ├── LanguageDropdown.tsx       # Language selection for posts
│   │   │   ├── LinkPreview.tsx
│   │   │   ├── ListItemSkeleton.tsx      # List item skeleton loader
│   │   │   ├── MediaGrid.tsx
│   │   │   ├── MediaGridSkeleton.tsx     # Media grid skeleton loader
│   │   │   ├── MediaModal.tsx            # Fullscreen media viewer with navigation
│   │   │   ├── MediaUpload.tsx
│   │   │   ├── MentionSuggestions.tsx
│   │   │   ├── MessageBubble.tsx         # Chat message bubble component
│   │   │   ├── Navigation.tsx
│   │   │   ├── NotificationCard.tsx
│   │   │   ├── NotificationRequestCard.tsx  # Card for notification requests
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
│   │   │   ├── PushNotificationsSection.tsx  # Push notification settings UI
│   │   │   ├── ReblogIndicator.tsx
│   │   │   ├── ReportModal.tsx           # Multi-step reporting modal
│   │   │   ├── ReportModalStyles.tsx     # Styled components for report modal
│   │   │   ├── ScheduledCardSkeleton.tsx
│   │   │   ├── SearchHistory.tsx         # Search history UI component
│   │   │   ├── StatusContent.tsx
│   │   │   ├── StatusEditHistory.tsx
│   │   │   ├── StatusStats.tsx           # Clickable stats (favourites, boosts, quotes)
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── TranslateButton.tsx       # Status translation button
│   │   │   ├── TrendingLinkCard.tsx
│   │   │   ├── TrendingTagCard.tsx
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserCardSkeleton.tsx      # User card skeleton loader
│   │   │   ├── VisibilitySettingsModal.tsx
│   │   │   └── index.ts
│   │   ├── organisms/        # Complex components (max 350 LOC)
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── ComposerPanel.tsx
│   │   │   ├── ComposerPanelStyles.tsx   # Styled components for composer
│   │   │   ├── ConversationChatContent.tsx  # Chat conversation UI with real-time updates
│   │   │   ├── EmojiPicker.tsx
│   │   │   ├── NavigationWrapper.tsx
│   │   │   ├── PostCard.tsx              # Now organism with usePostActions hook
│   │   │   ├── ProfileContent.tsx        # Profile content with tabs
│   │   │   ├── SearchContent.tsx         # Search results content
│   │   │   ├── SuggestionsSection.tsx    # "Who to follow" suggestions with scroll state
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
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── VideoSyncProvider.tsx  # Global video sync (one video plays at a time)
│   │   └── templates/        # Page layouts
│   ├── contexts/             # React context definitions
│   │   └── GlobalModalContext.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useCropper.ts     # Reusable image cropper state management
│   │   ├── useMediaUpload.ts # Media upload management with cropping support
│   │   ├── useNotificationSound.ts  # Notification sound playback
│   │   ├── usePostActions.ts # PostCard mutations and event handlers (extracted from PostCard)
│   │   ├── usePushNotifications.ts  # Push notification management (VAPID, service worker)
│   │   ├── useQueryState.ts  # URL query parameter state synchronization
│   │   ├── useScrollDirection.ts
│   │   ├── useSearchHistory.ts
│   │   ├── useStores.ts      # MobX store hooks
│   │   ├── useStreaming.ts   # Real-time streaming hooks (notifications + conversations)
│   │   ├── useWindowScrollDirection.ts  # Window-level scroll detection
│   │   └── README.md
│   ├── lib/                  # Library code and extensions
│   │   ├── idbPersister.ts   # IndexedDB persistence for TanStack Query
│   │   └── tiptap/           # Tiptap extensions and configurations
│   │       ├── extensions/   # Custom Tiptap extensions
│   │       │   ├── CustomEmoji.ts      # Custom Mastodon emoji node
│   │       │   ├── ExternalLink.ts     # External link configuration
│   │       │   ├── FilePasteHandler.ts # File paste/drop handling in editor
│   │       │   ├── Hashtag.ts          # Hashtag mark with click navigation
│   │       │   └── MentionWithClick.ts # Enhanced mention with click navigation
│   │       └── MentionSuggestion.tsx   # Mention autocomplete UI
│   ├── schemas/              # Zod validation schemas
│   │   ├── filterFormSchema.ts  # Filter form validation
│   │   └── profileFormSchema.ts # Profile edit form validation
│   ├── stores/               # MobX global state stores
│   │   ├── authStore.ts      # Authentication state (tokens, instance URL)
│   │   ├── conversationStore.ts  # Conversation state management (sessionStorage-backed)
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
│   │   ├── counter.ts        # Mastodon-compatible character counting for compose
│   │   ├── date.ts           # Centralized date formatting functions (date-fns)
│   │   ├── fp.ts             # Ramda-based functional programming utilities
│   │   ├── oauth.ts          # OAuth flow helpers
│   │   ├── tiptapExtensions.ts  # Tiptap extension utilities
│   │   ├── RAMDA.md          # Ramda functions documentation
│   │   └── README.md
│   └── proxy.ts              # Proxy configuration
├── .claude/                  # Claude Code configuration
├── .git/                     # Git repository
├── .github/                  # GitHub configuration
│   ├── workflows/            # GitHub Actions workflows
│   │   └── ci.yml            # CI workflow (lint + build on PRs)
│   └── PULL_REQUEST_TEMPLATE.md  # PR template for contributors
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
├── tsconfig.tsbuildinfo      # TypeScript incremental build info (gitignored)
└── vercel.json               # Vercel deployment configuration (Bun version)
```

## Directory Descriptions

### `/src/app/`
Next.js App Router with file-based routing using route groups for different layouts:

**Route Group: `(main)/`** - Main application routes with navigation
- **Root** (`/`): Home timeline page (shows trending timeline from mastodon.social when not signed in)
- **`/about`**: Instance information, rules, admin contact
- **`/about/privacy`**: Privacy policy page
- **`/about/terms`**: Terms of service page
- **`/compose`**: Create new post page
  - Supports query parameters: `text`, `mention`, `quoted_status_id`, `scheduled_status_id`, `visibility`
  - Uses key-based remounting to handle URL parameter changes when already on the page
  - Integrates with Wrapstodon sharing (pre-fills text from share URL)
- **`/status/[id]`**: Status detail with thread context
- **`/status/[id]/edit`**: Edit existing status
- **`/status/[id]/favourited_by`**: Users who favourited this post
- **`/status/[id]/reblogged_by`**: Users who boosted this post
- **`/status/[id]/quotes`**: Quote posts of this status
- **`/bookmarks`**: Bookmarked posts
- **`/conversations`**: Direct messages (conversations) list
- **`/conversations/[id]`**: Individual conversation thread (legacy, redirects to /chat)
- **`/conversations/chat`**: Chat interface with message bubbles and real-time updates
- **`/conversations/new`**: Create new DM/conversation with account search
- **`/explore`**: Explore/discover page with trending content
- **`/notifications`**: Notifications page
- **`/notifications/requests`**: Filtered notification requests
- **`/scheduled`**: Scheduled posts management
- **`/follow-requests`**: Follow requests management
- **`/[acct]`**: User profile and posts (accessed via `/@username` or `/@username@domain`, requires @ prefix)
- **`/[acct]/followers`**: User's followers list
- **`/[acct]/following`**: User's following list
- **`/tags/[tag]`**: Hashtag feed page with infinite scroll (e.g., `/tags/opensource`)
- **`/search`**: Search functionality
- **`/profile/edit`**: Edit current user's profile
- **`/settings`**: Account settings
  - Mobile-only Wrapstodon navigation item (when available) with highlight styling
- **`/settings/blocks`**: Blocked accounts
- **`/settings/mutes`**: Muted accounts
- **`/settings/filters`**: Content filters management
- **`/settings/filters/new`**: Create new content filter
- **`/settings/filters/[id]`**: Edit existing content filter
- **`/settings/notifications`**: Push notification settings (VAPID, service worker)
- **`/settings/preferences`**: User preferences (posting defaults, media, accessibility)
- **`/lists`**: Lists overview
- **`/lists/[id]`**: Individual list timeline
- **`/lists/[id]/members`**: List members management
- **`/wrapstodon`**: Standalone Wrapstodon (year in review) page

**Route Group: `(auth)/`** - Authentication routes without main navigation
- **`/auth/signin`**: OAuth sign in
- **`/auth/callback`**: OAuth callback handler

**Special files:**
- `layout.tsx`: Root layout with QueryProvider, StoreProvider, ThemeProvider, StreamingProvider, and VideoSyncProvider
- `(main)/layout.tsx`: Main layout with navigation wrapper
- `(auth)/layout.tsx`: Auth layout without navigation
- `globals.css`: Global styles using Open Props

### `/src/api/`
Mastodon API client and TanStack Query integration with modular architecture:

**Modular API Client (`/client/`)**: Organized by domain/feature area
- **base.ts**: Axios instance with authentication interceptors and pagination helpers
- **accounts.ts**: Account operations (fetch, follow, unfollow, mute, block, etc.)
- **annual-reports.ts**: Wrapstodon/annual reports API
- **auth.ts**: OAuth authentication endpoints
- **conversations.ts**: Direct messages and conversation management
- **emojis.ts**: Custom emoji endpoints
- **filters.ts**: Content filters CRUD operations
- **instance.ts**: Instance information endpoints
- **lists.ts**: List management (create, update, delete, add/remove members)
- **media.ts**: Media upload endpoints
- **notifications.ts**: Notifications fetching and management
- **polls.ts**: Poll voting
- **push.ts**: Push notification subscription management
- **reports.ts**: Content reporting endpoints
- **scheduled.ts**: Scheduled posts management
- **search.ts**: Search accounts, statuses, hashtags
- **statuses.ts**: Status/post operations (create, update, delete, favourite, boost, etc.)
- **suggestions.ts**: Account suggestions (who to follow)
- **timelines.ts**: Timeline feeds (home, public, hashtag, list, etc.)
- **trends.ts**: Trending content (links, tags, statuses)

**TanStack Query Integration**:
- **queries.ts**: TanStack Query hooks for data fetching (including infinite queries)
- **mutations.ts**: TanStack Query mutations with optimistic updates
- **queryKeys.ts**: Centralized query key factory for consistent caching
- **parseLinkHeader.ts**: Utilities for parsing pagination Link headers

### `/src/components/`
Atomic design pattern components:

**atoms/** (27 total): Smallest UI building blocks
- Avatar, Badge, Button, Card, CheckboxField, CircleSkeleton (circular skeleton loader), ContentWarningInput, **ConversationStyles** (styled components for conversation UI), Dialog (base modal), EmptyState, EmojiText, FormField, IconButton, ImageSkeleton (image loader), Input, **MediaPreviewStyles** (styled components for media previews), ScheduleInput, ScrollToTopButton, SensitiveContentButton, **ServiceWorkerRegister** (service worker registration), SkipToMain, Spinner, **StickyHeader** (advanced sticky header with scroll-state container queries), Tabs, TextArea, TextSkeleton (text loader), TiptapEditor

**molecules/** (57 total): Simple component combinations
- AccountCard, AccountProfileSkeleton, AuthModalBridge, ComposerToolbar, ContentWarningSection, ConversationCard (conversation list item with unread indicator), **ConversationCardSkeleton**, **ConversationStates** (conversation loading/error states), DeletePostModal, **FamiliarFollowers** (shows mutual followers for profiles), GroupedNotificationCard, HandleExplainer, ImageCropper (cropperjs-based image cropping), **LanguageDropdown** (language selection for posts), LinkPreview, ListItemSkeleton, MediaGrid, MediaGridSkeleton, MediaModal (fullscreen media viewer), MediaUpload (media upload with cropping), MentionSuggestions, **MessageBubble** (chat message bubble), Navigation, NotificationCard, **NotificationRequestCard**, NotificationSkeleton, PageHeaderSkeleton, PollComposer, PostActions, PostCardSkeleton, PostHeader, PostPoll, PrivacySettingsForm, ProfileActionButtons, ProfileBio, ProfileEditorSkeleton, ProfileFields, ProfileFieldsEditor, ProfileImageUploader, ProfilePillSkeleton, ProfileStats, **PushNotificationsSection** (push notification settings UI), ReblogIndicator, **ReportModal** (multi-step reporting modal), **ReportModalStyles**, ScheduledCardSkeleton, SearchHistory, StatusContent, StatusEditHistory, **StatusStats** (clickable stats: favourites, boosts, quotes), ThemeSelector, **TranslateButton** (status translation), TrendingLinkCard, TrendingTagCard, UserCard, UserCardSkeleton, VisibilitySettingsModal

**organisms/** (14 total): Complex components
- AuthGuard (authentication route protection), ComposerPanel (post composition), **ComposerPanelStyles** (styled components for composer), **ConversationChatContent** (chat conversation UI with real-time updates), EmojiPicker, NavigationWrapper (auth integration), PostCard (with usePostActions hook), ProfileContent (profile tabs), SearchContent (search results), **SuggestionsSection** ("who to follow" with scroll-state container queries), TimelinePage (reusable timeline), TrendingContent, TrendingPage (trending with navigation), VirtualizedList (infinite scroll)

**templates/**: Page layouts (currently empty, layouts handled by route groups)

**providers/**: React context providers
- QueryProvider (TanStack Query with IndexedDB persistence for custom emojis), ScrollRestorationProvider, StoreProvider (MobX), StreamingProvider (real-time updates), ThemeProvider, VideoSyncProvider (ensures only one video plays at a time)

**wrapstodon/**: Year in review components
- Wrapstodon (main component), WrapstodonModal, Archetype (personality archetype with reveal), HighlightedPost, StatsComponents, ShareButton (shares to compose page with onClose modal support), Announcement

### `/src/hooks/`
Custom React hooks (11 total):
- **useCropper.ts**: Reusable image cropper state management (used in profile edit and media upload)
- **useMediaUpload.ts**: Media upload management with cropping support for post attachments
  - Manages media state, upload queue, and cropping workflow
  - Supports alt text updates via `handleAltTextChange`
  - Used in ComposerPanel for post media attachments
- **useNotificationSound.ts**: Notification sound playback for real-time notifications
- **usePostActions.ts**: PostCard mutations and event handlers (extracted from PostCard for reusability)
- **usePushNotifications.ts**: Push notification management
  - VAPID key handling
  - Service worker integration
  - Subscription management (subscribe, unsubscribe, check status)
- **useQueryState.ts**: URL query parameter state synchronization
  - Type-safe parsers for different query param types
  - Value mapping (e.g., 'people' URL → 'foryou' internal)
  - Supports string, number, boolean, and array query params
- **useScrollDirection.ts**: Element-level scroll direction detection for UI enhancements
- **useSearchHistory.ts**: Manage search history in localStorage (add, remove, clear)
- **useStores.ts**: Access MobX stores (useAuthStore, useUserStore, useStreamingStore, useConversationStore)
- **useStreaming.ts**: Real-time Mastodon streaming API integration
  - **useNotificationStream()**: Real-time notification updates via WebSocket
  - **useConversationStream()**: Real-time direct message updates via WebSocket
- **useWindowScrollDirection.ts**: Window-level scroll direction detection (different from useScrollDirection)

### `/src/stores/`
MobX stores for global state management (5 stores):
- **authStore.ts**: Authentication (access token, instance URL, client credentials)
- **conversationStore.ts**: Conversation state management
  - SessionStorage-backed persistence for selected conversation ID
  - Manages active conversation state across navigation
  - Hydrates from sessionStorage on initialization
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

### `/src/schemas/`
Zod validation schemas for form validation:
- **filterFormSchema.ts**: Content filter form validation schema
  - Validates filter title, context, keywords, expiration
  - Used in `/settings/filters/new` and `/settings/filters/[id]`
- **profileFormSchema.ts**: Profile edit form validation schema
  - Validates display name, bio, fields, privacy settings
  - Used in `/profile/edit`

### `/src/types/`
TypeScript type definitions:
- **mastodon.ts**: Comprehensive types for Mastodon API entities
  - Core types: Status, Account, Context, Notification, etc.
  - Conversation types: Conversation, ConversationParams
  - Filter types: Filter, FilterContext, FilterKeyword
  - Push notification types: PushSubscription, WebPushSubscription
  - Request/response types for all API endpoints

### `/src/utils/`
Utility functions (9 files):
- **account.ts**: Account-related utility functions (display name helpers, URL parsing)
- **conversationUtils.ts**: Conversation utilities
  - Find conversations by account
  - Build message lists from statuses
  - Strip mentions from HTML content
- **cookies.ts**: Cookie management utilities (using native cookieStore API)
- **counter.ts**: Mastodon-compatible character counting for compose
  - URLs count as 23 characters (Mastodon convention)
  - Remote mentions counted as local username only
  - Used in ComposerPanel for character limit validation
- **date.ts**: Centralized date formatting functions using date-fns
  - Relative time formatting (e.g., "2 hours ago")
  - Absolute date formatting
  - Timestamp formatting
- **fp.ts**: Ramda-based functional programming utilities
  - Deduplication, nested maps, status helpers
  - Data transformation pipelines
- **oauth.ts**: OAuth flow helpers (URL generation, token exchange)
- **tiptapExtensions.ts**: Tiptap editor extension utilities
- **RAMDA.md**: Comprehensive documentation of Ramda functions used in the project
- **README.md**: Utils directory overview and documentation index

### `/src/lib/`
Library code and extensions:
- **idbPersister.ts**: IndexedDB persistence for TanStack Query
  - Persists custom emojis for offline access
  - Used in QueryProvider for cache persistence
- **tiptap/**: Tiptap editor extensions and configurations
  - **extensions/CustomEmoji.ts**: Custom Mastodon emoji node
  - **extensions/ExternalLink.ts**: External link configuration
  - **extensions/FilePasteHandler.ts**: File paste/drop handling in editor
  - **extensions/Hashtag.ts**: Hashtag mark with click navigation
  - **extensions/MentionWithClick.ts**: Enhanced mention with click navigation
  - **MentionSuggestion.tsx**: Mention autocomplete UI

### `/public/`
Static assets served directly by Next.js:
- **fonts/silkscreen-regular.woff2**: Custom font for Wrapstodon
- **icons/**: PWA (Progressive Web App) icons
  - icon-192.png, icon-512.png: Standard app icons
  - icon-maskable.png: Maskable icon for adaptive display
- **images/archetypes/**: Wrapstodon personality archetype images
  - booster.png, lurker.png, oracle.png, pollster.png, replier.png, space_elements.png
- **boop.mp3, boop.ogg**: Notification sound files (MP3 and OGG formats for browser compatibility)
- **sw.js**: Service worker for push notifications
  - Handles push notification events
  - Manages notification display and click handling
  - Integrates with Push API for real-time notifications
- **file.svg, globe.svg, next.svg, vercel.svg, window.svg**: UI icons and branding

### `/example/`
Example files and documentation:
- **compose/README.md**: Documentation for the compose feature and post creation workflow

### `/.github/`
GitHub configuration and workflows:

**workflows/ci.yml** - Continuous Integration workflow:
- Runs on pull requests and pushes to main branch
- Executes linting (`npm run lint`) to catch code quality issues
- Runs build (`npm run build`) to ensure the project compiles successfully
- Blocks merging if either linting or building fails (requires branch protection rules)
- Uses Node.js 20 with npm caching for faster builds

**PULL_REQUEST_TEMPLATE.md** - Pull request template for contributors:
- Structured template to guide contributors when submitting PRs
- Includes sections for:
  - Description and type of change (bug fix, feature, breaking change, etc.)
  - Related issues linking
  - Testing checklist and instructions
  - Code quality checklist (coding style, atomic design LOC limits, Emotion styled components)
  - Screenshots/videos for visual changes
  - Additional context and reviewer notes
- Ensures consistent PR format and complete information for reviewers
- Reminds contributors about project conventions (atomic design, Emotion, linting, building)

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
- **Wrapstodon highlight styles**: Special gradient styling for Wrapstodon navigation items with `.wrapstodon-highlight` class (purple gradient background matching sidebar highlight style)

### `tsconfig.json`
TypeScript configuration:
- Path alias: `@/*` → `./src/*`
- Configured for Next.js and React 19

### `vercel.json`
Vercel deployment configuration:
- Specifies Bun version for builds
- Deployment-specific settings

## Advanced Features & Technologies

### Modern Web APIs
- **Scroll-State Container Queries**: Advanced CSS feature used in StickyHeader and SuggestionsSection for responsive UI based on scroll position
- **Scroll Anchoring**: Native CSS scroll anchoring (`overflow-anchor`) for visual stability (Note: [Not supported in Safari](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor#browser_compatibility))
- **Service Workers**: PWA support with push notifications via `/public/sw.js`
- **Push API**: Real-time push notifications with VAPID key authentication
- **IndexedDB**: TanStack Query cache persistence for custom emojis (offline support)
- **Web Audio API**: Notification sound playback via useNotificationSound hook
- **Native Cookie Store API**: Modern cookie management in cookies.ts

### Real-Time Features
- **WebSocket Streaming**: Single multiplexed connection for notifications and conversations
- **Optimistic Updates**: TanStack Query mutations with instant UI feedback
- **Live Chat**: ConversationChatContent with message bubbles and real-time streaming
- **Notification Sounds**: Audio feedback for real-time notifications

### Performance Optimizations
- **React Compiler**: Automatic memoization enabled in next.config.ts
- **Turbopack**: Fast development builds
- **Virtual Scrolling**: VirtualizedList for infinite timelines. 
  > [!TIP]
  > Set `useFlushSync: false` in `useVirtualizer` options to suppress the React 19 warning: *"flushSync was called from inside a lifecycle method"*.
- **Code Splitting**: Route-based automatic code splitting via Next.js App Router
- **Image Optimization**: Next.js automatic image optimization
- **Lazy Loading**: Dynamic imports for heavy components (EmojiPicker, MediaModal)

### Developer Experience
- **Atomic Design**: Strict component hierarchy with ESLint-enforced LOC limits
- **Type Safety**: Full TypeScript coverage with Zod schema validation
- **Functional Programming**: Ramda utilities for data transformation pipelines
- **Emotion Styled Components**: CSS-in-JS with transient props ($variant, $size)
- **URL State Management**: useQueryState hook for type-safe query parameters
- **MobX State**: Reactive global state with automatic persistence (sessionStorage)

### Accessibility & UX
- **Skip to Main**: Keyboard navigation support
- **ARIA Labels**: Comprehensive accessibility attributes
- **Focus Management**: Modal and dialog focus trapping
- **Keyboard Shortcuts**: Media modal navigation (arrow keys, Escape)
- **Loading States**: Comprehensive skeleton loaders for all components
- **Error States**: User-friendly error messages with retry actions

### Mastodon-Specific Features
- **Character Counting**: Mastodon-compatible counter (URLs = 23 chars)
- **Custom Emoji**: Full support with autocomplete and caching
- **Content Warnings**: Collapsible sensitive content
- **Content Filters**: User-configurable content filtering
- **Translation**: Status translation via TranslateButton
- **Report System**: Multi-step reporting modal with categories
- **Familiar Followers**: Shows mutual followers on profiles
- **Wrapstodon**: Year-in-review feature with personality archetypes