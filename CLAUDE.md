# Project: Mastodon Client (Next.js)

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
│   │   ├── accounts/[id]/    # Account detail pages
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
- **`/accounts/[id]`**: User profile and posts
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
- **Open Props**: CSS design tokens for consistent design
- **PostCSS**: Nesting, imports, autoprefixing
- **No Tailwind**: Custom CSS with Open Props variables
- **View Transitions**: Native browser animations
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
- [x] PostCSS with Open Props
- [x] Atomic component architecture folders
- [x] React Compiler enabled
- [x] Mastodon API client ported
- [x] All route pages created
- [x] TypeScript types ported
- [x] View Transitions utilities
- [x] Authentication flow (OAuth) with Next.js
- [x] Next.js proxy for route protection
- [x] UI atoms (Button, Input, Avatar, Card, etc.)
- [x] UI molecules (PostCard, UserCard)
- [x] Timeline page with infinite scroll (TanStack Virtual)
- [x] Status detail page with full thread context
- [x] Bookmarks page with infinite scroll
- [x] Account page with profile & posts timeline
- [x] Search page with tabs (accounts, statuses, hashtags)
- [x] Optimistic updates for all mutations

### To Be Implemented
- [ ] Tiptap editor setup for compose
- [ ] Compose page with Tiptap (rich text, media, polls, etc.)
- [ ] Settings page (profile editing)
- [ ] Activity component (visibility toggling)
- [ ] Motion animations
- [ ] Custom emoji rendering
- [ ] Link preview cards

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
