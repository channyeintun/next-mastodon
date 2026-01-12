'use client';

import styled from '@emotion/styled';
import { Button } from '@/components/atoms';
import { useTranslations } from 'next-intl';

interface SaveDraftConfirmationModalProps {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function SaveDraftConfirmationModal({ onSave, onDiscard, onCancel: _onCancel }: SaveDraftConfirmationModalProps) {
  const t = useTranslations('composer.saveDraft');

  return (
    <div className="bottom-sheet-content">
      <Title>{t('title')}</Title>
      <Message>{t('message')}</Message>
      <ButtonRow>
        <Button variant="ghost" onMouseDown={onDiscard}>
          {t('discard')}
        </Button>
        <SaveButton onMouseDown={onSave} autoFocus>
          {t('save')}
        </SaveButton>
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

const SaveButton = styled(Button)`
  background: var(--blue-6);
  color: white;
  padding: var(--size-2) var(--size-5);
  border-radius: var(--radius-2);

  &:hover {
    background: var(--blue-7);
    opacity: 0.9;
  }
`;
