'use client';

import styled from '@emotion/styled';
import { Button } from '@/components/atoms';
import { useTranslations } from 'next-intl';

interface LogoutConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isPending: boolean;
}

export function LogoutConfirmationModal({ onClose, onConfirm, isPending }: LogoutConfirmationModalProps) {
    const t = useTranslations('settings.logoutConfirm');

    return (
        <div className="bottom-sheet-content">
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
                    disabled={isPending}
                >
                    {t('cancel')}
                </Button>
                <LogoutButton
                    onClick={onConfirm}
                    disabled={isPending}
                    isLoading={isPending}
                    autoFocus
                >
                    {t('logout')}
                </LogoutButton>
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

const LogoutButton = styled(Button)`
  background: var(--red-6);
  color: white;
  padding: var(--size-2) var(--size-5);
  border-radius: var(--radius-2);

  &:hover {
    background: var(--red-7);
  }
`;
