/**
 * Mastodon API TypeScript Types
 * Based on https://docs.joinmastodon.org/api/
 */

export interface Mention {
  id: string
  username: string
  url: string
  acct: string // username for local, username@domain for remote
}

export interface Status {
  // Identity
  id: string
  uri: string
  url: string | null
  created_at: string // ISO 8601
  edited_at: string | null

  // Content
  content: string // HTML
  text: string | null // Plain text
  spoiler_text: string
  language: string | null
  emojis: Emoji[]
  mentions: Mention[]

  // Visibility
  visibility: 'public' | 'unlisted' | 'private' | 'direct'
  sensitive: boolean

  // Author
  account: Account

  // Metrics
  replies_count: number
  reblogs_count: number
  favourites_count: number
  quotes_count?: number

  // Media & Polls
  media_attachments: MediaAttachment[]
  poll: Poll | null
  card?: Card | null

  // Context
  in_reply_to_id: string | null
  in_reply_to_account_id: string | null
  reblog: Status | null
  quote?: {
    state: 'pending' | 'accepted' | 'rejected'
    quoted_status: Status
  } | null

  // User-specific
  favourited?: boolean
  reblogged?: boolean
  bookmarked?: boolean
  pinned?: boolean
  muted?: boolean
}

export interface Account {
  // Identity
  id: string
  username: string
  acct: string // username or username@domain
  url: string
  uri: string

  // Profile
  display_name: string
  note: string // HTML bio
  avatar: string
  avatar_static: string
  header: string
  header_static: string

  // Metrics
  followers_count: number
  following_count: number
  statuses_count: number
  last_status_at: string | null

  // Metadata
  fields: Field[]
  emojis: Emoji[]
  created_at: string

  // Flags
  locked: boolean
  bot: boolean
  group?: boolean
  discoverable?: boolean
  suspended?: boolean
  limited: boolean

  // Source
  source?: {
    privacy: 'public' | 'unlisted' | 'private' | 'direct'
    sensitive: boolean
    language: string | null
    note: string
    fields: Field[]
    follow_requests_count?: number
    hide_collections?: boolean
    discoverable?: boolean
    indexable?: boolean
    attribution_domains?: string[]
    quote_policy?: 'public' | 'followers' | 'nobody'
  }
}

export interface Context {
  ancestors: Status[]
  descendants: Status[]
}

export interface Relationship {
  id: string
  following: boolean
  followed_by: boolean
  requested: boolean
  blocking: boolean
  muting: boolean
  muting_notifications: boolean
  showing_reblogs: boolean
  notifying: boolean
  endorsed: boolean
  note: string
}

export interface MediaAttachment {
  id: string
  type: 'image' | 'gifv' | 'video' | 'audio'
  url: string | null
  preview_url: string | null
  remote_url: string | null
  description: string | null // Alt text
  blurhash: string | null
  meta?: {
    original?: {
      width: number
      height: number
      size: string
      aspect: number
    }
    small?: {
      width: number
      height: number
      size: string
      aspect: number
    }
    focus?: {
      x: number
      y: number
    }
  }
}

export interface Poll {
  id: string
  expires_at: string | null
  expired: boolean
  multiple: boolean
  votes_count: number
  voters_count: number | null
  voted?: boolean
  own_votes?: number[]
  options: PollOption[]
  emojis: Emoji[]
}

export interface PollOption {
  title: string
  votes_count: number | null
}

export interface Tag {
  id: string
  name: string
  url: string
  following?: boolean
  history?: Array<{
    day: string
    uses: string
    accounts: string
  }>
}

export interface SearchResults {
  accounts: Account[]
  statuses: Status[]
  hashtags: Tag[]
}

export interface Field {
  name: string
  value: string // HTML
  verified_at: string | null
}

export interface Emoji {
  shortcode: string
  url: string
  static_url: string
  visible_in_picker: boolean
  category?: string
}

export interface Card {
  url: string
  title: string
  description: string
  type: 'link' | 'photo' | 'video' | 'rich'
  image: string | null
  blurhash: string | null
}

export interface TrendingLink extends Card {
  author_name?: string
  author_url?: string
  provider_name?: string
  provider_url?: string
  html?: string
  width?: number
  height?: number
  embed_url?: string
  history: Array<{
    day: string
    uses: string
    accounts: string
  }>
}

export interface Application {
  id: string
  client_id: string
  client_secret: string
  scopes: string[]
  redirect_uris: string[]
}

