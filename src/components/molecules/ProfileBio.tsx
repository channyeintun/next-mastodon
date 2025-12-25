'use client';

import styled from '@emotion/styled';
import { EmojiText } from '@/components/atoms';
import type { Emoji } from '@/types/mastodon';

interface ProfileBioProps {
    note: string;
    emojis: Emoji[];
}

const BioContainer = styled.div`
  margin-bottom: var(--size-3);
  line-height: 1.5;
  color: var(--text-1);
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  min-width: 0;

  code {
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

/**
 * Presentation component for profile bio/note.
 * Renders HTML content with emoji support.
 */
export function ProfileBio({ note, emojis }: ProfileBioProps) {
    if (!note) return null;

    return (
        <BioContainer>
            <EmojiText text={note} emojis={emojis} html />
        </BioContainer>
    );
}
