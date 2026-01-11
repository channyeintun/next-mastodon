'use client';

import styled from '@emotion/styled';
import { Button } from '@/components/atoms';
import { useTranslations } from 'next-intl';

interface DeleteConversationModalProps {
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isPending: boolean;
}

export function DeleteConversationModal({ onClose, onConfirm, isPending }: DeleteConversationModalProps) {
    const t = useTranslations('conversation');

    return (
        <div className="bottom-sheet-content">
            <Title>
                {t('deleteConfirm')}
            </Title>
            <Message>
                {t('deleteConfirmFull')}
            </Message>
            <ButtonRow>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isPending}
                >
                    {t('cancel')}
                </Button>
                <DeleteButton
                    onClick={onConfirm}
                    disabled={isPending}
                    isLoading={isPending}
                    autoFocus
                >
                    {t('delete')}
                </DeleteButton>
            </ButtonRow>
        </div>
    );
}

const Title = styled.h2`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  margin-bottom: var(--size-3);
`;

const Message = styled.p`
  font-size: var(--font-size-1);
  color: var(--text-2);
  margin-bottom: var(--size-5);
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  align-items: center;
`;

const DeleteButton = styled(Button)`
  background: var(--red-6);
  color: white;
  padding: var(--size-2) var(--size-5);
  border-radius: var(--radius-2);

  &:hover {
    background: var(--red-7);
  }
`;
