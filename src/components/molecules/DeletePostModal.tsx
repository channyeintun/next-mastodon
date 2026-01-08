'use client';

import styled from '@emotion/styled';
import { useDeleteStatus } from '@/api';
import { Button } from '@/components/atoms';
import { useTranslations } from 'next-intl';

interface DeletePostModalProps {
    postId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function DeletePostModal({ postId, onClose, onSuccess }: DeletePostModalProps) {
    const deleteStatusMutation = useDeleteStatus();
    const t = useTranslations('deletePost');

    const handleDelete = async () => {
        try {
            await deleteStatusMutation.mutateAsync(postId);
            onClose();
            // Call the success callback if provided (e.g., for navigation)
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    return (
        <div className="dialog-content">
            <Title>
                {t('title')}
            </Title>
            <Message>
                {t('message')}
            </Message>
            <ButtonRow>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={deleteStatusMutation.isPending}
                >
                    {t('cancel')}
                </Button>
                <DeleteButton
                    onClick={handleDelete}
                    disabled={deleteStatusMutation.isPending}
                    isLoading={deleteStatusMutation.isPending}
                    autoFocus
                >
                    {t('delete')}
                </DeleteButton>
            </ButtonRow>
        </div>
    );
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