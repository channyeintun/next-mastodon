'use client';

import EmojiPickerReact, { Theme } from 'emoji-picker-react';
import { useCustomEmojis } from '@/api/queries';
import type { Emoji } from '@/types/mastodon';

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
      {/* Picker */}
      <div
        className='emoji-picker'
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
      </div>
    </>
  );
}
