'use client';

import styled from '@emotion/styled';
import { Clock, X, Search } from 'lucide-react';
import { EmptyState } from '@/components/atoms';
import { useTranslations } from 'next-intl';

interface SearchHistoryProps {
    /** List of recent search terms */
    history: string[];
    /** Callback when a search term is selected */
    onSelect: (term: string) => void;
    /** Callback when a search term is removed */
    onRemove: (term: string) => void;
    /** Callback when all history is cleared */
    onClear: () => void;
}

/**
 * SearchHistory - Displays recent search history with remove functionality
 */
export function SearchHistory({
    history,
    onSelect,
    onRemove,
    onClear,
}: SearchHistoryProps) {
    const t = useTranslations('search');
    if (history.length === 0) {
        return (
            <EmptyState
                icon={<Search size={48} />}
                title={t('emptyHistory')}
            />
        );
    }

    return (
        <Container>
            <Header>
                <Title>{t('recent')}</Title>
                <ClearButton onClick={onClear}>
                    {t('clearAll')}
                </ClearButton>
            </Header>
            <HistoryList>
                {history.map((term, index) => (
                    <HistoryItem
                        key={term + index}
                        className="recent-search-item"
                        onClick={() => onSelect(term)}
                    >
                        <HistoryItemContent>
                            <ClockIcon size={16} />
                            <TermText>{term}</TermText>
                        </HistoryItemContent>
                        <RemoveButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(term);
                            }}
                            className="recent-search-remove"
                            aria-label={t('clearAll')}
                        >
                            <X size={16} />
                        </RemoveButton>
                    </HistoryItem>
                ))}
            </HistoryList>
        </Container>
    );
}

// Styled components
const Container = styled.div`
    padding: 0 var(--size-2);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-3);
    padding: 0 var(--size-2);
`;

const Title = styled.h3`
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-6);
    color: var(--text-2);
`;

const ClearButton = styled.button`
    border: none;
    background: none;
    color: var(--blue-6);
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-6);
    cursor: pointer;
`;

const HistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
`;

const HistoryItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-3);
    border-radius: var(--radius-2);
    background: var(--surface-2);
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: var(--surface-3);
    }
`;

const HistoryItemContent = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-3);
`;

const ClockIcon = styled(Clock)`
    color: var(--text-3);
`;

const TermText = styled.span`
    color: var(--text-1);
`;

const RemoveButton = styled.button`
    border: none;
    background: none;
    color: var(--text-3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-1);
    border-radius: 50%;

    &:hover {
        color: var(--text-2);
        background: var(--surface-3);
    }
`;