export interface Token {
  access_token: string
  token_type: 'Bearer'
  scope: string
  created_at: number
}

// Request types
export interface CreateStatusParams {
  status?: string
  media_ids?: string[]
  poll?: {
    options: string[]
    expires_in: number
    multiple?: boolean
    hide_totals?: boolean
  }
  in_reply_to_id?: string
  sensitive?: boolean
  spoiler_text?: string
  visibility?: 'public' | 'unlisted' | 'private' | 'direct'
  quote_approval_policy?: 'public' | 'followers' | 'nobody'
  language?: string
  quoted_status_id?: string
  scheduled_at?: string
}

export interface CreateAppParams {
  client_name: string
  redirect_uris: string
  scopes?: string
  website?: string
}

export interface TimelineParams {
  max_id?: string
  since_id?: string
  min_id?: string
  limit?: number
  // Account status filters
  exclude_replies?: boolean
  exclude_reblogs?: boolean
  only_media?: boolean
}

export interface SearchParams {
  q: string
  type?: 'accounts' | 'statuses' | 'hashtags'
  resolve?: boolean
  following?: boolean
  limit?: number
  offset?: number
}

export interface UpdateAccountParams {
  display_name?: string
  note?: string
  avatar?: File | Blob
  header?: File | Blob
  locked?: boolean
  bot?: boolean
  discoverable?: boolean
  hide_collections?: boolean
  indexable?: boolean
  fields_attributes?: Array<{
    name: string
    value: string
  }>
  // Source fields for posting defaults
  source?: {
    privacy?: 'public' | 'unlisted' | 'private' | 'direct'
    sensitive?: boolean
    language?: string
    quote_policy?: 'public' | 'followers' | 'nobody'
  }
}

export interface Instance {
  domain: string
  title: string
  version: string
  source_url: string
  description: string
  usage: {
    users: {
      active_month: number
    }
  }
  thumbnail: {
    url: string
    blurhash: string
    versions: {
      '@1x': string
      '@2x': string
    }
  }
  icon: Array<{
    src: string
    size: string
  }>
  languages: string[]
  configuration: {
    urls: {
      streaming: string
      status?: string
      about?: string
      privacy_policy?: string
      terms_of_service?: string | null
    }
    vapid?: {
      public_key: string
    }
    accounts: {
      max_featured_tags: number
      max_pinned_statuses?: number
    }
    statuses: {
      max_characters: number
      max_media_attachments: number
      characters_reserved_per_url: number
    }
    media_attachments: {
      description_limit: number
      image_matrix_limit: number
      image_size_limit: number
      supported_mime_types: string[]
      video_frame_rate_limit: number
      video_matrix_limit: number
      video_size_limit: number
    }
    polls: {
      max_options: number
      max_characters_per_option: number
      min_expiration: number
      max_expiration: number
    }
    translation: {
      enabled: boolean
    }
  }
  registrations: {
    enabled: boolean
    approval_required: boolean
    message: string | null
  }
  contact: {
    email: string
    account: Account
  }
  rules: Rule[]
  // Wrapstodon year - when set, indicates annual reports are available for this year
  wrapstodon?: number
}

// Notification types
export type NotificationType =
  | 'mention'
  | 'status'
  | 'reblog'
  | 'follow'
  | 'follow_request'
  | 'favourite'
  | 'poll'
  | 'update'
  | 'admin.sign_up'
  | 'admin.report'
  | 'severed_relationships'
  | 'moderation_warning'

// V1 Notification (individual)
export interface Notification {
  id: string
  type: NotificationType
  created_at: string
  account: Account
  status?: Status
}

export interface NotificationParams {
  max_id?: string
  since_id?: string
  min_id?: string
  limit?: number
  types?: NotificationType[]
  exclude_types?: NotificationType[]
  account_id?: string
}

export interface UnreadCount {
  count: number
}

// V2 Grouped Notifications
export interface PartialAccountWithAvatar {
  id: string
  acct: string
  avatar: string
  avatar_static: string
}

export interface NotificationGroup {
  group_key: string
  notifications_count: number
  type: NotificationType
  most_recent_notification_id: string
  page_min_id?: string
  page_max_id?: string
  latest_page_notification_at?: string
  sample_account_ids: string[]
  status_id?: string
}

