'use client';

import styled from '@emotion/styled';
import { useDeleteStatus } from '@/api';
import { Button } from '@/components/atoms';

interface DeletePostModalProps {
    postId: string;
    onClose: () => void;
}

const Title = styled.div`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  margin-bottom: var(--size-3);
`;

const Message = styled.div`
  font-size: var(--font-size-1);
  color: var(--text-2);
  margin-bottom: var(--size-5);
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
`;

const DeleteButton = styled(Button)`
  background: var(--red-6);
  color: white;
`;

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
            <Title>
                Delete post?
            </Title>
            <Message>
                This action cannot be undone. Your post will be permanently deleted from your profile and the timelines of your followers.
            </Message>
            <ButtonRow>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={deleteStatusMutation.isPending}
                >
                    Cancel
                </Button>
                <DeleteButton
                    onClick={handleDelete}
                    disabled={deleteStatusMutation.isPending}
                    isLoading={deleteStatusMutation.isPending}
                    autoFocus
                >
                    Delete
                </DeleteButton>
            </ButtonRow>
        </div>
    );
}
