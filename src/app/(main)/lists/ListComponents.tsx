'use client';

import { useState } from 'react';
import Link from 'next/link';
import { List, MoreVertical, Pencil, Trash2, Users, MessageCircle } from 'lucide-react';
import { IconButton, Spinner } from '@/components/atoms';
import type { List as ListType, ListRepliesPolicy, CreateListParams, UpdateListParams } from '@/types';

interface ListModalContentProps {
    onClose: () => void;
    list?: ListType;
    onSubmit: (params: CreateListParams | UpdateListParams) => void;
    isPending: boolean;
}

export function ListModalContent({ onClose, list, onSubmit, isPending }: ListModalContentProps) {
    const [title, setTitle] = useState(list?.title || '');
    const [repliesPolicy, setRepliesPolicy] = useState<ListRepliesPolicy>(list?.replies_policy || 'list');
    const [exclusive, setExclusive] = useState(list?.exclusive || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({ title: title.trim(), replies_policy: repliesPolicy, exclusive });
    };

    return (
        <div style={{ maxWidth: '400px', width: '90vw' }}>
            <div className="dialog-header">
                <h2 style={{ fontSize: 'var(--font-size-4)', margin: 0 }}>
                    {list ? 'Edit List' : 'Create list'}
                </h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="dialog-body">
                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label htmlFor="list-title" style={{ display: 'block', marginBottom: 'var(--size-2)', fontSize: 'var(--font-size-1)', color: 'var(--text-2)' }}>
                            List Name
                        </label>
                        <input
                            id="list-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My List"
                            autoFocus
                            style={{ width: '100%', padding: 'var(--size-3)', background: 'var(--surface-3)', border: '1px solid var(--surface-4)', borderRadius: 'var(--radius-2)', color: 'var(--text-1)', fontSize: 'var(--font-size-2)' }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--size-4)' }}>
                        <label htmlFor="replies-policy" style={{ display: 'block', marginBottom: 'var(--size-2)', fontSize: 'var(--font-size-1)', color: 'var(--text-2)' }}>
                            Show replies to
                        </label>
                        <select
                            id="replies-policy"
                            value={repliesPolicy}
                            onChange={(e) => setRepliesPolicy(e.target.value as ListRepliesPolicy)}
                            style={{ width: '100%', padding: 'var(--size-3)', background: 'var(--surface-3)', border: '1px solid var(--surface-4)', borderRadius: 'var(--radius-2)', color: 'var(--text-1)', fontSize: 'var(--font-size-2)' }}
                        >
                            <option value="list">Members of the list</option>
                            <option value="followed">Any followed user</option>
                            <option value="none">No one</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)', fontSize: 'var(--font-size-1)', color: 'var(--text-2)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={exclusive} onChange={(e) => setExclusive(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--brand)' }} />
                            Hide these posts from home
                        </label>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-3)', marginTop: 'var(--size-1)', marginLeft: 'var(--size-5)' }}>
                            Posts from list members won&apos;t appear in your home timeline
                        </p>
                    </div>
                </div>

                <div className="dialog-footer">
                    <button type="button" onClick={onClose} disabled={isPending} style={{ padding: 'var(--size-2) var(--size-4)', background: 'transparent', border: '1px solid var(--surface-4)', borderRadius: 'var(--radius-2)', color: 'var(--text-2)', cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={!title.trim() || isPending} style={{ padding: 'var(--size-2) var(--size-4)', background: 'var(--blue-6)', border: 'none', borderRadius: 'var(--radius-2)', color: 'white', cursor: 'pointer', opacity: !title.trim() || isPending ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                        {isPending && <Spinner size="small" />}
                        {list ? 'Save' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}

interface DeleteConfirmModalContentProps {
    onClose: () => void;
    onConfirm: () => void;
    listTitle: string;
    isPending: boolean;
}

export function DeleteConfirmModalContent({ onClose, onConfirm, listTitle, isPending }: DeleteConfirmModalContentProps) {
    return (
        <div style={{ maxWidth: '400px', width: '90vw' }}>
            <div className="dialog-header">
                <h2 style={{ fontSize: 'var(--font-size-4)', margin: 0 }}>Delete list</h2>
            </div>
            <div className="dialog-body">
                <p style={{ color: 'var(--text-2)', margin: 0 }}>
                    Are you sure you want to delete &quot;{listTitle}&quot;? This action cannot be undone.
                </p>
            </div>
            <div className="dialog-footer">
                <button type="button" onClick={onClose} disabled={isPending} style={{ padding: 'var(--size-2) var(--size-4)', background: 'transparent', border: '1px solid var(--surface-4)', borderRadius: 'var(--radius-2)', color: 'var(--text-2)', cursor: 'pointer' }}>
                    Cancel
                </button>
                <button type="button" onClick={onConfirm} disabled={isPending} autoFocus style={{ padding: 'var(--size-2) var(--size-4)', background: 'var(--red-6)', border: 'none', borderRadius: 'var(--radius-2)', color: 'white', cursor: 'pointer', opacity: isPending ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                    {isPending && <Spinner size="small" />}
                    Delete
                </button>
            </div>
        </div>
    );
}

interface ListItemProps {
    list: ListType;
    onEdit: (list: ListType) => void;
    onDelete: (list: ListType) => void;
}

const repliesPolicyLabels: Record<ListRepliesPolicy, string> = {
    followed: 'Replies to followed users',
    list: 'Replies to list members',
    none: 'No replies',
};

export function ListItem({ list, onEdit, onDelete }: ListItemProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--size-4)', gap: 'var(--size-3)', background: 'var(--surface-2)', borderRadius: 'var(--radius-3)' }}>
            <Link href={`/lists/${list.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--size-3)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-2)', background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%)', display: 'grid', placeItems: 'center' }}>
                    <List size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 'var(--font-size-2)', fontWeight: 600, marginBottom: 'var(--size-1)' }}>{list.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)', fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                        <MessageCircle size={12} />
                        <span>{repliesPolicyLabels[list.replies_policy]}</span>
                        {list.exclusive && (<><span>•</span><span>Exclusive</span></>)}
                    </div>
                </div>
            </Link>

            <div style={{ position: 'relative' }}>
                <IconButton onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }} aria-label="List options">
                    <MoreVertical size={18} />
                </IconButton>

                {showMenu && (
                    <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMenu(false)} />
                        <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--surface-2)', border: '1px solid var(--surface-3)', borderRadius: 'var(--radius-2)', boxShadow: 'var(--shadow-4)', minWidth: 150, zIndex: 50, overflow: 'hidden' }}>
                            <button onClick={() => { setShowMenu(false); onEdit(list); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)', width: '100%', padding: 'var(--size-3) var(--size-4)', background: 'transparent', border: 'none', color: 'var(--text-1)', fontSize: 'var(--font-size-1)', cursor: 'pointer', textAlign: 'left' }}>
                                <Pencil size={16} /> Edit list
                            </button>
                            <Link href={`/lists/${list.id}/members`} onClick={() => setShowMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)', width: '100%', padding: 'var(--size-3) var(--size-4)', background: 'transparent', border: 'none', color: 'var(--text-1)', fontSize: 'var(--font-size-1)', cursor: 'pointer', textAlign: 'left', textDecoration: 'none' }}>
                                <Users size={16} /> Manage members
                            </Link>
                            <button onClick={() => { setShowMenu(false); onDelete(list); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)', width: '100%', padding: 'var(--size-3) var(--size-4)', background: 'transparent', border: 'none', color: 'var(--red)', fontSize: 'var(--font-size-1)', cursor: 'pointer', textAlign: 'left' }}>
                                <Trash2 size={16} /> Delete list
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
