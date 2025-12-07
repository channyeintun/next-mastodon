# Mastodon Client - Missing Features Plan

This document outlines API features from the Mastodon documentation that are not yet implemented in the client, along with recommendations for implementation.

---

## 1. Preferences API

**Status: ✅ Implemented**

### API Endpoint
```
GET /api/v1/preferences
```

### Description
Fetch user preferences (e.g., default visibility, sensitive media settings, language).

### Response Example
```json
{
  "posting:default:visibility": "public",
  "posting:default:sensitive": false,
  "posting:default:language": null,
  "posting:default:quote_policy": "followers",
  "reading:expand:media": "default",
  "reading:expand:spoilers": false
}
```

### Implementation:
- ✅ **Types**: Added `Preferences` interface to `src/types/mastodon.ts`
- ✅ **API Client**: Added `getPreferences()` function to `src/api/client.ts`
- ✅ **Query Key**: Added `preferences` key to `src/api/queryKeys.ts`
- ✅ **Query Hook**: Added `usePreferences()` hook to `src/api/queries.ts`
- ✅ **Integration**: Using preferences to set defaults in ComposerPanel (visibility, sensitive)

### Priority: **Medium** ⭐⭐
Useful for pre-populating composer settings with user's defaults.

---

## 2. Emails API

**Status: ❌ Not Implemented**

### API Endpoint
```
POST /api/v1/emails/confirmations
```

### Description
Resend confirmation email (optionally to a new email address). Only available to the app that created the unconfirmed user.

### Implementation Plan
1. **API Client**: Add `resendConfirmationEmail(email?: string)` to `src/api/client.ts`
2. **Mutation Hook**: Add `useResendConfirmationEmail()` to `src/api/mutations.ts`
3. **UI**: Could be added to a settings/account page for unconfirmed users

### Priority: **Low** ⭐
Only relevant during registration flow, which isn't implemented yet.

---

## 3. Accounts API - Missing Features

### 3.1 Register Account
**Status: ❌ Not Implemented**

```
POST /api/v1/accounts
```

Creates a new user account.

#### Parameters
- `username` (required)
- `email` (required)
- `password` (required)
- `agreement` (required) - Accept terms
- `locale` (required)
- `reason` (optional) - For approval-required instances
- `date_of_birth` (optional)

#### Implementation Plan
1. **Types**: Add `RegisterAccountParams` interface
2. **API Client**: Add `registerAccount(params)` function
3. **UI**: Create `/auth/register` page with registration form

#### Priority: **Medium** ⭐⭐
Important for onboarding new users.

---

### 3.2 Get Multiple Accounts
**Status: ❌ Not Implemented**

```
GET /api/v1/accounts?id[]=1&id[]=2
```

Fetch multiple account profiles at once.

#### Implementation Plan
1. **API Client**: Add `getAccounts(ids: string[])` function
2. **Query Hook**: Add `useAccounts(ids)` hook

#### Priority: **Low** ⭐
Optimization feature; single account fetch works fine.

---

### 3.3 Block Account
**Status: ✅ Implemented**

```
POST /api/v1/accounts/:id/block
POST /api/v1/accounts/:id/unblock
```

Block/unblock a user from seeing your content.

#### Implementation:
- ✅ **API Client**: Added `blockAccount(id)` and `unblockAccount(id)` functions to `src/api/client.ts`
- ✅ **Mutation Hooks**: Added `useBlockAccount()` and `useUnblockAccount()` hooks to `src/api/mutations.ts`
- ✅ **UI**: Added "Block" option to account action menu on profile page
- ✅ **Page**: Created `/settings/blocks` page to view blocked accounts

#### Priority: **High** ⭐⭐⭐
Essential moderation feature.

---

### 3.4 Mute Account
**Status: ✅ Implemented**

```
POST /api/v1/accounts/:id/mute
POST /api/v1/accounts/:id/unmute
```

Mute a user (hide their posts and optionally notifications).

#### Parameters (mute)
- `notifications` (boolean) - Also mute notifications
- `duration` (number) - Seconds until mute expires (0 = indefinite)

#### Implementation:
- ✅ **Types**: Added `MuteAccountParams` interface to `src/types/mastodon.ts`
- ✅ **API Client**: Added `muteAccount(id, params?)` and `unmuteAccount(id)` functions to `src/api/client.ts`
- ✅ **Mutation Hooks**: Added `useMuteAccount()` and `useUnmuteAccount()` hooks to `src/api/mutations.ts`
- ✅ **UI**: Added "Mute" option to account action menu on profile page
- ✅ **Page**: Created `/settings/mutes` page to view muted accounts

#### Priority: **High** ⭐⭐⭐
Essential moderation feature.

---

### 3.5 Feature/Endorse Account
**Status: ❌ Not Implemented**

