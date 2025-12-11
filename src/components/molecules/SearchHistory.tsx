'use client';

import { Clock, X, Search } from 'lucide-react';
import { EmptyState } from '@/components/atoms';

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
    if (history.length === 0) {
        return (
            <EmptyState
                icon={<Search size={48} />}
                title="Search for people, posts, or hashtags"
            />
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--size-3)',
                padding: '0 var(--size-2)'
            }}>
                <h3 style={{
                    fontSize: 'var(--font-size-2)',
                    fontWeight: 'var(--font-weight-6)',
                    color: 'var(--text-2)'
                }}>Recent</h3>
                <button
                    onClick={onClear}
                    style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--blue-6)',
                        fontSize: 'var(--font-size-1)',
                        fontWeight: 'var(--font-weight-6)',
                        cursor: 'pointer'
                    }}
                >
                    Clear all
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                {history.map((term, index) => (
                    <div
                        key={term + index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--size-3)',
                            borderRadius: 'var(--radius-2)',
                            background: 'var(--surface-2)',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                        }}
                        className="recent-search-item"
                        onClick={() => onSelect(term)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
                            <Clock size={16} style={{ color: 'var(--text-3)' }} />
                            <span style={{ color: 'var(--text-1)' }}>{term}</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(term);
                            }}
                            style={{
                                border: 'none',
                                background: 'none',
                                color: 'var(--text-3)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'var(--size-1)',
                                borderRadius: '50%'
                            }}
                            className="recent-search-remove"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
