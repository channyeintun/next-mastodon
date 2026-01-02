'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, List } from 'lucide-react';
import { useLists, useCreateList, useUpdateList, useDeleteList } from '@/api';
import { IconButton } from '@/components/atoms';
import { ListItemSkeleton } from '@/components/molecules';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { ListModalContent, DeleteConfirmModalContent, ListItem } from './ListComponents';
import type { List as ListType, CreateListParams, UpdateListParams } from '@/types';

export default function ListsPage() {
    const router = useRouter();
    const { openModal, closeModal } = useGlobalModal();
    const { data: lists, isLoading } = useLists();
    const createListMutation = useCreateList();
    const updateListMutation = useUpdateList();
    const deleteListMutation = useDeleteList();

    const handleOpenCreateModal = () => {
        openModal(
            <ListModalContent
                onClose={closeModal}
                onSubmit={(params) => {
                    createListMutation.mutate(params as CreateListParams, {
                        onSuccess: () => closeModal(),
                    });
                }}
                isPending={createListMutation.isPending}
            />
        );
    };

    const handleOpenEditModal = (list: ListType) => {
        openModal(
            <ListModalContent
                onClose={closeModal}
                list={list}
                onSubmit={(params) => {
                    updateListMutation.mutate(
                        { id: list.id, params: params as UpdateListParams },
                        { onSuccess: () => closeModal() }
                    );
                }}
                isPending={updateListMutation.isPending}
            />
        );
    };

    const handleOpenDeleteModal = (list: ListType) => {
        openModal(
            <DeleteConfirmModalContent
                onClose={closeModal}
                onConfirm={() => {
                    deleteListMutation.mutate(list.id, {
                        onSuccess: () => closeModal(),
                    });
                }}
                listTitle={list.title}
                isPending={deleteListMutation.isPending}
            />
        );
    };

    return (
        <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto', padding: 0 }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--size-4)', borderBottom: '1px solid var(--surface-3)',
                position: 'sticky', top: 0, background: 'var(--surface-1)', zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                            <List size={22} />
                            Lists
                        </h1>
                        {lists && (
                            <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                                {lists.length} list{lists.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
                <IconButton onClick={handleOpenCreateModal} aria-label="Create new list">
                    <Plus size={20} />
                </IconButton>
            </div>

            {/* Lists */}
            {isLoading ? (
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <ListItemSkeleton key={i} />
                    ))}
                </div>
            ) : lists && lists.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)', padding: 'var(--size-4)' }}>
                    {lists.map((list) => (
                        <ListItem key={list.id} list={list} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                    <List size={48} style={{ opacity: 0.3, marginBottom: 'var(--size-4)' }} />
                    <p>No lists yet</p>
                    <p style={{ fontSize: 'var(--font-size-0)', marginTop: 'var(--size-2)', textAlign: 'center' }}>
                        Lists let you organize the accounts you follow into curated timelines.
                    </p>
                    <button onClick={handleOpenCreateModal} style={{
                        marginTop: 'var(--size-4)', padding: 'var(--size-2) var(--size-4)',
                        background: 'var(--blue-6)', border: 'none', borderRadius: 'var(--radius-2)',
                        color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--size-2)',
                    }}>
                        <Plus size={16} />
                        Create your first list
                    </button>
                </div>
            )}
        </div>
    );
}
