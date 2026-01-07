'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import { IconButton } from '@/components/atoms';
import { PushNotificationsSection } from '@/components/molecules/PushNotificationsSection';
import { useAuthStore } from '@/hooks/useStores';
import { useTranslations } from 'next-intl';
import {
    Header,
    Description,
} from './styles';

export default function NotificationSettingsPage() {
    const router = useRouter();
    const authStore = useAuthStore();
    const t = useTranslations('settings.pushNotifications');

    useEffect(() => {
        if (!authStore.isAuthenticated) {
            router.push('/');
        }
    }, [authStore.isAuthenticated, router]);

    if (!authStore.isAuthenticated) return null;

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
            <Header>
                <IconButton onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft size={20} />
                </IconButton>
                <h1><Bell size={24} />{t('title')}</h1>
            </Header>

            <Description>
                {t('description')}
            </Description>

            <PushNotificationsSection />
        </div>
    );
}
