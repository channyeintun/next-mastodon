'use client';

import styled from '@emotion/styled';
import { CheckCircle } from 'lucide-react';
import type { Emoji } from '@/types/mastodon';
import { EmojiText } from '@/components/atoms';

interface ProfileField {
  name: string;
  value: string;
  verified_at?: string | null;
}

interface ProfileFieldsProps {
  fields: ProfileField[];
  emojis: Emoji[];
}

const Container = styled.div`
  margin-bottom: var(--size-3);
`;

const FieldRow = styled.div<{ $isLast: boolean; $verified: boolean }>`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--size-2);
  padding: var(--size-2) 0;
  border-bottom: ${({ $isLast }) => ($isLast ? 'none' : '1px solid var(--surface-3)')};
  font-size: var(--font-size-1);
  ${({ $verified }) => $verified && `
    background-color: color-mix(in srgb, var(--green-6) 15%, transparent);
    padding-inline: var(--size-2);
    margin-inline: calc(-1 * var(--size-2));
    border-radius: var(--radius-2);
  `}
`;

const FieldName = styled.div`
  font-weight: var(--font-weight-6);
  color: var(--text-2);
  max-width: 160px;
`;

const FieldValue = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-1);
  overflow-wrap: break-word;
  word-break: break-word;

  a {
    text-decoration: underline;
  }
`;

const VerifiedIcon = styled(CheckCircle)`
  color: var(--green-6);
  flex-shrink: 0;
`;

/**
 * Presentation component for profile custom metadata fields.
 */
export function ProfileFields({ fields, emojis }: ProfileFieldsProps) {
  if (fields.length === 0) return null;

  return (
    <Container>
      {fields.map((field, index) => (
        <FieldRow key={index} $isLast={index === fields.length - 1} $verified={!!field.verified_at}>
          <FieldName>
            <EmojiText text={field.name} emojis={emojis} />
          </FieldName>
          <FieldValue>
            <EmojiText text={field.value} emojis={emojis} html />
            {field.verified_at && (
              <span title="Verified">
                <VerifiedIcon size={14} />
              </span>
            )}
          </FieldValue>
        </FieldRow>
      ))}
    </Container>
  );
}

