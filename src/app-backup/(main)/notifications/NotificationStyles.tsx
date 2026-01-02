'use client';

import styled from '@emotion/styled';
import Link from 'next/link';

// Shared styled components for Notifications pages

export const NotificationHeaderContainer = styled.div`
    background: var(--surface-1);
    z-index: 10;
    padding: var(--size-4) var(--size-4) 0;
    flex-shrink: 0;
`;

export const NotificationTitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const NotificationSettingsToggle = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-2);
    background: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    color: var(--text-2);
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
        color: var(--brand);
    }

    &:focus {
        outline: none;
    }
`;

export const NotificationSettingsPanelWrapper = styled.div<{ $isOpen: boolean }>`
    display: grid;
    grid-template-rows: ${props => props.$isOpen ? '1fr' : '0fr'};
    transition: grid-template-rows 300ms ease;
`;

export const NotificationSettingsPanel = styled.div`
    overflow: hidden;
`;

export const NotificationSettingsPanelContent = styled.div`
    background: var(--surface-2);
    border-bottom: 1px solid var(--surface-3);
    padding: var(--size-3) var(--size-4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const NotificationSettingsSectionTitle = styled.div`
    font-size: var(--font-size-0);
    font-weight: var(--font-weight-6);
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--size-2);
`;

export const NotificationActionsRow = styled.div`
    display: flex;
    gap: var(--size-2);
    flex-wrap: wrap;
`;

export const NotificationFilterRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--size-3);
    padding: var(--size-2) 0;
    border-bottom: 1px solid var(--surface-3);

    &:last-child {
        border-bottom: none;
    }
`;

export const NotificationFilterLabel = styled.div`
    font-size: var(--font-size-1);
    color: var(--text-1);
`;

export const NotificationFilterSelect = styled.select`
    padding: var(--size-1) var(--size-2);
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-1);
    background: var(--surface-1);
    color: var(--text-1);
    font-size: var(--font-size-0);
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const NotificationFilterToggle = styled.input`
    width: 18px;
    height: 18px;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const NotificationPendingLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: var(--size-2);
    padding: var(--size-2) var(--size-3);
    margin-top: var(--size-3);
    background: var(--blue-2);
    border-radius: var(--radius-2);
    color: var(--blue-9);
    text-decoration: none;
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);

    &:hover {
        background: var(--blue-3);
    }
`;
