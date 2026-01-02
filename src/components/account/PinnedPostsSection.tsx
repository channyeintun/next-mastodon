'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pin } from 'lucide-react';
import { PostCard } from '@/components/organisms';
import type { Status } from '@/types';

interface PinnedPostsSectionProps {
    pinnedStatuses: Status[];
}

/**
 * Displays pinned posts one at a time with navigation controls.
 * Shown above the tabs section on profile pages.
 */
export function PinnedPostsSection({ pinnedStatuses }: PinnedPostsSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!pinnedStatuses || pinnedStatuses.length === 0) {
        return null;
    }

    const hasMultiple = pinnedStatuses.length > 1;
    const currentPost = pinnedStatuses[currentIndex];

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? pinnedStatuses.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === pinnedStatuses.length - 1 ? 0 : prev + 1));
    };

    return (
        <Container>
            <Header>
                <PinnedBadge>
                    <Pin size={14} />
                    Pinned
                </PinnedBadge>
                {hasMultiple && (
                    <Navigation>
                        <NavButton onClick={goToPrevious} aria-label="Previous pinned post">
                            <ChevronLeft size={18} />
                        </NavButton>
                        <Counter>
                            {currentIndex + 1} / {pinnedStatuses.length}
                        </Counter>
                        <NavButton onClick={goToNext} aria-label="Next pinned post">
                            <ChevronRight size={18} />
                        </NavButton>
                    </Navigation>
                )}
            </Header>
            <PostCard status={currentPost} />
        </Container>
    );
}

// ============================================================================
// Styled Components
// ============================================================================

const Container = styled.section`
  border-bottom: 1px solid var(--surface-3);
  padding-bottom: var(--size-3);
  margin-bottom: var(--size-2);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--size-2) var(--size-4);
`;

const PinnedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-1) var(--size-2);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Navigation = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-1);
  background: var(--surface-2);
  border: none;
  border-radius: var(--radius-2);
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Counter = styled.span`
  font-size: var(--font-size-0);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
  text-align: center;
`;
