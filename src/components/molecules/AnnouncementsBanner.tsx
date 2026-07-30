'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Megaphone, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAnnouncements } from '@/api/queries';
import { useDismissAnnouncement, useAnnouncementReaction } from '@/api/mutations';
import { sanitizeHtml } from '@/utils/sanitize';
import { formatRelativeTime } from '@/utils/date';
import { IconButton } from '@/components/atoms';
import type { Announcement, AnnouncementReaction } from '@/types/mastodon';

/**
 * Instance announcements — admin notices about outages, rule changes, downtime.
 *
 * The API only returns undismissed announcements, so anything rendered here is
 * genuinely unread. Dismissing is optimistic, so the card disappears on click.
 *
 * Only the first announcement is expanded by default; instances occasionally
 * post several at once and this sits above the timeline.
 */
export function AnnouncementsBanner() {
  const t = useTranslations('announcements');
  const { data: announcements } = useAnnouncements();
  const dismiss = useDismissAnnouncement();
  const [showAll, setShowAll] = useState(false);

  if (!announcements?.length) return null;

  const visible = showAll ? announcements : announcements.slice(0, 1);
  const hidden = announcements.length - visible.length;

  return (
    <Wrapper aria-label={t('title')}>
      {visible.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onDismiss={() => dismiss.mutate(announcement.id)}
          dismissLabel={t('dismiss')}
        />
      ))}

      {hidden > 0 && (
        <ShowMore type="button" onClick={() => setShowAll(true)}>
          {t('showAll', { count: hidden })}
        </ShowMore>
      )}
    </Wrapper>
  );
}

function AnnouncementCard({
  announcement,
  onDismiss,
  dismissLabel,
}: {
  announcement: Announcement;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  const react = useAnnouncementReaction();

  return (
    <Card>
      <CardHeader>
        <Megaphone size={16} aria-hidden="true" />
        <PublishedAt dateTime={announcement.published_at}>
          {formatRelativeTime(announcement.published_at)}
        </PublishedAt>
        <IconButton size="small" aria-label={dismissLabel} onClick={onDismiss}>
          <X size={16} />
        </IconButton>
      </CardHeader>

      {/* Instance-authored HTML — sanitised before render, same as status content */}
      <Content dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.content) }} />

      {announcement.reactions.length > 0 && (
        <Reactions>
          {announcement.reactions.map((reaction) => (
            <ReactionChip
              key={reaction.name}
              reaction={reaction}
              onToggle={() =>
                react.mutate({
                  id: announcement.id,
                  name: reaction.name,
                  active: !!reaction.me,
                })
              }
            />
          ))}
        </Reactions>
      )}
    </Card>
  );
}

function ReactionChip({
  reaction,
  onToggle,
}: {
  reaction: AnnouncementReaction;
  onToggle: () => void;
}) {
  return (
    <Chip type="button" onClick={onToggle} $active={!!reaction.me} aria-pressed={!!reaction.me}>
      {reaction.url ? (
        <ReactionImage src={reaction.url} alt={reaction.name} loading="lazy" />
      ) : (
        <span aria-hidden="true">{reaction.name}</span>
      )}
      <ChipCount>{reaction.count}</ChipCount>
    </Chip>
  );
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  margin-bottom: var(--size-3);
`;

const Card = styled.article`
  border: 1px solid var(--surface-3);
  border-inline-start: 3px solid var(--brand);
  border-radius: var(--radius-2);
  background: var(--surface-2);
  padding: var(--size-3);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--text-2);
  font-size: var(--font-size-0);
  margin-bottom: var(--size-2);

  > button {
    margin-inline-start: auto;
  }
`;

const PublishedAt = styled.time`
  color: var(--text-2);
`;

const Content = styled.div`
  color: var(--text-1);
  font-size: var(--font-size-1);
  line-height: var(--font-lineheight-3);
  overflow-wrap: anywhere;

  p {
    margin: 0 0 var(--size-2);
    max-width: none;
  }

  p:last-child {
    margin-bottom: 0;
  }

  a {
    color: var(--status-link-color);
    text-decoration: underline;
  }
`;

const Reactions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-1);
  margin-top: var(--size-3);
`;

const Chip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-round);
  cursor: pointer;
  font-size: var(--font-size-0);
  transition: background 0.2s ease, border-color 0.2s ease;
  border: 1px solid ${({ $active }) => ($active ? 'var(--brand)' : 'var(--surface-4)')};
  background: ${({ $active }) => ($active ? 'var(--brand-subtle)' : 'transparent')};
  color: var(--text-1);

  &:hover {
    background: var(--surface-3);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

const ReactionImage = styled.img`
  width: 1.2em;
  height: 1.2em;
  object-fit: contain;
`;

const ChipCount = styled.span`
  font-variant-numeric: tabular-nums;
  color: var(--text-2);
`;

const ShowMore = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  padding: var(--size-1) var(--size-2);
  color: var(--brand);
  cursor: pointer;
  font-size: var(--font-size-0);

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;
