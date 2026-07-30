'use client';

import Link from 'next/link';
import { Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFollowedTags } from '@/api/queries';
import { BackButton, EmptyState } from '@/components/atoms';
import { ListItemSkeleton } from '@/components/molecules';
import { FollowTagButton } from '@/components/molecules/FollowTagButton';

/**
 * Hashtags the signed-in user follows.
 *
 * Route protection is handled by the proxy/middleware allowlist rather than
 * here; when signed out the query is disabled and the empty state shows.
 */
export default function FollowedTagsPage() {
  const t = useTranslations('hashtag');
  const { data, isLoading } = useFollowedTags();
  const tags = data?.data ?? [];

  return (
    <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{
        background: 'var(--surface-1)',
        zIndex: 10,
        padding: 'var(--size-4)',
        borderBottom: '1px solid var(--surface-3)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-3)',
        flexShrink: 0,
      }}>
        <BackButton />
        <h1 style={{
          fontSize: 'var(--font-size-4)',
          fontWeight: 'var(--font-weight-6)',
          color: 'var(--text-1)',
        }}>
          {t('followedTags')}
        </h1>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--size-3)' }}>
        {isLoading && Array.from({ length: 6 }, (_, i) => <ListItemSkeleton key={i} />)}

        {!isLoading && tags.length === 0 && (
          <EmptyState
            icon={<Hash size={48} />}
            title={t('noFollowedTags')}
            description={t('noFollowedTagsHint')}
          />
        )}

        {!isLoading && tags.map((tag) => (
          <div
            key={tag.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-3)',
              padding: 'var(--size-3)',
              borderBottom: '1px solid var(--surface-3)',
            }}
          >
            <Link
              href={`/tags/${encodeURIComponent(tag.name)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-2)',
                flex: 1,
                minWidth: 0,
                color: 'var(--text-1)',
              }}
            >
              <Hash size={20} style={{ color: 'var(--indigo-6)', flexShrink: 0 }} />
              <span className="text-truncate" style={{ fontWeight: 'var(--font-weight-6)' }}>
                {tag.name}
              </span>
            </Link>
            <FollowTagButton tag={tag.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
