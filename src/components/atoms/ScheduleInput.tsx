'use client';

import styled from '@emotion/styled';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ScheduleInputProps {
    value: string;
    onChange: (value: string) => void;
    onRemove: () => void;
}

/**
 * Presentational component for scheduling a post.
 */
export function ScheduleInput({
    value,
    onChange,
    onRemove,
}: ScheduleInputProps) {
    const t = useTranslations('composer');
    return (
        <Container>
            <Header>
                <Label htmlFor="schedule-input">{t('scheduleLabel')}</Label>
                <RemoveButton aria-label={t('removeSchedule')} onClick={onRemove}>
                    <X size={16} />
                </RemoveButton>
            </Header>
            <DateTimeInput
                id="schedule-input"
                type="datetime-local"
                value={value}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => onChange(e.target.value)}
            />
            <HelpText>{t('scheduleHelp')}</HelpText>
        </Container>
    );
}

// Styled components
const Container = styled.div``;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--size-2);
`;

const Label = styled.label`
    font-size: 0.9375rem;
    font-weight: var(--font-weight-6);
    color: var(--text-2);
`;

const RemoveButton = styled.button`
    padding: var(--size-1);
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--text-2);

    &:hover {
        color: var(--text-1);
    }
`;

const DateTimeInput = styled.input`
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-2);
    background: var(--surface-1);
    color: var(--text-1);
    font-size: 0.9375rem;
    
    @media (max-width: 480px) {
        padding: var(--size-2);
        font-size: 0.9375rem;
    }
`;

const HelpText = styled.div`
    font-size: 0.9375rem;
    color: var(--text-3);
    margin-top: 4px;
`;
