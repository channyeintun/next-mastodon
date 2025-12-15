'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogOut, User, Bookmark, UserPlus, Ban, VolumeX, Clock, List, Settings2, TrendingUp, Search, Bell } from 'lucide-react';
import { useCurrentAccount } from '@/api';
import { Button, IconButton, Card, Avatar, EmojiText, CircleSkeleton, TextSkeleton } from '@/components/atoms';
import { ThemeSelector } from '@/components/molecules';
import { useAuthStore } from '@/hooks/useStores';
import { useQueryClient } from '@tanstack/react-query';

interface SettingsClientProps {
  initialTheme: 'light' | 'dark' | 'auto';
}

export function SettingsClient({ initialTheme }: SettingsClientProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const authStore = useAuthStore();
  const { data: currentAccount, isLoading } = useCurrentAccount();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    startTransition(async () => {
      queryClient.clear();
      authStore.signOut();
      router.replace('/auth/signin');
      router.refresh();
    });
  };

  // Show skeleton until account data is loaded
  if (isLoading || !currentAccount) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
        {/* Header Skeleton */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-3)',
          marginBottom: 'var(--size-5)',
        }}>
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

        {/* Moderation Card Skeleton */}
        <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
          <TextSkeleton width={100} height={18} style={{ marginBottom: 'var(--size-3)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
            <TextSkeleton width="100%" height={40} />
            <TextSkeleton width="100%" height={40} />
          </div>
        </Card>

        {/* Account Card Skeleton */}
        <Card padding="medium">
          <TextSkeleton width={80} height={18} style={{ marginBottom: 'var(--size-3)' }} />
          <TextSkeleton width={100} height={36} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--size-4) var(--size-2)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-3)',
        marginBottom: 'var(--size-5)',
      }}>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
        <h1 style={{
          fontSize: 'var(--font-size-4)',
          fontWeight: 'var(--font-weight-6)',
          color: 'var(--text-1)',
        }}>
          Settings
        </h1>
      </div>

      {/* Account Info Card */}
      <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-4)' }}>
          <Avatar
            src={currentAccount.avatar}
            alt={currentAccount.display_name || currentAccount.username}
            size="large"
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'var(--font-weight-6)', fontSize: 'var(--font-size-2)', marginBottom: 'var(--size-1)' }}>
              <EmojiText text={currentAccount.display_name || currentAccount.username} emojis={currentAccount.emojis} />
            </div>
            <div style={{ color: 'var(--text-2)', fontSize: 'var(--font-size-1)' }}>
              @{currentAccount.acct}
            </div>
            {authStore.instanceURL && (
              <div style={{ color: 'var(--text-3)', fontSize: 'var(--font-size-0)', marginTop: 'var(--size-1)' }}>
                {authStore.instanceURL.replace('https://', '')}
              </div>
            )}
          </div>
        </div>

        <Link href="/profile/edit" className="settings-link" style={{ marginBottom: 'var(--size-2)' }}>
          <User size={20} className="settings-link-icon" />
          Edit profile
        </Link>

        <Link href="/settings/preferences" className="settings-link">
          <Settings2 size={20} className="settings-link-icon" />
          Preferences
        </Link>
      </Card>

      {/* Appearance */}
      <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-2)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-3)',
          color: 'var(--text-2)',
        }}>
          Appearance
        </h2>
        <ThemeSelector initialTheme={initialTheme} />
      </Card>

      {/* Quick Links */}
      <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-2)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-3)',
          color: 'var(--text-2)',
        }}>
          Quick links
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
          <Link href="/search" className="settings-link mobile-only">
            <Search size={20} className="settings-link-icon" />
            Search
          </Link>

          <Link href="/explore" className="settings-link mobile-only">
            <TrendingUp size={20} className="settings-link-icon" />
            Explore
          </Link>

          <Link href="/bookmarks" className="settings-link">
            <Bookmark size={20} className="settings-link-icon" />
            Bookmarks
          </Link>

          <Link href="/lists" className="settings-link">
            <List size={20} className="settings-link-icon" />
            Lists
          </Link>

          <Link href="/scheduled" className="settings-link">
            <Clock size={20} className="settings-link-icon" />
            Scheduled posts
          </Link>

          {currentAccount.locked && (
            <Link href="/follow-requests" className="settings-link">
              <UserPlus size={20} className="settings-link-icon" />
              Follow requests
            </Link>
          )}
        </div>
      </Card>

      {/* Moderation */}
      <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-2)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-3)',
          color: 'var(--text-2)',
        }}>
          Moderation
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
          <Link href="/settings/blocks" className="settings-link">
            <Ban size={20} className="settings-link-icon" />
            Blocked accounts
          </Link>

          <Link href="/settings/mutes" className="settings-link">
            <VolumeX size={20} className="settings-link-icon" />
            Muted accounts
          </Link>

          <Link href="/settings/notifications" className="settings-link">
            <Bell size={20} className="settings-link-icon" />
            Push Notifications
          </Link>
        </div>
      </Card>

      {/* Sign Out */}
      <Card padding="medium">
        <h2 style={{
          fontSize: 'var(--font-size-2)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-3)',
          color: 'var(--text-2)',
        }}>
          Account
        </h2>
        <Button
          type="button"
          variant="danger"
          onClick={handleSignOut}
          disabled={isPending}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}
        >
          <LogOut size={18} />
          {isPending ? 'Signing out...' : 'Sign Out'}
        </Button>
      </Card>
    </div>
  );
}
