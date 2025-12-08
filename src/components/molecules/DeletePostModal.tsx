'use client';

import { useDeleteStatus } from '@/api/mutations';
import { Button } from '@/components/atoms/Button';

interface DeletePostModalProps {
    postId: string;
    onClose: () => void;
}

export function DeletePostModal({ postId, onClose }: DeletePostModalProps) {
    const deleteStatusMutation = useDeleteStatus();

    const handleDelete = async () => {
        try {
            await deleteStatusMutation.mutateAsync(postId);
            onClose();
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    return (
        <div className="dialog-content">
            <div style={{
                fontSize: 'var(--font-size-3)',
                fontWeight: 'var(--font-weight-6)',
                color: 'var(--text-1)',
                marginBottom: 'var(--size-3)',
            }}>
                Delete post?
            </div>
            <div style={{
                fontSize: 'var(--font-size-1)',
                color: 'var(--text-2)',
                marginBottom: 'var(--size-5)',
                lineHeight: '1.5',
            }}>
                This action cannot be undone. Your post will be permanently deleted from your profile and the timelines of your followers.
            </div>
            <div style={{
                display: 'flex',
                gap: 'var(--size-3)',
                justifyContent: 'flex-end',
            }}>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={deleteStatusMutation.isPending}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleDelete}
                    disabled={deleteStatusMutation.isPending}
                    isLoading={deleteStatusMutation.isPending}
                    autoFocus
                    style={{
                        background: 'var(--red-6)',
                        color: 'white',
                    }}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}
