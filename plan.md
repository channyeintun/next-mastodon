# Mastodon Client - Missing Features Plan

This document outlines API features from the Mastodon documentation that are not yet implemented in the client, along with recommendations for implementation.

---

## 1. Preferences API

**Status: ❌ Not Implemented**

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

### Implementation Plan
1. **Types**: Add `Preferences` interface to `src/types/mastodon.ts`
2. **API Client**: Add `getPreferences()` function to `src/api/client.ts`
3. **Query Key**: Add `preferences` key to `src/api/queryKeys.ts`
4. **Query Hook**: Add `usePreferences()` hook to `src/api/queries.ts`
5. **Integration**: Use preferences to set defaults in ComposerPanel (visibility, sensitive, language)

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
**Status: ❌ Not Implemented**

```
POST /api/v1/accounts/:id/block
POST /api/v1/accounts/:id/unblock
```

Block/unblock a user from seeing your content.

#### Implementation Plan
1. **API Client**: Add `blockAccount(id)` and `unblockAccount(id)` functions
2. **Mutation Hooks**: Add `useBlockAccount()` and `useUnblockAccount()` hooks
3. **UI**: Add "Block" option to account action menu (AccountCard, profile page)
4. **Page**: Create `/settings/blocks` page to view blocked accounts

#### Priority: **High** ⭐⭐⭐
Essential moderation feature.

---

### 3.4 Mute Account
**Status: ❌ Not Implemented**

```
POST /api/v1/accounts/:id/mute
POST /api/v1/accounts/:id/unmute
```

Mute a user (hide their posts and optionally notifications).

#### Parameters (mute)
- `notifications` (boolean) - Also mute notifications
- `duration` (number) - Seconds until mute expires (0 = indefinite)

#### Implementation Plan
1. **Types**: Add `MuteAccountParams` interface
2. **API Client**: Add `muteAccount(id, params?)` and `unmuteAccount(id)` functions
3. **Mutation Hooks**: Add `useMuteAccount()` and `useUnmuteAccount()` hooks
4. **UI**: Add "Mute" option with duration selector to account action menu
5. **Page**: Create `/settings/mutes` page to view muted accounts

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

### High Priority ⭐⭐⭐ (Essential)
| Feature | API Endpoint |
|---------|-------------|
| Block Account | `POST /api/v1/accounts/:id/block` |
| Unblock Account | `POST /api/v1/accounts/:id/unblock` |
| Mute Account | `POST /api/v1/accounts/:id/mute` |
| Unmute Account | `POST /api/v1/accounts/:id/unmute` |

### Medium Priority ⭐⭐ (Recommended)
| Feature | API Endpoint |
|---------|-------------|
| Preferences | `GET /api/v1/preferences` |
| Register Account | `POST /api/v1/accounts` |
| Private Note | `POST /api/v1/accounts/:id/note` |
| Familiar Followers | `GET /api/v1/accounts/familiar_followers` |
| Remove Follower | `POST /api/v1/accounts/:id/remove_from_followers` |

### Low Priority ⭐ (Nice-to-have)
| Feature | API Endpoint |
|---------|-------------|
| Resend Confirmation | `POST /api/v1/emails/confirmations` |
| Get Multiple Accounts | `GET /api/v1/accounts` |
| Endorse Account | `POST /api/v1/accounts/:id/endorse` |
| Get Account Lists | `GET /api/v1/accounts/:id/lists` |
| Featured Tags | `GET /api/v1/accounts/:id/featured_tags` |

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
