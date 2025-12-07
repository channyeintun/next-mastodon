# Notification Feature Implementation Plan

Implement a complete notification system with REST API integration and real-time updates via WebSocket streaming.

---

## API Reference

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/notifications` | Get all notifications (paginated) |
| `GET` | `/api/v1/notifications/:id` | Get a single notification |
| `POST` | `/api/v1/notifications/:id/dismiss` | Dismiss a single notification |
| `POST` | `/api/v1/notifications/clear` | Clear all notifications |
| `GET` | `/api/v1/notifications/unread_count` | Get unread count |

### Notification Types

| Type | Description |
|------|-------------|
| `mention` | Someone mentioned you in their status |
| `status` | Someone you enabled notifications for has posted |
| `reblog` | Someone boosted one of your statuses |
| `follow` | Someone followed you |
| `follow_request` | Someone requested to follow you |
| `favourite` | Someone favourited one of your statuses |
| `poll` | A poll you voted in or created has ended |
| `update` | A status you boosted has been edited |

### Streaming API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/streaming/user/notification` | Real-time notification stream (SSE) |
| WebSocket | `wss://<host>/api/v1/streaming` | Subscribe to `user:notification` stream |

**WebSocket subscription:**
```json
{ "type": "subscribe", "stream": "user:notification" }
```

---

## Implementation Tasks

### 1. Types (`src/types/mastodon.ts`)
- Add `NotificationType` union type
- Add `Notification` interface
- Add `NotificationParams` interface
- Add `UnreadCount` interface

### 2. API Client (`src/api/client.ts`)
- `getNotifications(params?)` → `Notification[]`
- `getNotification(id)` → `Notification`
- `dismissNotification(id)` → `void`
- `clearNotifications()` → `void`
- `getUnreadNotificationCount()` → `UnreadCount`
- `getMarkers(timeline[])` → `MarkersResponse`
- `updateMarkers(params)` → `MarkersResponse` (for mark as read)

### 3. Query Keys (`src/api/queryKeys.ts`)
- Add `notifications.all`, `notifications.list`, `notifications.detail`, `notifications.unreadCount`

### 4. Queries (`src/api/queries.ts`)
- `useNotifications()`
- `useInfiniteNotifications()`
- `useNotification(id)`
- `useUnreadNotificationCount()`

### 5. Mutations (`src/api/mutations.ts`)
- `useDismissNotification()`
- `useClearNotifications()`

### 6. Streaming Store (`src/stores/streamingStore.ts`) [NEW]
- WebSocket connection management
- Connect/disconnect lifecycle
- Subscribe to `user:notification` stream
- Push new notifications to React Query cache
- Exponential backoff reconnection

### 7. Streaming Hook (`src/hooks/useStreaming.ts`) [NEW]
- `useNotificationStream()` - manages streaming lifecycle

### 8. NotificationCard Component (`src/components/molecules/NotificationCard.tsx`) [NEW]
- Type-specific rendering (mention, follow, reblog, favourite, poll, etc.)
- Avatar, account info, timestamp
- Status preview for relevant types

### 9. Notifications Page (`src/app/notifications/page.tsx`) [NEW]
- Infinite scroll with `useInfiniteNotifications()`
- VirtualizedList for performance
- "Clear all" action
- Empty state

### 10. Navigation Update (`src/components/organisms/Navigation.tsx`)
- Add notifications link with bell icon
- Unread count badge using `useUnreadNotificationCount()`

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/types/mastodon.ts` | MODIFY |
| `src/api/client.ts` | MODIFY |
| `src/api/queryKeys.ts` | MODIFY |
| `src/api/queries.ts` | MODIFY |
| `src/api/mutations.ts` | MODIFY |
| `src/stores/streamingStore.ts` | NEW |
| `src/hooks/useStreaming.ts` | NEW |
| `src/components/molecules/NotificationCard.tsx` | NEW |
| `src/app/notifications/page.tsx` | NEW |
| `src/components/organisms/Navigation.tsx` | MODIFY |