export interface GroupedNotificationsResults {
  accounts: Account[]
  partial_accounts?: PartialAccountWithAvatar[]
  statuses: Status[]
  notification_groups: NotificationGroup[]
}

export interface GroupedNotificationParams {
  max_id?: string
  since_id?: string
  min_id?: string
  limit?: number
  types?: NotificationType[]
  exclude_types?: NotificationType[]
  grouped_types?: NotificationType[]
  expand_accounts?: 'full' | 'partial_avatars'
}

// Mute account params
export interface MuteAccountParams {
  notifications?: boolean
  duration?: number // seconds, 0 = indefinite
}

// User preferences
export interface Preferences {
  'posting:default:visibility': 'public' | 'unlisted' | 'private' | 'direct'
  'posting:default:sensitive': boolean
  'posting:default:language': string | null
  'posting:default:quote_policy'?: 'public' | 'followers' | 'nobody'
  'reading:expand:media': 'default' | 'show_all' | 'hide_all'
  'reading:expand:spoilers': boolean
}

// Lists
export type ListRepliesPolicy = 'followed' | 'list' | 'none'

export interface List {
  id: string
  title: string
  replies_policy: ListRepliesPolicy
  exclusive: boolean
}

export interface CreateListParams {
  title: string
  replies_policy?: ListRepliesPolicy
  exclusive?: boolean
}

export interface UpdateListParams {
  title?: string
  replies_policy?: ListRepliesPolicy
  exclusive?: boolean
}

// Status History & Source
export interface StatusEdit {
  content: string
  spoiler_text: string
  sensitive: boolean
  created_at: string
  account: Account
  media_attachments: MediaAttachment[]
  emojis: Emoji[]
  poll?: Poll
}

export interface StatusSource {
  id: string
  text: string
  spoiler_text: string
}

// Scheduled Statuses
export interface ScheduledStatus {
  id: string
  scheduled_at: string
  params: CreateStatusParams
  media_attachments: MediaAttachment[]
}

export interface ScheduledStatusParams {
  scheduled_at?: string
}

// Conversations (Direct Messages)
export interface Conversation {
  id: string
  unread: boolean
  accounts: Account[]
  last_status: Status | null
}

export interface ConversationParams {
  max_id?: string
  since_id?: string
  min_id?: string
  limit?: number
}

// Notification Requests
export interface NotificationRequest {
  id: string
  created_at: string
  updated_at: string
  notifications_count: number
  account: Account
  last_status?: Status
}

export interface NotificationRequestParams {
  max_id?: string
  since_id?: string
  min_id?: string
  limit?: number
}

// Notification Policy V1 (boolean-based)
export interface NotificationPolicyV1 {
  filter_not_following: boolean
  filter_not_followers: boolean
  filter_new_accounts: boolean
  filter_private_mentions: boolean
  summary: {
    pending_requests_count: number
    pending_notifications_count: number
  }
}

export interface UpdateNotificationPolicyV1Params {
  filter_not_following?: boolean
  filter_not_followers?: boolean
  filter_new_accounts?: boolean
  filter_private_mentions?: boolean
}

// Notification Policy V2 (string-based)
export type NotificationPolicyValue = 'accept' | 'filter' | 'drop'

export interface NotificationPolicy {
  for_not_following: NotificationPolicyValue
  for_not_followers: NotificationPolicyValue
  for_new_accounts: NotificationPolicyValue
  for_private_mentions: NotificationPolicyValue
  for_limited_accounts: NotificationPolicyValue
  summary: {
    pending_requests_count: number
    pending_notifications_count: number
  }
}

export interface UpdateNotificationPolicyParams {
  for_not_following?: NotificationPolicyValue
  for_not_followers?: NotificationPolicyValue
  for_new_accounts?: NotificationPolicyValue
  for_private_mentions?: NotificationPolicyValue
  for_limited_accounts?: NotificationPolicyValue
}

// Language - for language selection dropdown
export interface Language {
  code: string
  name: string
}

// Translation - response from POST /api/v1/statuses/{id}/translate
export interface Translation {
  content: string
  spoiler_text: string
  detected_source_language: string
  language: string
  provider: string
  poll?: {
    id: string
    options: Array<{ title: string }>
  }
  media_attachments?: Array<{
    id: string
    description: string
  }>
}

// Web Push Subscriptions
export interface PushAlerts {
  follow: boolean
  favourite: boolean
  reblog: boolean
  mention: boolean
  poll: boolean
  status?: boolean
  update?: boolean
}

