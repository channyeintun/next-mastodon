'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, List, UserPlus, UserMinus, Search, X } from 'lucide-react';
import { useList, useListAccounts, useInfiniteFollowing, useCurrentAccount, useSearch } from '@/api/queries';
import { useAddAccountsToList, useRemoveAccountsFromList } from '@/api/mutations';
import { IconButton } from '@/components/atoms/IconButton';
import { Spinner } from '@/components/atoms/Spinner';
import { AccountCard, AccountCardSkeleton } from '@/components/molecules/AccountCard';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import type { Account } from '@/types/mastodon';

export default function ListMembersPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const listId = resolvedParams.id;

    const { data: list, isLoading: isLoadingList } = useList(listId);
    const {
        data: membersPages,
        isLoading: isLoadingMembers,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useListAccounts(listId);
    const { data: currentAccount } = useCurrentAccount();

    const [showAddMembers, setShowAddMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const members = membersPages?.pages.flatMap((page) => page) ?? [];
    const memberIds = new Set(members.map((m) => m.id));

    // Get following list for adding members
    const {
        data: followingPages,
        isLoading: isLoadingFollowing,
        fetchNextPage: fetchNextFollowing,
        hasNextPage: hasNextFollowing,
        isFetchingNextPage: isFetchingNextFollowing,
    } = useInfiniteFollowing(currentAccount?.id || '');

    // Search functionality
    const { data: searchResults, isLoading: isSearching } = useSearch({
        q: searchQuery,
        type: 'accounts',
        following: true,
        limit: 20,
    });

    const addMembersMutation = useAddAccountsToList();
    const removeMembersMutation = useRemoveAccountsFromList();

    const following = followingPages?.pages.flatMap((page) => page) ?? [];
    const availableToAdd = searchQuery
        ? (searchResults?.accounts || []).filter((a) => !memberIds.has(a.id))
        : following.filter((a) => !memberIds.has(a.id));

    const handleAddMember = (accountId: string) => {
        addMembersMutation.mutate({ listId, accountIds: [accountId] });
    };

    const handleRemoveMember = (accountId: string) => {
        removeMembersMutation.mutate({ listId, accountIds: [accountId] });
    };

    if (isLoadingList) {
        return (
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-3)',
                        padding: 'var(--size-4)',
                        borderBottom: '1px solid var(--surface-3)',
                    }}
                >
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div>
                        <div className="skeleton" style={{ width: 150, height: 20, marginBottom: 4 }} />
                        <div className="skeleton" style={{ width: 100, height: 14 }} />
                    </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <AccountCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!list) {
        return (
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-3)',
                        padding: 'var(--size-4)',
                        borderBottom: '1px solid var(--surface-3)',
                    }}
                >
                    <Link href="/lists">
                        <IconButton>
                            <ArrowLeft size={20} />
                        </IconButton>
                    </Link>
                    <h1 style={{ fontSize: 'var(--font-size-4)' }}>List not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--size-4)',
                    borderBottom: '1px solid var(--surface-3)',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--surface-1)',
                    zIndex: 10,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
                    <Link href={`/lists/${listId}`}>
                        <IconButton>
                            <ArrowLeft size={20} />
                        </IconButton>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                            <List size={20} />
                            {list.title}
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {members.length} member{members.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <IconButton
                    onClick={() => setShowAddMembers(!showAddMembers)}
                    aria-label={showAddMembers ? 'Close' : 'Add members'}
                    style={{
                        background: showAddMembers ? 'var(--brand)' : undefined,
                        color: showAddMembers ? 'white' : undefined,
                    }}
                >
                    {showAddMembers ? <X size={20} /> : <UserPlus size={20} />}
                </IconButton>
            </div>

            {/* Add Members Panel */}
            {showAddMembers && (
                <div style={{ borderBottom: '1px solid var(--surface-3)' }}>
                    {/* Search */}
                    <div style={{ padding: 'var(--size-4)' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--size-2)',
                                padding: 'var(--size-2) var(--size-3)',
                                background: 'var(--surface-2)',
                                borderRadius: 'var(--radius-2)',
                                border: '1px solid var(--surface-3)',
                            }}
                        >
                            <Search size={18} color="var(--text-2)" />
                            <input
                                type="text"
                                placeholder="Search people you follow"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'var(--text-1)',
                                    fontSize: 'var(--font-size-1)',
                                }}
                            />
                            {searchQuery && (
                                <IconButton onClick={() => setSearchQuery('')} aria-label="Clear search">
                                    <X size={16} />
                                </IconButton>
                            )}
                        </div>
                    </div>

                    {/* Available to Add */}
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {isLoadingFollowing || isSearching ? (
                            <>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <AccountCardSkeleton key={i} />
                                ))}
                            </>
                        ) : availableToAdd.length > 0 ? (
                            availableToAdd.map((account) => (
                                <div
                                    key={account.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 'var(--size-3) var(--size-4)',
                                        borderBottom: '1px solid var(--surface-2)',
                                    }}
                                >
                                    <Link
                                        href={`/@${account.acct}`}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--size-3)',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                        }}
                                    >
                                        <img
                                            src={account.avatar}
                                            alt=""
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 'var(--radius-round)',
                                            }}
                                        />
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{account.display_name || account.username}</p>
                                            <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                                @{account.acct}
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleAddMember(account.id)}
                                        disabled={addMembersMutation.isPending}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--size-2)',
                                            padding: 'var(--size-2) var(--size-3)',
                                            background: 'var(--brand)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-2)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: 'var(--font-size-0)',
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
                        {!searchQuery && hasNextFollowing && (
                            <button
                                onClick={() => fetchNextFollowing()}
                                disabled={isFetchingNextFollowing}
                                style={{
                                    width: '100%',
                                    padding: 'var(--size-3)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--brand)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 'var(--size-2)',
                                }}
                            >
                                {isFetchingNextFollowing ? <Spinner size="small" /> : 'Load more'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Current Members */}
            {isLoadingMembers ? (
                <>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <AccountCardSkeleton key={i} />
                    ))}
                </>
            ) : members.length > 0 ? (
                <VirtualizedList
                    items={members}
                    renderItem={(account: Account) => (
                        <div
                            key={account.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: 'var(--size-3) var(--size-4)',
                                borderBottom: '1px solid var(--surface-2)',
                            }}
                        >
                            <Link
                                href={`/@${account.acct}`}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--size-3)',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <img
                                    src={account.avatar}
                                    alt=""
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 'var(--radius-round)',
                                    }}
                                />
                                <div>
                                    <p style={{ fontWeight: 600 }}>{account.display_name || account.username}</p>
                                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                        @{account.acct}
                                    </p>
                                </div>
                            </Link>
                            <button
                                onClick={() => handleRemoveMember(account.id)}
                                disabled={removeMembersMutation.isPending}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--size-2)',
                                    padding: 'var(--size-2) var(--size-3)',
                                    background: 'transparent',
                                    border: '1px solid var(--red)',
                                    borderRadius: 'var(--radius-2)',
                                    color: 'var(--red)',
                                    cursor: 'pointer',
                                    fontSize: 'var(--font-size-0)',
                                }}
                            >
                                <UserMinus size={14} />
                                Remove
                            </button>
                        </div>
                    )}
                    getItemKey={(account) => account.id}
                    estimateSize={72}
                    overscan={3}
                    onLoadMore={() => fetchNextPage()}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={!!hasNextPage}
                    height="calc(100vh - 200px)"
                    loadingIndicator={
                        <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-4)' }}>
                            <Spinner />
                        </div>
                    }
                    emptyState={null}
                />
            ) : (
                <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                    <List size={48} style={{ opacity: 0.3, marginBottom: 'var(--size-4)' }} />
                    <p>No members yet</p>
                    <p style={{ fontSize: 'var(--font-size-0)', marginTop: 'var(--size-2)', textAlign: 'center' }}>
                        Click the + button above to add people you follow to this list.
                    </p>
                </div>
            )}
        </div>
    );
}
