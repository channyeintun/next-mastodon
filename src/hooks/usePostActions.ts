import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFavouriteStatus,
  useUnfavouriteStatus,
  useReblogStatus,
  useUnreblogStatus,
  useBookmarkStatus,
  useUnbookmarkStatus,
  useMuteConversation,
  useUnmuteConversation,
  usePinStatus,
  useUnpinStatus,
  useVotePoll,
  useCurrentAccount,
  queryKeys,
} from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import type { Status } from '@/types';

export function usePostActions(status: Status, onDeleteClick?: (postId: string) => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  const [showCWContent, setShowCWContent] = useState(false);
  const [showCWMedia, setShowCWMedia] = useState(false);
  const [selectedPollChoices, setSelectedPollChoices] = useState<number[]>([]);

  const { data: currentAccount } = useCurrentAccount();
  const votePollMutation = useVotePoll();
  const favouriteMutation = useFavouriteStatus();
  const unfavouriteMutation = useUnfavouriteStatus();
  const reblogMutation = useReblogStatus();
  const unreblogMutation = useUnreblogStatus();
  const bookmarkMutation = useBookmarkStatus();
  const unbookmarkMutation = useUnbookmarkStatus();
  const muteConversationMutation = useMuteConversation();
  const unmuteConversationMutation = useUnmuteConversation();
  const pinStatusMutation = usePinStatus();
  const unpinStatusMutation = useUnpinStatus();

  // Handle reblog (boost) - show the original status
  const displayStatus = status.reblog || status;
  const isReblog = !!status.reblog;

  // Check if this is the current user's post
  const isOwnPost = currentAccount?.id === displayStatus.account.id;

  // Check if content warning is active (has actual text)
  const hasContentWarning =
    displayStatus.spoiler_text && displayStatus.spoiler_text.trim().length > 0;
  // Check if media should be blurred (sensitive flag OR content warning)
  const hasSensitiveMedia = displayStatus.sensitive || hasContentWarning;

  // Determine if poll voting is available
  const canVotePoll = displayStatus.poll
    ? authStore.isAuthenticated &&
    !displayStatus.poll.expired &&
    !displayStatus.poll.voted
    : false;

  // --- Event Handlers ---

  const handleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayStatus.favourited) {
      unfavouriteMutation.mutate(displayStatus.id);
    } else {
      favouriteMutation.mutate(displayStatus.id);
    }
  };

  const handleReblog = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.focus();
  };

  const confirmReblog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayStatus.reblogged) {
      unreblogMutation.mutate(displayStatus.id);
    } else {
      reblogMutation.mutate(displayStatus.id);
    }
  };

  const handleQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/compose?quoted_status_id=${displayStatus.id}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayStatus.bookmarked) {
      unbookmarkMutation.mutate(displayStatus.id);
    } else {
      bookmarkMutation.mutate(displayStatus.id);
    }
  };

  const handleMuteConversation = () => {
    if (displayStatus.muted) {
      unmuteConversationMutation.mutate(displayStatus.id);
    } else {
      muteConversationMutation.mutate(displayStatus.id);
    }
  };

  const handlePin = () => {
    if (displayStatus.pinned) {
      unpinStatusMutation.mutate(displayStatus.id);
    } else {
      pinStatusMutation.mutate(displayStatus.id);
    }
  };

  const handleEdit = () => {
    router.push(`/status/${displayStatus.id}/edit`);
  };

  const handleDelete = () => {
    // Call the callback provided by the component
    if (onDeleteClick) {
      onDeleteClick(displayStatus.id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: `Post by ${displayStatus.account.display_name || displayStatus.account.username}`,
      text: displayStatus.text || displayStatus.content.replace(/<[^>]*>/g, ''),
      url:
        displayStatus.url ||
        `${window.location.origin}/status/${displayStatus.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('video')
    ) {
      return;
    }
    if (window.location.pathname === `/status/${displayStatus.id}`) {
      return;
    }
    // Pre-populate status cache before navigation to avoid refetch
    queryClient.setQueryData(queryKeys.statuses.detail(displayStatus.id), displayStatus);
    router.push(`/status/${displayStatus.id}`);
  };

  const handlePollChoiceToggle = (index: number) => {
    if (!displayStatus.poll) return;
    if (displayStatus.poll.multiple) {
      setSelectedPollChoices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelectedPollChoices([index]);
    }
  };

  const handlePollVote = async () => {
    if (!displayStatus.poll || selectedPollChoices.length === 0) return;
    try {
      await votePollMutation.mutateAsync({
        pollId: displayStatus.poll.id,
        choices: selectedPollChoices,
      });
      setSelectedPollChoices([]);
    } catch (error) {
      console.error('Failed to vote on poll:', error);
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.location.pathname !== `/status/${displayStatus.id}`) {
      // Pre-populate status cache before navigation to avoid refetch
      queryClient.setQueryData(queryKeys.statuses.detail(displayStatus.id), displayStatus);
      router.push(`/status/${displayStatus.id}`);
    }
  };

  const toggleCWContent = () => setShowCWContent((prev) => !prev);
  const toggleCWMedia = () => setShowCWMedia((prev) => !prev);

  return {
    // Derived state
    displayStatus,
    isReblog,
    isOwnPost,
    hasContentWarning,
    hasSensitiveMedia,
    canVotePoll,
    // Component state
    showCWContent,
    showCWMedia,
    selectedPollChoices,
    // Handlers
    handleFavourite,
    handleReblog,
    confirmReblog,
    handleQuote,
    handleBookmark,
    handleMuteConversation,
    handlePin,
    handleEdit,
    handleDelete,
    handleShare,
    handleCardClick,
    handlePollChoiceToggle,
    handlePollVote,
    handleReply,
    toggleCWContent,
    toggleCWMedia,
  };
}
