'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, List, UserPlus, X } from 'lucide-react';
import { useList, useListAccounts, useInfiniteFollowing, useCurrentAccount, useSearch, useAddAccountsToList, useRemoveAccountsFromList } from '@/api';
import { IconButton, Spinner } from '@/components/atoms';
import { AccountCardSkeleton, PageHeaderSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { flattenPages } from '@/utils/fp';
import { AddMembersPanel, MemberItem } from './MemberComponents';
import type { Account } from '@/types';

export default function ListMembersPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const listId = resolvedParams.id;

    const { data: list, isLoading: isLoadingList } = useList(listId);
    const { data: membersPages, isLoading: isLoadingMembers, fetchNextPage, hasNextPage, isFetchingNextPage } = useListAccounts(listId);
    const { data: currentAccount } = useCurrentAccount();

    const [showAddMembers, setShowAddMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const members = flattenPages(membersPages?.pages);
    const memberIds = new Set(members.map((m) => m.id));

    const { data: followingPages, isLoading: isLoadingFollowing, fetchNextPage: fetchNextFollowing, hasNextPage: hasNextFollowing, isFetchingNextPage: isFetchingNextFollowing } = useInfiniteFollowing(currentAccount?.id || '');
    const { data: searchResults, isLoading: isSearching } = useSearch({ q: searchQuery, type: 'accounts', following: true, limit: 20 });

    const addMembersMutation = useAddAccountsToList();
    const removeMembersMutation = useRemoveAccountsFromList();

    const following = flattenPages(followingPages?.pages);
    const availableToAdd = searchQuery
        ? (searchResults?.data.accounts || []).filter((a) => !memberIds.has(a.id))
        : following.filter((a) => !memberIds.has(a.id));

    const handleAddMember = (accountId: string) => addMembersMutation.mutate({ listId, accountIds: [accountId] });
    const handleRemoveMember = (accountId: string) => removeMembersMutation.mutate({ listId, accountIds: [accountId] });

    if (isLoadingList) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <PageHeaderSkeleton titleWidth={150} subtitleWidth={100} />
                {Array.from({ length: 5 }).map((_, i) => <AccountCardSkeleton key={i} />)}
            </div>
        );
    }

    if (!list) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', padding: 'var(--size-4)', borderBottom: '1px solid var(--surface-3)' }}>
                    <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                    <h1 style={{ fontSize: 'var(--font-size-4)' }}>List not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--size-4)', borderBottom: '1px solid var(--surface-3)',
                position: 'sticky', top: 0, background: 'var(--surface-1)', zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
                    <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                            <List size={20} />{list.title}
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {members.length} member{members.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <IconButton
                    onClick={() => setShowAddMembers(!showAddMembers)}
                    aria-label={showAddMembers ? 'Close' : 'Add members'}
                    style={{ background: showAddMembers ? 'var(--blue-6)' : undefined, color: showAddMembers ? 'white' : undefined }}
                >
                    {showAddMembers ? <X size={20} /> : <UserPlus size={20} />}
                </IconButton>
            </div>

            {showAddMembers && (
                <AddMembersPanel
                    accounts={availableToAdd}
                    isLoading={isLoadingFollowing || isSearching}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddMember={handleAddMember}
                    isAddPending={addMembersMutation.isPending}
                    hasMore={!!hasNextFollowing}
                    onLoadMore={fetchNextFollowing}
                    isLoadingMore={isFetchingNextFollowing}
                />
            )}

            {/* Current Members */}
            {isLoadingMembers ? (
                <>{Array.from({ length: 5 }).map((_, i) => <AccountCardSkeleton key={i} />)}</>
            ) : members.length > 0 ? (
                <VirtualizedList<Account>
                    items={members}
                    renderItem={(account) => (
                        <MemberItem account={account} onRemove={handleRemoveMember} isRemovePending={removeMembersMutation.isPending} style={{ marginBottom: 'var(--size-2)' }} />
                    )}
                    getItemKey={(account) => account.id}
                    estimateSize={72}
                    onLoadMore={() => fetchNextPage()}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={!!hasNextPage}
                    height="calc(100dvh - 200px)"
                    loadingIndicator={<div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-4)' }}><Spinner /></div>}
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
