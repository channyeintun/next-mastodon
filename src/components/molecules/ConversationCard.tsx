'use client'

import styled from '@emotion/styled'
import { useRouter } from 'next/navigation'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Avatar } from '../atoms/Avatar'
import { EmojiText } from '../atoms/EmojiText'
import { IconButton } from '../atoms/IconButton'
import { useDeleteConversation } from '@/api/mutations'
import { markConversationAsRead } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import { useConversationStore } from '@/hooks/useStores'
import { stripMentions } from '@/utils/conversationUtils'
import { formatTimeAgo } from '@/utils/date'
import type { Conversation } from '@/types/mastodon'
import type { CSSProperties } from 'react'

interface ConversationCardProps {
  conversation: Conversation
  style?: CSSProperties
}

export function ConversationCard({ conversation, style }: ConversationCardProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const conversationStore = useConversationStore()
  const deleteConversation = useDeleteConversation()

  const accountNames = conversation.accounts
    .map(acc => acc.display_name || acc.username)
    .join(', ')

  const lastStatus = conversation.last_status
  const timestamp = lastStatus?.created_at
    ? formatTimeAgo(lastStatus.created_at)
    : ''

  // Get text preview from last status
  const getTextPreview = () => {
    if (!lastStatus) return 'No messages yet'
    // Strip mentions and HTML tags for preview
    const strippedHtml = stripMentions(lastStatus.content)
    const text = strippedHtml.replace(/<[^>]*>/g, '')
    return text.trim() || '(Media only)'
  }

  const handleClick = () => {
    // Optimistic update: immediately mark as read in cache
    if (conversation.unread) {
      // Store previous data for rollback
      const previousData = queryClient.getQueryData<InfiniteData<Conversation[]>>(queryKeys.conversations.list())

      // Optimistically update cache
      queryClient.setQueryData<InfiniteData<Conversation[]>>(
        queryKeys.conversations.list(),
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map(page =>
              page.map(conv =>
                conv.id === conversation.id ? { ...conv, unread: false } : conv
              )
            ),
          }
        }
      )

      // Fire-and-forget API call with rollback on error
      markConversationAsRead(conversation.id).catch(() => {
        // Rollback on error
        if (previousData) {
          queryClient.setQueryData(queryKeys.conversations.list(), previousData)
        }
      })
    }

    // Store the full conversation object (includes last_status, accounts, etc.)
    conversationStore.setConversation(conversation)
    router.push('/conversations/chat')
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return
    }

    try {
      await deleteConversation.mutateAsync(conversation.id)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      alert('Failed to delete conversation. Please try again.')
    }
  }

  return (
    <ChatListItem onClick={handleClick} style={style}>
      <AvatarWrapper>
        {conversation.accounts[0] && (
          <Avatar
            src={conversation.accounts[0].avatar}
            alt={conversation.accounts[0].display_name || conversation.accounts[0].username}
            size="large"
          />
        )}
        {conversation.unread && <UnreadDot />}
      </AvatarWrapper>

      <ChatContent>
        <TopRow>
          <NameWrapper $unread={conversation.unread}>
            <EmojiText
              text={accountNames}
              emojis={conversation.accounts.flatMap(acc => acc.emojis)}
            />
          </NameWrapper>
          {timestamp && <Timestamp $unread={conversation.unread}>{timestamp}</Timestamp>}
        </TopRow>

        <Preview $unread={conversation.unread}>{getTextPreview()}</Preview>
      </ChatContent>

      <DeleteButton className="delete-button">
        <IconButton
          onClick={handleDelete}
          aria-label="Delete conversation"
          disabled={deleteConversation.isPending}
          style={{
            color: 'var(--red-9)',
            background: 'var(--surface-1)',
            border: '1px solid var(--surface-3)',
          }}
        >
          <Trash2 size={16} />
        </IconButton>
      </DeleteButton>
    </ChatListItem>
  )
}

// Modern chat list item design - flat, clean, like Messenger/WhatsApp
const ChatListItem = styled.div<{ $unread?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-3) var(--size-4);
  margin: var(--size-2) var(--size-3);
  background: var(--surface-2);
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  border-radius: 8px;
  box-shadow: var(--shadow-1);

  &:hover {
    background: var(--surface-3);
  }

  &:hover .delete-button {
    opacity: 1;
    pointer-events: auto;
  }

  &:active {
    background: var(--surface-4);
  }
`

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`

const UnreadDot = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--blue-9);
  border: 2px solid var(--surface-1);
`

const ChatContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-2);
`

const NameWrapper = styled.div<{ $unread?: boolean }>`
  font-weight: ${props => props.$unread ? '700' : '500'};
  font-size: var(--font-size-2);
  color: var(--text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`

const Timestamp = styled.time<{ $unread?: boolean }>`
  font-size: var(--font-size-0);
  color: ${props => props.$unread ? 'var(--blue-9)' : 'var(--text-3)'};
  flex-shrink: 0;
  font-weight: ${props => props.$unread ? '600' : '400'};
`

const Preview = styled.div<{ $unread?: boolean }>`
  font-size: var(--font-size-1);
  color: ${props => props.$unread ? 'var(--text-1)' : 'var(--text-2)'};
  font-weight: ${props => props.$unread ? '500' : '400'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
`

const DeleteButton = styled.div`
  position: absolute;
  top: 50%;
  right: var(--size-3);
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 1;
`