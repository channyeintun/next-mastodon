'use client';

import styled from '@emotion/styled';
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

const FieldRow = styled.div<{ $isLast: boolean }>`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--size-2);
  padding: var(--size-2) 0;
  border-bottom: ${({ $isLast }) => ($isLast ? 'none' : '1px solid var(--surface-3)')};
  font-size: var(--font-size-1);
`;

const FieldName = styled.div`
  font-weight: var(--font-weight-6);
  color: var(--text-2);
  max-width: 160px;
`;

const FieldValue = styled.div`
  overflow-wrap: break-word;
  word-break: break-word;
`;

/**
 * Presentation component for profile custom metadata fields.
 */
export function ProfileFields({ fields, emojis }: ProfileFieldsProps) {
    if (fields.length === 0) return null;

    return (
        <Container>
            {fields.map((field, index) => (
                <FieldRow key={index} $isLast={index === fields.length - 1}>
                    <FieldName>
                        <EmojiText text={field.name} emojis={emojis} />
                    </FieldName>
                    <FieldValue>
                        <EmojiText text={field.value} emojis={emojis} html />
                    </FieldValue>
                </FieldRow>
            ))}
        </Container>
    );
}
