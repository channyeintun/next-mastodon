'use client';

import styled from '@emotion/styled';

interface ProfileBioProps {
    note: string;
}

const BioContainer = styled.div`
  margin-bottom: var(--size-3);
  line-height: 1.5;
  color: var(--text-1);
`;

/**
 * Presentation component for profile bio/note.
 * Renders HTML content with emoji support.
 */
export function ProfileBio({ note }: ProfileBioProps) {
    if (!note) return null;

    return (
        <BioContainer
            dangerouslySetInnerHTML={{ __html: note }}
        />
    );
}
