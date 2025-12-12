'use client';

import styled from '@emotion/styled';
import { X } from 'lucide-react';

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
    return (
        <Container>
            <Header>
                <Label htmlFor="schedule-input">Schedule post</Label>
                <RemoveButton aria-label="Remove schedule" onClick={onRemove}>
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
            <HelpText>Post will be published automatically at this time.</HelpText>
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
    font-size: var(--font-size-1);
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
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-2);
    background: var(--surface-1);
    color: var(--text-1);
    font-size: var(--font-size-2);
`;

const HelpText = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-3);
    margin-top: 4px;
`;
