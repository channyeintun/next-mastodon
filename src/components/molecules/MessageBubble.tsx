/**
 * Message bubble component for chat conversations
 * Supports text content, media attachments, and custom emojis
 */

import styled from '@emotion/styled'
import { Avatar } from '@/components/atoms/Avatar'
import { StatusContent } from '@/components/molecules/StatusContent'
import { formatTimeAgo } from '@/utils/date'
import type { Status, MediaAttachment } from '@/types/mastodon'

interface MessageBubbleProps {
  status: Status
  isOwn: boolean
  stripMentions: (html: string) => string
  showAvatar?: boolean
  isLastMessage?: boolean
  isConsecutive?: boolean
}

export function MessageBubble({ status, isOwn, stripMentions, showAvatar = true, isLastMessage = false, isConsecutive = false }: MessageBubbleProps) {
  const hasMedia = status.media_attachments && status.media_attachments.length > 0
  const strippedContent = stripMentions(status.content)
  // Check if there's actual text content (not just empty HTML tags or whitespace)
  const textContent = strippedContent?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
  const hasText = Boolean(textContent)

  return (
    <MessageRow $isOwn={isOwn} $isConsecutive={isConsecutive}>
      {showAvatar ? (
        <Avatar
          src={status.account.avatar}
          alt={status.account.display_name || status.account.username}
          size="small"
          style={{ marginTop: 'var(--size-1)' }}
        />
      ) : (
        <AvatarPlaceholder />
      )}
      <MessageContent $isOwn={isOwn} tabIndex={0} className="message-content">
        {hasMedia && (
          <MediaContainer $count={status.media_attachments.length}>
            {status.media_attachments.map((media) => (
              <MediaItem key={media.id} media={media} />
            ))}
          </MediaContainer>
        )}
        {hasText && (
          <Bubble $isOwn={isOwn}>
            <StatusContent
              html={strippedContent}
              emojis={status.emojis}
              mentions={status.mentions}
              collapsible={false}
              style={{ fontSize: 'inherit', lineHeight: '1.5' }}
            />
          </Bubble>
        )}
        <MessageTimestamp $isLastMessage={isLastMessage} className="message-timestamp">
          {formatTimeAgo(status.created_at)}
        </MessageTimestamp>
      </MessageContent>
    </MessageRow>
  )
}

function MediaItem({ media }: { media: MediaAttachment }) {
  const handleClick = () => {
    if (media.url) {
      window.open(media.url, '_blank')
    }
  }

  if (media.type === 'image' || media.type === 'gifv') {
    return (
      <MediaImage
        src={media.preview_url || media.url || ''}
        alt={media.description || ''}
        onClick={handleClick}
        loading="lazy"
      />
    )
  }

  if (media.type === 'video') {
    return (
      <MediaVideo controls preload="metadata">
        <source src={media.url || ''} />
      </MediaVideo>
    )
  }

  if (media.type === 'audio') {
    return (
      <MediaAudio controls>
        <source src={media.url || ''} />
      </MediaAudio>
    )
  }

  return null
}

// Styled Components
const MessageTimestamp = styled.span<{ $isLastMessage: boolean }>`
  font-size: var(--font-size-0);
  color: var(--text-3);
  display: block;
  opacity: ${props => props.$isLastMessage ? 1 : 0};
  max-height: ${props => props.$isLastMessage ? '20px' : 0};
  overflow: hidden;
  transition: opacity 0.2s ease, max-height 0.2s ease;
`

const MessageRow = styled.div<{ $isOwn: boolean; $isConsecutive: boolean }>`
  display: flex;
  gap: var(--size-2);
  flex-direction: ${props => props.$isOwn ? 'row-reverse' : 'row'};
  align-items: flex-start;
  margin-top: ${props => props.$isConsecutive ? 'calc(var(--size-3) * -1 + var(--size-1))' : '0'};
`

// Invisible placeholder to maintain layout when avatar is hidden
// Uses var(--size-6) to match Avatar component's "small" size
const AvatarPlaceholder = styled.div`
  width: var(--size-6);
  height: var(--size-6);
  flex-shrink: 0;
`

const MessageContent = styled.div<{ $isOwn: boolean }>`
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
  align-items: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  outline: none;

  &:focus .message-timestamp {
    opacity: 1;
    max-height: 20px;
  }
`

const MediaContainer = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: ${props => props.$count === 1 ? '1fr' : 'repeat(2, 1fr)'};
  gap: var(--size-1);
  max-width: 300px;
  border-radius: var(--radius-3);
  overflow: hidden;
`

const MediaImage = styled.img`
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  cursor: pointer;
  border-radius: var(--radius-2);
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`

const MediaVideo = styled.video`
  width: 100%;
  max-height: 250px;
  border-radius: var(--radius-2);
`

const MediaAudio = styled.audio`
  width: 100%;
  border-radius: var(--radius-2);
`

const Bubble = styled.div<{ $isOwn: boolean }>`
  padding: var(--size-3) var(--size-4);
  border-radius: ${props => props.$isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px'};
  background: ${props => props.$isOwn ? 'var(--blue-7)' : 'var(--surface-3)'};
  color: ${props => props.$isOwn ? 'var(--stone-0)' : 'var(--text-1)'};
  word-break: break-word;
  box-shadow: var(--shadow-1);

  /* Override all text and link colors for own messages */
  ${props => props.$isOwn && `
    a {
      color: var(--stone-0) !important;
      text-decoration: underline;
    }

    p, span, div {
      color: var(--stone-0) !important;
    }
  `}
`
