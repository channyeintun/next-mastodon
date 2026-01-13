'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenSquare, Search, Settings, Github, Bell, List, TrendingUp, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useInstance, useUnreadNotificationCount, useNotificationMarker } from '@/api';
import { CircleSkeleton, TextSkeleton } from '@/components/atoms';
import { useStores } from '@/hooks/useStores';
import { observer } from 'mobx-react-lite';
import { NavigationLink, WrapstodonButton } from './Navigation';

interface SidebarNavigationProps {
    isAuthenticated: boolean;
    instanceURL?: string | null;
}

export const SidebarNavigation = observer(({ isAuthenticated, instanceURL }: SidebarNavigationProps) => {
    const pathname = usePathname();
    const t = useTranslations('nav');
    const { data: instance, isLoading: isLoadingInstance } = useInstance();
    const { data: unreadCount } = useUnreadNotificationCount();
    const { initialAnnualReportState, initialWrapstodonYear } = useStores();

    const wrapstodonYear = instance?.wrapstodon ?? initialWrapstodonYear;
    const currentYear = new Date().getFullYear();
    const isCurrentYear = wrapstodonYear === currentYear;

    const showWrapstodon = isCurrentYear && initialAnnualReportState && initialAnnualReportState !== 'ineligible';

    useNotificationMarker();

    const sidebarNavLinks = [
        { href: '/', label: t('home'), icon: Home },
        { href: '/explore', label: t('explore'), icon: TrendingUp },
        { href: '/search', label: t('search'), icon: Search },
        { href: '/compose', label: t('compose'), icon: PenSquare },
        { href: '/conversations', label: t('messages'), icon: Mail },
        { href: '/lists', label: t('lists'), icon: List },
        { href: '/notifications', label: t('notifications'), icon: Bell, badge: unreadCount?.count },
        { href: '/settings', label: t('settings'), icon: Settings },
    ];

    return (
        <nav className="navigation-sidebar" aria-label="Site navigation">
            <div className="navigation-sidebar-header">
                <Link href="/" className="navigation-sidebar-instance">
                    {isLoadingInstance ? (
                        <>
                            <CircleSkeleton size="40px" />
                            <div className="navigation-sidebar-instance-info flex-gap-0">
                                <TextSkeleton width={96} height={16} />
                                <TextSkeleton width={64} height={12} />
                            </div>
                        </>
                    ) : instance ? (
                        <>
                            {instance.icon?.[instance.icon.length - 1]?.src || instance.thumbnail?.url ? (
                                <img
                                    src={instance.icon?.[instance.icon.length - 1]?.src || instance.thumbnail?.url}
                                    alt={instance.title}
                                    className="navigation-instance-icon"
                                />
                            ) : (
                                <div className="navigation-instance-placeholder">
                                    <span>
                                        {instance.title?.charAt(0) || 'M'}
                                    </span>
                                </div>
                            )}
                            <div className="navigation-sidebar-instance-info">
                                <span className="navigation-sidebar-instance-title text-truncate">{instance.title}</span>
                                <span className="navigation-sidebar-instance-domain text-truncate">{instance.domain}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col">
                            <span className="font-bold text-xl">Mastodon</span>
                            {instanceURL && (
                                <span className="text-xs text-muted-foreground">
                                    {instanceURL.replace('https://', '')}
                                </span>
                            )}
                        </div>
                    )}
                </Link>
            </div>

            {isAuthenticated && (
                <nav className="navigation-sidebar-nav" aria-label="Main navigation">
                    {sidebarNavLinks.map((link) => (
                        <NavigationLink
                            key={link.href}
                            href={link.href}
                            icon={link.icon}
                            label={link.label}
                            isActive={pathname === link.href}
                            variant="sidebar"
                            badge={link.badge}
                        />
                    ))}

                    {showWrapstodon && wrapstodonYear && (
                        <WrapstodonButton
                            year={wrapstodonYear}
                            highlight={initialAnnualReportState === 'available'}
                            textBadge={initialAnnualReportState === 'available' ? 'New' : undefined}
                        />
                    )}
                </nav>
            )}

            <div className="navigation-sidebar-footer">
                {!isAuthenticated && (
                    <Link href="/auth/signin" className="navigation-sidebar-signin">
                        Sign In
                    </Link>
                )}

                <a
                    href="https://github.com/channyeintun/mastodon-nextjs-frontend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navigation-sidebar-link"
                >
                    <div className="navigation-link-icon">
                        <Github size={24} />
                    </div>
                    <span className="navigation-link-label">{t('sourceCode')}</span>
                </a>
            </div>
        </nav>
    );
});

export default SidebarNavigation;
