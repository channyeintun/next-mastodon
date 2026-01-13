'use client';

import { usePathname } from 'next/navigation';
import { Home, PenSquare, Bell, Settings, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUnreadNotificationCount } from '@/api';
import { observer } from 'mobx-react-lite';
import { LiquidGlassBottomNav } from './LiquidGlassBottomNav';

interface BottomNavigationProps {
    isAuthenticated: boolean;
}

export const BottomNavigation = observer(({ isAuthenticated }: BottomNavigationProps) => {
    const pathname = usePathname();
    const t = useTranslations('nav');
    const { data: unreadCount } = useUnreadNotificationCount();

    const bottomNavLinks = [
        { href: '/', label: t('home'), icon: Home },
        { href: '/conversations', label: t('messages'), icon: Mail },
        { href: '/compose', label: t('compose'), icon: PenSquare },
        { href: '/notifications', label: t('notifications'), icon: Bell, badge: unreadCount?.count },
        { href: '/settings', label: t('settings'), icon: Settings },
    ];

    if (!isAuthenticated) return null;

    return (
        <LiquidGlassBottomNav bottomNavLinks={bottomNavLinks} pathname={pathname} />
    );
});

export default BottomNavigation;
