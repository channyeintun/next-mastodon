'use client';

import styled from '@emotion/styled';
import EmojiPickerReact, { Theme } from 'emoji-picker-react';
import { useCustomEmojis } from '@/api';
import type { Emoji } from '@/types';

// Styled components
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
`;

const PickerContainer = styled.div`
  z-index: 50;
`;

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const formatCustomEmojis = (mastodonEmojis: Emoji[]) => {
  if (!Array.isArray(mastodonEmojis)) {
    return [];
  }

  return mastodonEmojis
    .filter((emoji) => emoji.visible_in_picker && emoji.url)
    .map((emoji) => ({
      id: emoji.shortcode,
      names: [emoji.shortcode],
      imgUrl: emoji.url,
    }));
};

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const { data: customEmojis } = useCustomEmojis();

  const formattedCustomEmojis = customEmojis
    ? formatCustomEmojis(customEmojis)
    : [];

  const handleEmojiClick = (emojiData: any) => {
    // If it's a custom emoji, emoji-picker-react usually provides the id/names we passed
    // We want to insert :shortcode:
    if (emojiData.isCustom) {
      const shortcode = emojiData.id || emojiData.names[0];
      onEmojiSelect(`:${shortcode}:`);
    } else {
      onEmojiSelect(emojiData.emoji);
    }
    onClose();
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      {/* Picker */}
      <PickerContainer
        className='emoji-picker'
        onClick={(e) => e.stopPropagation()}
      >
        <EmojiPickerReact
          onEmojiClick={handleEmojiClick}
          theme={Theme.AUTO}
          customEmojis={formattedCustomEmojis}
          previewConfig={{
            showPreview: false,
          }}
          skinTonesDisabled
          height={350}
          width="100%"
        />
      </PickerContainer>
    </>
  );
}
