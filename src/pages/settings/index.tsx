import Head from 'next/head';
import { useTransition } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, LogOut, User, Bookmark, UserPlus, Ban, VolumeX, Clock, List, Settings2, TrendingUp, Search, Bell, Filter, Info } from 'lucide-react';
import { useCurrentAccount, useInstance, useAnnualReportState } from '@/api';
import { Button, IconButton, Card, Avatar, EmojiText, CircleSkeleton, TextSkeleton } from '@/components/atoms';
import { ThemeSelector } from '@/components/molecules';
import { useAuthStore } from '@/hooks/useStores';
import { useQueryClient } from '@tanstack/react-query';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { WrapstodonModal } from '@/components/wrapstodon/WrapstodonModal';
import { GiRingedPlanet } from 'react-icons/gi';
import { MainLayout } from '@/components/layouts/MainLayout';

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const authStore = useAuthStore();
    const { data: currentAccount, isLoading } = useCurrentAccount();
    const [isPending, startTransition] = useTransition();
    const { openModal, closeModal } = useGlobalModal();

    // Wrapstodon logic
    const { data: instance } = useInstance();
    const wrapstodonYear = instance?.wrapstodon;
    const currentYear = new Date().getFullYear();
    const isCurrentYear = wrapstodonYear === currentYear;

    const { data: annualReportState } = useAnnualReportState(wrapstodonYear ?? 0, {
        enabled: !!wrapstodonYear && isCurrentYear,
    });

    const showWrapstodon = isCurrentYear && annualReportState?.state && annualReportState.state !== 'ineligible';

    // Get theme from cookie (default to 'auto')
    const initialTheme = 'auto' as 'light' | 'dark' | 'auto';

    const handleSignOut = async () => {
        startTransition(async () => {
            queryClient.clear();
            authStore.signOut();
            router.replace('/auth/signin');
        });
    };

    const handleWrapstodonClick = () => {
        openModal(<WrapstodonModal onClose={closeModal} />);
    };

    // Show skeleton until account data is loaded
    if (isLoading || !currentAccount) {
        return (
            <MainLayout>
                <Head><title>Settings - Mastodon</title></Head>
                <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
                    {/* Header Skeleton */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-5)' }}>
                        <CircleSkeleton size="40px" />
                        <TextSkeleton width={100} height={24} />
                    </div>
                    {/* Account Info Card Skeleton */}
                    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-4)' }}>
                            <CircleSkeleton size="50px" />
                            <div style={{ flex: 1 }}>
                                <TextSkeleton width={120} height={18} style={{ marginBottom: 'var(--size-2)' }} />
                                <TextSkeleton width={90} height={14} style={{ marginBottom: 'var(--size-1)' }} />
                                <TextSkeleton width={80} height={12} />
                            </div>
                        </div>
                        <TextSkeleton width="100%" height={40} />
                    </Card>
                    {/* Quick Links Card Skeleton */}
                    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                        <TextSkeleton width={100} height={18} style={{ marginBottom: 'var(--size-3)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                            <TextSkeleton width="100%" height={40} />
                            <TextSkeleton width="100%" height={40} />
                        </div>
                    </Card>
                    {/* Appearance Card Skeleton */}
                    <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                        <TextSkeleton width={100} height={18} style={{ marginBottom: 'var(--size-3)' }} />
                        <TextSkeleton width="100%" height={40} />
                    </Card>
                    {/* Account Card Skeleton */}
                    <Card padding="medium">
                        <TextSkeleton width={80} height={18} style={{ marginBottom: 'var(--size-3)' }} />
                        <TextSkeleton width={100} height={36} />
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head><title>Settings - Mastodon</title></Head>
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-5)' }}>
                    <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                    <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>Settings</h1>
                </div>

                {/* Account Info Card */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-4)' }}>
                        <Avatar src={currentAccount.avatar} alt={currentAccount.display_name || currentAccount.username} size="large" />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'var(--font-weight-6)', fontSize: 'var(--font-size-2)', marginBottom: 'var(--size-1)' }}>
                                <EmojiText text={currentAccount.display_name || currentAccount.username} emojis={currentAccount.emojis} />
                            </div>
                            <div style={{ color: 'var(--text-2)', fontSize: 'var(--font-size-1)' }}>@{currentAccount.acct}</div>
                            {authStore.instanceURL && (
                                <div style={{ color: 'var(--text-3)', fontSize: 'var(--font-size-0)', marginTop: 'var(--size-1)' }}>
                                    {authStore.instanceURL.replace('https://', '')}
                                </div>
                            )}
                        </div>
                    </div>

                    <Link href="/profile/edit" className="settings-link" style={{ marginBottom: 'var(--size-2)' }}>
                        <User size={20} className="settings-link-icon" />Edit profile
                    </Link>

                    <Link href="/settings/preferences" className="settings-link">
                        <Settings2 size={20} className="settings-link-icon" />Preferences
                    </Link>
                </Card>

                {/* Quick Links */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-2)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-3)', color: 'var(--text-2)' }}>Quick links</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                        <Link href="/search" className="settings-link mobile-only"><Search size={20} className="settings-link-icon" />Search</Link>
                        <Link href="/explore" className="settings-link mobile-only"><TrendingUp size={20} className="settings-link-icon" />Trending</Link>
                        <Link href="/bookmarks" className="settings-link"><Bookmark size={20} className="settings-link-icon" />Bookmarks</Link>
                        <Link href="/lists" className="settings-link"><List size={20} className="settings-link-icon" />Lists</Link>
                        <Link href="/scheduled" className="settings-link"><Clock size={20} className="settings-link-icon" />Scheduled posts</Link>

                        {currentAccount.locked && (
                            <Link href="/follow-requests" className="settings-link"><UserPlus size={20} className="settings-link-icon" />Follow requests</Link>
                        )}

                        {showWrapstodon && wrapstodonYear && (
                            <button onClick={handleWrapstodonClick} className="settings-link mobile-only wrapstodon-highlight" style={{ width: '100%', textAlign: 'left' }}>
                                <GiRingedPlanet size={20} className="settings-link-icon" />
                                Wrapstodon {wrapstodonYear}
                                {annualReportState?.state === 'available' && (
                                    <span style={{ marginLeft: 'auto', padding: '2px 5px', fontSize: '7px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>New</span>
                                )}
                            </button>
                        )}
                    </div>
                </Card>

                {/* Appearance */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-2)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-3)', color: 'var(--text-2)' }}>Appearance</h2>
                    <ThemeSelector initialTheme={initialTheme} />
                </Card>

                {/* Moderation */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-2)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-3)', color: 'var(--text-2)' }}>Moderation</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                        <Link href="/settings/blocks" className="settings-link"><Ban size={20} className="settings-link-icon" />Blocked accounts</Link>
                        <Link href="/settings/mutes" className="settings-link"><VolumeX size={20} className="settings-link-icon" />Muted accounts</Link>
                        <Link href="/settings/filters" className="settings-link"><Filter size={20} className="settings-link-icon" />Filters</Link>
                        <Link href="/settings/notifications" className="settings-link"><Bell size={20} className="settings-link-icon" />Push Notifications</Link>
                    </div>
                </Card>

                {/* Server Info */}
                <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-2)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-3)', color: 'var(--text-2)' }}>Server</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                        <Link href="/about" className="settings-link"><Info size={20} className="settings-link-icon" />About this server</Link>
                    </div>
                </Card>

                {/* Sign Out */}
                <Card padding="medium">
                    <h2 style={{ fontSize: 'var(--font-size-2)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-3)', color: 'var(--text-2)' }}>Account</h2>
                    <Button type="button" variant="danger" onClick={handleSignOut} disabled={isPending} style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                        <LogOut size={18} />{isPending ? 'Signing out...' : 'Sign Out'}
                    </Button>
                </Card>
            </div>
        </MainLayout>
    );
}
