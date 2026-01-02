'use client';

import Link from 'next/link';
import { UserPlus, Search, X } from 'lucide-react';
import { IconButton, Spinner } from '@/components/atoms';
import { AccountCardSkeleton } from '@/components/molecules';
import type { Account } from '@/types';

interface AddMembersPanelProps {
    accounts: Account[];
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddMember: (accountId: string) => void;
    isAddPending: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    isLoadingMore: boolean;
}

export function AddMembersPanel({
    accounts,
    isLoading,
    searchQuery,
    onSearchChange,
    onAddMember,
    isAddPending,
    hasMore,
    onLoadMore,
    isLoadingMore,
}: AddMembersPanelProps) {
    return (
        <div style={{ borderBottom: '1px solid var(--surface-3)' }}>
            {/* Search */}
            <div style={{ padding: 'var(--size-4)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--size-2)',
                    padding: 'var(--size-2) var(--size-3)', background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-2)', border: '1px solid var(--surface-3)',
                }}>
                    <Search size={18} color="var(--text-2)" />
                    <input
                        type="text"
                        placeholder="Search people you follow"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{
                            flex: 1, background: 'transparent', border: 'none', outline: 'none',
                            color: 'var(--text-1)', fontSize: 'var(--font-size-1)',
                        }}
                    />
                    {searchQuery && (
                        <IconButton onClick={() => onSearchChange('')} aria-label="Clear search">
                            <X size={16} />
                        </IconButton>
                    )}
                </div>
            </div>

            {/* Available to Add */}
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {isLoading ? (
                    <>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <AccountCardSkeleton key={i} />
                        ))}
                    </>
                ) : accounts.length > 0 ? (
                    accounts.map((account) => (
                        <div key={account.id} style={{
                            display: 'flex', alignItems: 'center',
                            padding: 'var(--size-3) var(--size-4)', borderBottom: '1px solid var(--surface-2)',
                        }}>
                            <Link href={`/@${account.acct}`} style={{
                                flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--size-3)',
                                textDecoration: 'none', color: 'inherit',
                            }}>
                                <img src={account.avatar} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-round)' }} />
                                <div>
                                    <p style={{ fontWeight: 600 }}>{account.display_name || account.username}</p>
                                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>@{account.acct}</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => onAddMember(account.id)}
                                disabled={isAddPending}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--size-2)',
                                    padding: 'var(--size-2) var(--size-3)', background: 'var(--blue-6)',
                                    border: 'none', borderRadius: 'var(--radius-2)', color: 'white',
                                    cursor: 'pointer', fontSize: 'var(--font-size-0)',
                                }}
                            >
                                <UserPlus size={14} />
                                Add
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: 'var(--size-4)', textAlign: 'center', color: 'var(--text-2)' }}>
                        {searchQuery ? 'No results found' : 'All followed accounts are already in this list'}
                    </div>
                )}
                {!searchQuery && hasMore && (
                    <button onClick={onLoadMore} disabled={isLoadingMore} style={{
                        width: '100%', padding: 'var(--size-3)', background: 'transparent',
                        border: 'none', color: 'var(--brand)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--size-2)',
                    }}>
                        {isLoadingMore ? <Spinner size="small" /> : 'Load more'}
                    </button>
                )}
            </div>
        </div>
    );
}

interface MemberItemProps {
    account: Account;
    onRemove: (accountId: string) => void;
    isRemovePending: boolean;
    style?: React.CSSProperties;
}

export function MemberItem({ account, onRemove, isRemovePending, style }: MemberItemProps) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center',
            padding: 'var(--size-3) var(--size-4)', borderBottom: '1px solid var(--surface-2)',
            ...style,
        }}>
            <Link href={`/@${account.acct}`} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--size-3)',
                textDecoration: 'none', color: 'inherit',
            }}>
                <img src={account.avatar} alt="" style={{ width: 48, height: 48, borderRadius: 'var(--radius-round)' }} />
                <div>
                    <p style={{ fontWeight: 600 }}>{account.display_name || account.username}</p>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>@{account.acct}</p>
                </div>
            </Link>
            <button
                onClick={() => onRemove(account.id)}
                disabled={isRemovePending}
                style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--size-2)',
                    padding: 'var(--size-2) var(--size-3)', background: 'transparent',
                    border: '1px solid var(--red)', borderRadius: 'var(--radius-2)',
                    color: 'var(--red)', cursor: 'pointer', fontSize: 'var(--font-size-0)',
                }}
            >
                Remove
            </button>
        </div>
    );
}
