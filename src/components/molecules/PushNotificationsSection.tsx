'use client';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Bell, BellRing, Heart, Repeat2, AtSign, BarChart2 } from 'lucide-react';
import { Card } from '@/components/atoms';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { PushAlerts } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * Push Notifications Settings Section
 * Allows users to enable/disable push notifications and configure alert types
 */
export function PushNotificationsSection() {
    const {
        isSupported,
        permissionState,
        isSubscribed,
        alerts,
        isLoading,
        isSubscribing,
        isUpdating,
        isUnsubscribing,
        error,
        subscribe,
        unsubscribe,
        updateAlerts,
    } = usePushNotifications();
    const t = useTranslations('settings.pushNotifications');

    const [localAlerts, setLocalAlerts] = useState<Partial<PushAlerts>>({
        follow: true,
        favourite: true,
        reblog: true,
        mention: true,
        poll: true,
    });

    // Sync local alerts with server state
    useEffect(() => {
        if (alerts) {
            setLocalAlerts(alerts);
        }
    }, [alerts]);

    const handleToggle = async () => {
        try {
            if (isSubscribed) {
                await unsubscribe();
            } else {
                await subscribe(localAlerts);
            }
        } catch (err) {
            console.error('Push notification toggle failed:', err);
        }
    };

    const handleAlertChange = async (key: keyof PushAlerts, value: boolean) => {
        const newAlerts = { ...localAlerts, [key]: value };
        setLocalAlerts(newAlerts);
        if (isSubscribed) {
            try {
                await updateAlerts(newAlerts);
            } catch (err) {
                console.error('Push notification update failed:', err);
            }
        }
    };

    if (!isSupported) {
        return (
            <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                <PushHeader>
                    <PushIcon $disabled>
                        <BellRing size={20} />
                    </PushIcon>
                    <PushText>
                        <PushTitle>{t('title')}</PushTitle>
                        <PushDescription>{t('notSupported')}</PushDescription>
                    </PushText>
                </PushHeader>
            </Card>
        );
    }

    if (permissionState === 'denied') {
        return (
            <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                <PushHeader>
                    <PushIcon $disabled>
                        <BellRing size={20} />
                    </PushIcon>
                    <PushText>
                        <PushTitle>{t('title')}</PushTitle>
                        <PushDescription>{t('permissionDenied')}</PushDescription>
                    </PushText>
                </PushHeader>
            </Card>
        );
    }

    const alertOptions = [
        { key: 'mention' as const, label: t('mentions'), icon: <AtSign size={16} /> },
        { key: 'favourite' as const, label: t('favorites'), icon: <Heart size={16} /> },
        { key: 'reblog' as const, label: t('boosts'), icon: <Repeat2 size={16} /> },
        { key: 'follow' as const, label: t('follows'), icon: <Bell size={16} /> },
        { key: 'poll' as const, label: t('polls'), icon: <BarChart2 size={16} /> },
    ];

    return (
        <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
            <PushHeader>
                <PushIcon $disabled={false}>
                    <BellRing size={20} />
                </PushIcon>
                <PushText>
                    <PushTitle>{t('title')}</PushTitle>
                    <PushDescription>
                        {isSubscribed ? t('enabled') : t('disabled')}
                    </PushDescription>
                </PushText>
                <PushToggle>
                    <Switch
                        checked={isSubscribed}
                        onClick={handleToggle}
                        disabled={isLoading || isSubscribing || isUnsubscribing}
                        aria-label={isSubscribed ? t('disableLabel') : t('enableLabel')}
                    />
                </PushToggle>
            </PushHeader>

            {error && (
                <ErrorMessage>{error.message}</ErrorMessage>
            )}

            {isSubscribed && (
                <AlertsSection>
                    <AlertsSectionTitle>{t('alertTypes')}</AlertsSectionTitle>
                    {alertOptions.map(option => (
                        <AlertRow key={option.key}>
                            <AlertInfo>
                                <AlertIcon>{option.icon}</AlertIcon>
                                <AlertLabel>{option.label}</AlertLabel>
                            </AlertInfo>
                            <AlertCheckbox
                                type="checkbox"
                                checked={localAlerts[option.key] ?? true}
                                onChange={(e) => handleAlertChange(option.key, e.target.checked)}
                                disabled={isUpdating}
                            />
                        </AlertRow>
                    ))}
                </AlertsSection>
            )}
        </Card>
    );
}

// Styled components
const PushHeader = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-3);
`;

const PushIcon = styled.div<{ $disabled: boolean }>`
    color: ${props => props.$disabled ? 'var(--text-3)' : 'var(--blue-7)'};
    flex-shrink: 0;
`;

const PushText = styled.div`
    flex: 1;
    min-width: 0;
`;

const PushTitle = styled.div`
    font-weight: var(--font-weight-6);
    color: var(--text-1);
    margin-bottom: var(--size-1);
`;

const PushDescription = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-2);
`;

const PushToggle = styled.div`
    flex-shrink: 0;
`;

const Switch = styled.button<{ checked: boolean; disabled?: boolean }>`
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    background-color: ${props => props.checked ? 'var(--blue-6)' : 'var(--surface-4)'};
    
    &::after {
        content: '';
        position: absolute;
        top: 2px;
        left: ${props => props.checked ? '22px' : '2px'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: left 0.2s ease;
    }

    &:hover:not(:disabled) {
        background-color: ${props => props.checked ? 'var(--blue-7)' : 'var(--surface-5)'};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    margin-top: var(--size-2);
    padding: var(--size-2);
    background: var(--red-2);
    color: var(--red-9);
    border-radius: var(--radius-2);
    font-size: var(--font-size-0);
`;

const AlertsSection = styled.div`
    margin-top: var(--size-4);
    padding-top: var(--size-3);
    border-top: 1px solid var(--surface-3);
`;

const AlertsSectionTitle = styled.div`
    font-size: var(--font-size-0);
    font-weight: var(--font-weight-6);
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--size-2);
`;

const AlertRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-2) 0;
`;

const AlertInfo = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-2);
`;

const AlertIcon = styled.div`
    color: var(--text-2);
`;

const AlertLabel = styled.div`
    font-size: var(--font-size-1);
    color: var(--text-1);
`;

const AlertCheckbox = styled.input`
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--blue-6);

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
