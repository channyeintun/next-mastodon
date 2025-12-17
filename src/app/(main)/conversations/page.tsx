'use client'

import { useRouter } from 'next/navigation'
import { Mail, Edit } from 'lucide-react'
import { useConversations } from '@/api/queries'
import { ConversationCard } from '@/components/molecules/ConversationCard'
import { ConversationCardSkeleton } from '@/components/molecules/ConversationCardSkeleton'
import { VirtualizedList } from '@/components/organisms/VirtualizedList'
import { useConversationStream } from '@/hooks/useStreaming'
import { IconButton } from '@/components/atoms/IconButton'
import type { Conversation } from '@/types/mastodon'

export default function ConversationsPage() {
  const router = useRouter()
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversations()

  // Enable real-time conversation updates
  useConversationStream()

  const allConversations = data?.pages.flatMap(page => page.data) ?? []

  if (isLoading) {
    return (
      <div className="full-height-container conversations-page-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface-1)' }}>
        {/* Header */}
        <div style={{
          zIndex: 10,
          padding: 'var(--size-4)',
          flexShrink: 0,
        }}>
          <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
            Direct Messages
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            Loading conversations...
          </p>
        </div>

        {/* Skeleton Loaders */}
        <div>
          {Array.from({ length: 10 }).map((_, index) => (
            <ConversationCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="full-height-container conversations-page-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface-1)' }}>
        {/* Header */}
        <div style={{
          zIndex: 10,
          padding: 'var(--size-4)',
          flexShrink: 0,
        }}>
          <h1 style={{ fontSize: 'var(--font-size-4)' }}>
            Direct Messages
          </h1>
        </div>

        {/* Error state */}
        <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', padding: 'var(--size-4)' }}>
          <Mail size={48} style={{ color: 'var(--text-3)', marginBottom: 'var(--size-4)' }} />
          <p style={{ fontSize: 'var(--font-size-3)', marginBottom: 'var(--size-3)', fontWeight: 600 }}>Error loading conversations</p>
          <p style={{ fontSize: 'var(--font-size-1)', color: 'var(--text-2)' }}>
            Failed to load your direct messages. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="full-height-container conversations-page-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface-1)' }}>
      {/* Header */}
      <div style={{
        zIndex: 10,
        padding: 'var(--size-4)',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
            Direct Messages
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {allConversations.length} {allConversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
        <IconButton
          onClick={() => router.push('/conversations/new')}
          aria-label="New message"
          style={{ flexShrink: 0 }}
        >
          <Edit size={20} />
        </IconButton>
      </div>

      {/* Conversations List */}
      <VirtualizedList<Conversation>
        items={allConversations}
        renderItem={(conversation) => (
          <ConversationCard
            conversation={conversation}
          />
        )}
        getItemKey={(conversation) => conversation.id}
        estimateSize={72}
        overscan={5}
        onLoadMore={fetchNextPage}
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        loadMoreThreshold={3}
        height="auto"
        style={{ flex: 1, minHeight: 0 }}
        scrollRestorationKey="conversations"
        endIndicator="You've reached the end"
        emptyState={
          <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)', padding: 'var(--size-4)' }}>
            <Mail size={48} style={{ color: 'var(--text-3)', marginBottom: 'var(--size-4)' }} />
            <p style={{ fontSize: 'var(--font-size-3)', marginBottom: 'var(--size-2)', fontWeight: 600 }}>No conversations yet</p>
            <p style={{ fontSize: 'var(--font-size-1)', color: 'var(--text-2)' }}>
              Send a direct message to start a conversation
            </p>
          </div>
        }
      />
    </div>
  )
}