```
POST /api/v1/accounts/:id/endorse
POST /api/v1/accounts/:id/unendorse
GET /api/v1/endorsements
```

Feature accounts on your profile.

#### Implementation Plan
1. **API Client**: Add `endorseAccount(id)`, `unendorseAccount(id)`, `getEndorsements()` functions
2. **Mutation Hooks**: Add corresponding hooks
3. **UI**: Add "Feature on profile" option (only for accounts you follow)
4. **Profile Display**: Show featured accounts section on profile pages

#### Priority: **Low** ⭐
Nice-to-have feature.

---

### 3.6 Private Note on Profile
**Status: ❌ Not Implemented**

```
POST /api/v1/accounts/:id/note
```

Set a private note on a user's profile (only visible to you).

#### Implementation Plan
1. **API Client**: Add `setAccountNote(id, comment)` function
2. **Mutation Hook**: Add `useSetAccountNote()` hook
3. **UI**: Add note field to profile page (editable when viewing others)
4. **Types**: The `Relationship` type already has `note` field

#### Priority: **Medium** ⭐⭐
Helpful for remembering context about users.

---

### 3.7 Familiar Followers
**Status: ❌ Not Implemented**

```
GET /api/v1/accounts/familiar_followers?id[]=1&id[]=2
```

Find mutual followers between you and other accounts.

#### Response Example
```json
[
  {
    "id": "1",
    "accounts": [
      { "id": "1087990", "username": "moss", ... },
      { "id": "1092723", "username": "vivianrose", ... }
    ]
  }
]
```

#### Implementation Plan
1. **Types**: Add `FamiliarFollowers` interface
2. **API Client**: Add `getFamiliarFollowers(ids)` function
3. **Query Hook**: Add `useFamiliarFollowers(ids)` hook
4. **UI**: Display "Followed by [avatars]" on profile pages

#### Priority: **Medium** ⭐⭐
Social proof feature that improves trust/discovery.

---

### 3.8 Get Lists Containing Account
**Status: ❌ Not Implemented**

```
GET /api/v1/accounts/:id/lists
```

Get lists that contain a specific account.

#### Implementation Plan
1. **API Client**: Add `getAccountLists(id)` function
2. **Query Hook**: Add `useAccountLists(id)` hook
3. **UI**: Display on profile page which lists they're in

#### Priority: **Low** ⭐
Requires Lists feature to be implemented first.

---

### 3.9 Get Featured Tags
**Status: ❌ Not Implemented**

```
GET /api/v1/accounts/:id/featured_tags
```

Get hashtags that an account has featured on their profile.

#### Implementation Plan
1. **Types**: Add `FeaturedTag` interface
2. **API Client**: Add `getAccountFeaturedTags(id)` function
3. **Query Hook**: Add `useAccountFeaturedTags(id)` hook
4. **UI**: Display featured hashtags on profile page

#### Priority: **Low** ⭐
Minor profile enhancement.

---

### 3.10 Remove Follower
**Status: ❌ Not Implemented**

```
POST /api/v1/accounts/:id/remove_from_followers
```

Remove someone from your followers list.

#### Implementation Plan
1. **API Client**: Add `removeFollower(id)` function
2. **Mutation Hook**: Add `useRemoveFollower()` hook
3. **UI**: Add "Remove follower" option on followers list page

#### Priority: **Medium** ⭐⭐
Useful moderation tool.

---

## Summary by Priority

### High Priority ⭐⭐⭐ (Essential) - ✅ ALL COMPLETED
| Feature | API Endpoint | Status |
|---------|-------------|--------|
| Block Account | `POST /api/v1/accounts/:id/block` | ✅ Done |
| Unblock Account | `POST /api/v1/accounts/:id/unblock` | ✅ Done |
| Mute Account | `POST /api/v1/accounts/:id/mute` | ✅ Done |
| Unmute Account | `POST /api/v1/accounts/:id/unmute` | ✅ Done |

### Medium Priority ⭐⭐ (Recommended)
| Feature | API Endpoint | Status |
|---------|-------------|--------|
| Preferences | `GET /api/v1/preferences` | ✅ Done (API only) |
| Register Account | `POST /api/v1/accounts` | ❌ Not Started |
| Private Note | `POST /api/v1/accounts/:id/note` | ❌ Not Started |
| Familiar Followers | `GET /api/v1/accounts/familiar_followers` | ❌ Not Started |
| Remove Follower | `POST /api/v1/accounts/:id/remove_from_followers` | ❌ Not Started |

