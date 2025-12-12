'use client';

import styled from '@emotion/styled';

interface ProfileField {
    name: string;
    value: string;
    verified_at?: string | null;
}

interface ProfileFieldsProps {
    fields: ProfileField[];
}

const Container = styled.div`
  margin-bottom: var(--size-3);
`;

const FieldRow = styled.div<{ $isLast: boolean }>`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: var(--size-2);
  padding: var(--size-2) 0;
  border-bottom: ${({ $isLast }) => ($isLast ? 'none' : '1px solid var(--surface-3)')};
  font-size: var(--font-size-1);
`;

const FieldName = styled.div`
  font-weight: var(--font-weight-6);
  color: var(--text-2);
`;

const FieldValue = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Presentation component for profile custom metadata fields.
 */
export function ProfileFields({ fields }: ProfileFieldsProps) {
    if (fields.length === 0) return null;

    return (
        <Container>
            {fields.map((field, index) => (
                <FieldRow key={index} $isLast={index === fields.length - 1}>
                    <FieldName>
                        {field.name}
                    </FieldName>
                    <FieldValue
                        dangerouslySetInnerHTML={{ __html: field.value }}
                    />
                </FieldRow>
            ))}
        </Container>
    );
}
