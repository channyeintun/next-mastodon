'use client';

import Link from 'next/link';
import { ArrowLeft, LogOut, User, Bookmark, UserPlus, Ban, VolumeX, Clock } from 'lucide-react';
import { useCurrentAccount } from '@/api/queries';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Card } from '@/components/atoms/Card';
import { Avatar } from '@/components/atoms/Avatar';
import { EmojiText } from '@/components/atoms/EmojiText';
import { useAuthStore } from '@/hooks/useStores';

export default function SettingsPage() {
  const authStore = useAuthStore();
  const { data: currentAccount, isLoading } = useCurrentAccount();

  const handleSignOut = () => {
    authStore.signOut();
    window.location.href = '/auth/signin';
  };

  if (isLoading) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--size-4)' }}>
        {/* Header Skeleton */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-3)',
          marginBottom: 'var(--size-5)',
        }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-round)' }} />
          <div className="skeleton" style={{ width: 100, height: 24, borderRadius: 'var(--radius-2)' }} />
        </div>

        {/* Account Info Card Skeleton */}
        <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-4)' }}>
            <div className="skeleton" style={{ width: 50, height: 50, borderRadius: 'var(--radius-round)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 120, height: 18, marginBottom: 'var(--size-2)', borderRadius: 'var(--radius-1)' }} />
              <div className="skeleton" style={{ width: 90, height: 14, marginBottom: 'var(--size-1)', borderRadius: 'var(--radius-1)' }} />
              <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 'var(--radius-1)' }} />
            </div>
          </div>
          <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-2)' }} />
        </Card>

        {/* Quick Links Card Skeleton */}
        <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
          <div className="skeleton" style={{ width: 100, height: 18, marginBottom: 'var(--size-3)', borderRadius: 'var(--radius-1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
            <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-2)' }} />
            <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-2)' }} />
          </div>
        </Card>

        {/* Moderation Card Skeleton */}
        <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
          <div className="skeleton" style={{ width: 100, height: 18, marginBottom: 'var(--size-3)', borderRadius: 'var(--radius-1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
            <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-2)' }} />
            <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 'var(--radius-2)' }} />
          </div>
        </Card>

        {/* Account Card Skeleton */}
        <Card padding="medium">
          <div className="skeleton" style={{ width: 80, height: 18, marginBottom: 'var(--size-3)', borderRadius: 'var(--radius-1)' }} />
          <div className="skeleton" style={{ width: 100, height: 36, borderRadius: 'var(--radius-2)' }} />
        </Card>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <p style={{ color: 'var(--text-2)' }}>
          Please sign in to access settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--size-4)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-3)',
        marginBottom: 'var(--size-5)',
      }}>
        <Link href="/">
          <IconButton>
            <ArrowLeft size={20} />
          </IconButton>
        </Link>
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
          Edit Profile
        </Link>
      </Card>

      {/* Quick Links */}
      <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-2)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-3)',
          color: 'var(--text-2)',
        }}>
          Quick Links
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
          <Link href="/bookmarks" className="settings-link">
            <Bookmark size={20} className="settings-link-icon" />
            Bookmarks
          </Link>

          <Link href="/scheduled" className="settings-link">
            <Clock size={20} className="settings-link-icon" />
            Scheduled Posts
          </Link>

          {currentAccount.locked && (
            <Link href="/follow-requests" className="settings-link">
              <UserPlus size={20} className="settings-link-icon" />
              Follow Requests
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
            Blocked Accounts
          </Link>

          <Link href="/settings/mutes" className="settings-link">
            <VolumeX size={20} className="settings-link-icon" />
            Muted Accounts
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
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