### Low Priority ⭐ (Nice-to-have)
| Feature | API Endpoint | Status |
|---------|-------------|--------|
| Resend Confirmation | `POST /api/v1/emails/confirmations` | ❌ Not Started |
| Get Multiple Accounts | `GET /api/v1/accounts` | ❌ Not Started |
| Endorse Account | `POST /api/v1/accounts/:id/endorse` | ❌ Not Started |
| Get Account Lists | `GET /api/v1/accounts/:id/lists` | ❌ Not Started |
| Featured Tags | `GET /api/v1/accounts/:id/featured_tags` | ❌ Not Started |

---

## Already Implemented ✅

The following features from the API documentation are already implemented:

### Accounts
- ✅ `GET /api/v1/accounts/:id` - Get account
- ✅ `GET /api/v1/accounts/lookup` - Lookup by acct
- ✅ `GET /api/v1/accounts/verify_credentials` - Verify credentials
- ✅ `PATCH /api/v1/accounts/update_credentials` - Update credentials
- ✅ `GET /api/v1/accounts/:id/statuses` - Get account statuses
- ✅ `GET /api/v1/accounts/:id/followers` - Get followers
- ✅ `GET /api/v1/accounts/:id/following` - Get following
- ✅ `POST /api/v1/accounts/:id/follow` - Follow account
- ✅ `POST /api/v1/accounts/:id/unfollow` - Unfollow account
- ✅ `GET /api/v1/accounts/relationships` - Check relationships
- ✅ `GET /api/v1/accounts/search` - Search accounts

### Follow Requests
- ✅ `GET /api/v1/follow_requests` - Get pending requests
- ✅ `POST /api/v1/follow_requests/:id/authorize` - Accept request
- ✅ `POST /api/v1/follow_requests/:id/reject` - Reject request

---

## Next Steps

1. **Start with High Priority items** (Block/Mute) as these are essential moderation tools
2. **Add Preferences API** to improve the compose experience
3. **Implement Familiar Followers** for better social discovery
4. **Consider Registration flow** if targeting new users

---

## 4. Lists API

**Status: ✅ Implemented**

### API Endpoints
```
GET /api/v1/lists - View all lists
GET /api/v1/lists/:id - Show a single list
POST /api/v1/lists - Create a list
PUT /api/v1/lists/:id - Update a list
DELETE /api/v1/lists/:id - Delete a list
GET /api/v1/lists/:id/accounts - View accounts in a list
POST /api/v1/lists/:id/accounts - Add accounts to a list
DELETE /api/v1/lists/:id/accounts - Remove accounts from a list
GET /api/v1/timelines/list/:id - Get list timeline
GET /api/v1/accounts/:id/lists - Get lists containing an account
```

### Implementation:
- ✅ **Types**: Added `List`, `ListRepliesPolicy`, `CreateListParams`, `UpdateListParams` interfaces to `src/types/mastodon.ts`
- ✅ **Query Keys**: Added `lists` key factory to `src/api/queryKeys.ts`
- ✅ **API Client**: Added all list operations to `src/api/client.ts`:
  - `getLists()` - Fetch all lists
  - `getList(id)` - Fetch single list
  - `createList(params)` - Create a list
  - `updateList(id, params)` - Update a list
  - `deleteList(id)` - Delete a list
  - `getListAccounts(id, params)` - Get accounts in a list
  - `addAccountsToList(listId, accountIds)` - Add accounts to list
  - `removeAccountsFromList(listId, accountIds)` - Remove accounts from list
  - `getListTimeline(id, params)` - Get list timeline
  - `getAccountLists(accountId)` - Get lists containing an account
- ✅ **Query Hooks**: Added to `src/api/queries.ts`:
  - `useLists()` - Fetch all lists
  - `useList(id)` - Fetch single list
  - `useListAccounts(id)` - Infinite query for list accounts
  - `useInfiniteListTimeline(id)` - Infinite query for list timeline
  - `useAccountLists(accountId)` - Get lists containing an account
- ✅ **Mutation Hooks**: Added to `src/api/mutations.ts`:
  - `useCreateList()` - Create a list
  - `useUpdateList()` - Update a list
  - `useDeleteList()` - Delete a list
  - `useAddAccountsToList()` - Add accounts to a list
  - `useRemoveAccountsFromList()` - Remove accounts from a list
- ✅ **UI Pages**:
  - `/lists` - Main lists page with CRUD functionality
  - `/lists/[id]` - List detail page showing list timeline
  - `/lists/[id]/members` - Manage list members (add/remove accounts)
- ✅ **Navigation**: Added Lists link to sidebar navigation

### Features:
- Create, edit, and delete lists
- Set replies policy (list members, followed users, or none)
- Toggle exclusive mode (hide posts from home timeline)
- Browse list timeline with infinite scroll
- Add accounts from following list to lists
- Search following to add to lists
- Remove accounts from lists
- Visual indicators for list settings

### Priority: **Medium** ⭐⭐
Useful for organizing feeds and curating custom timelines.