export interface WebPushSubscription {
  id: string
  endpoint: string
  standard: boolean
  server_key: string
  alerts: PushAlerts
}

export type PushPolicy = 'all' | 'followed' | 'follower' | 'none'

export interface CreatePushSubscriptionParams {
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
  data?: {
    alerts?: Partial<PushAlerts>
    policy?: PushPolicy
  }
}

export interface UpdatePushSubscriptionParams {
  data: {
    alerts?: Partial<PushAlerts>
    policy?: PushPolicy
  }
}

// Filters (v2 API)

// Filter context where the filter applies
export type FilterContext = 'home' | 'notifications' | 'public' | 'thread' | 'account'

// Filter action when a match is found
export type FilterAction = 'warn' | 'hide' | 'blur'

// Keyword within a filter
export interface FilterKeyword {
  id: string
  keyword: string
  whole_word: boolean
}

// Status within a filter (for filtering specific statuses)
export interface FilterStatus {
  id: string
  status_id: string
}

// Filter entity (v2 API)
export interface Filter {
  id: string
  title: string
  context: FilterContext[]
  expires_at: string | null
  filter_action: FilterAction
  keywords: FilterKeyword[]
  statuses: FilterStatus[]
}

// Filter result attached to a status when it matches filters
export interface FilterResult {
  filter: Filter
  keyword_matches: string[] | null
  status_matches: string[] | null
}

// Parameters for creating/updating a filter keyword
export interface FilterKeywordParams {
  id?: string           // Include to update existing keyword
  keyword: string
  whole_word?: boolean
  _destroy?: boolean    // Set to true to remove the keyword
}

// Parameters for creating a filter
export interface CreateFilterParams {
  title: string
  context: FilterContext[]
  filter_action?: FilterAction
  expires_in?: number   // Seconds until expiration, or null for never
  keywords_attributes?: FilterKeywordParams[]
}

// Parameters for updating a filter
export interface UpdateFilterParams {
  title?: string
  context?: FilterContext[]
  filter_action?: FilterAction
  expires_in?: number
  keywords_attributes?: FilterKeywordParams[]
}

// Report types
export type ReportCategory = 'other' | 'spam' | 'legal' | 'violation'

export interface Report {
  id: string
  action_taken: boolean
  action_taken_at: string | null
  category: ReportCategory
  comment: string
  forwarded: boolean
  created_at: string
  status_ids: string[]
  rule_ids: string[]
  target_account: Account
}

export interface CreateReportParams {
  account_id: string
  status_ids?: string[]
  comment?: string
  forward?: boolean
  category?: ReportCategory
  rule_ids?: string[]
}

// Instance Rule (standalone)
export interface Rule {
  id: string
  text: string
  hint?: string
  translations?: Record<string, { text: string; hint: string }>
}

// Instance Privacy Policy
export interface PrivacyPolicy {
  updated_at: string
  content: string
}

// Instance Terms of Service
export interface TermsOfService {
  effective_date: string
  effective: boolean
  content: string
  succeeded_by: string | null
}

// Instance Extended Description
export interface ExtendedDescription {
  updated_at: string
  content: string
}

// Annual Report (Wrapstodon) Types
export type AnnualReportState = 'available' | 'generating' | 'eligible' | 'ineligible'

export interface NameAndCount {
  name: string
  count: number
}

export interface TimeSeriesMonth {
  month: number
  statuses: number
  following: number
  followers: number
}

export interface TopStatuses {
  by_reblogs: string | null
  by_favourites: string | null
  by_replies: string | null
}

export type Archetype = 'lurker' | 'booster' | 'pollster' | 'replier' | 'oracle'

export interface AnnualReportData {
  archetype: Archetype
  time_series: TimeSeriesMonth[]
  top_hashtags: NameAndCount[]
  top_statuses: TopStatuses
}

export interface AnnualReport {
  year: number
  schema_version: number
  data: AnnualReportData
  share_url: string | null
  account_id: string
}

export interface AnnualReportResponse {
  annual_reports: AnnualReport[]
  accounts: Account[]
  statuses: Status[]
}

export interface AnnualReportStateResponse {
  state: AnnualReportState
}

// Suggestions (v2 API)
export type SuggestionSource = 'staff' | 'global' | 'past_interactions'

export interface Suggestion {
  source: SuggestionSource
  sources: string[]
  account: Account
}
