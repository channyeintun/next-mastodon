'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useTag } from '@/api/queries';
import { useFollowTag, useUnfollowTag } from '@/api/mutations';
import { useAuthStore } from '@/hooks/useStores';
import { Button } from '@/components/atoms';

interface FollowTagButtonProps {
  /** Hashtag name without the leading '#'. */
  tag: string;
}

/**
 * Follow / unfollow control for a hashtag.
 *
 * Renders nothing when signed out — `following` is only meaningful for an
 * authenticated user, and the underlying endpoint requires a token.
 *
 * Shows "Following" at rest and swaps to "Unfollow" on hover/focus, so the
 * current state is what you read by default and the destructive action only
 * appears when you are actually reaching for it.
 */
export function FollowTagButton({ tag }: FollowTagButtonProps) {
  const t = useTranslations('hashtag');
  const authStore = useAuthStore();
  const { data, isLoading } = useTag(tag);
  const followTag = useFollowTag();
  const unfollowTag = useUnfollowTag();
  const [hovered, setHovered] = useState(false);

  if (!authStore.isAuthenticated) return null;

  const isFollowing = !!data?.following;
  const pending = followTag.isPending || unfollowTag.isPending;

  const handleClick = () => {
    const mutation = isFollowing ? unfollowTag : followTag;
    mutation.mutate(tag, {
      onError: () => toast.error(t('followError')),
    });
  };

  const label = isFollowing
    ? (hovered ? t('unfollow') : t('following'))
    : t('follow');

  return (
    <FollowButton
      variant={isFollowing ? 'secondary' : 'primary'}
      size="small"
      onClick={handleClick}
      disabled={isLoading || pending}
      isLoading={pending}
      aria-pressed={isFollowing}
      $danger={isFollowing && hovered}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {label}
    </FollowButton>
  );
}

const FollowButton = styled(Button) <{ $danger?: boolean }>`
  min-width: 6.5rem;
  justify-content: center;
  ${({ $danger }) =>
    $danger &&
    `
      background: var(--red-6);
      border-color: var(--red-6);
      color: white;
    `}
`;
