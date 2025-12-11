'use client';

import styled from '@emotion/styled';
import { X } from 'lucide-react';

// Styled components
const Container = styled.div`
    margin-bottom: var(--size-2);
`;

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

const Input = styled.input`
    width: 100%;
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-2);
    background: var(--surface-1);
    color: var(--text-1);
    font-size: var(--font-size-2);
`;

interface ContentWarningInputProps {
    value: string;
    onChange: (value: string) => void;
    onRemove: () => void;
}

/**
 * Presentational component for content warning/spoiler input.
 */
export function ContentWarningInput({
    value,
    onChange,
    onRemove,
}: ContentWarningInputProps) {
    return (
        <Container>
            <Header>
                <Label htmlFor="cw-input">Content Warning</Label>
                <RemoveButton aria-label="Remove content warning" onClick={onRemove}>
                    <X size={16} />
                </RemoveButton>
            </Header>
            <Input
                id="cw-input"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write your warning here..."
            />
        </Container>
    );
}
