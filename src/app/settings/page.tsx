'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, LogOut } from 'lucide-react';
import { useCurrentAccount } from '@/api/queries';
import { useUpdateAccount } from '@/api/mutations';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Card } from '@/components/atoms/Card';
import { Spinner } from '@/components/atoms/Spinner';
import { useAuthStore } from '@/hooks/useStores';

export default function SettingsPage() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { data: currentAccount, isLoading } = useCurrentAccount();
  const updateAccountMutation = useUpdateAccount();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [locked, setLocked] = useState(false);
  const [bot, setBot] = useState(false);
  const [discoverable, setDiscoverable] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current account data
  useEffect(() => {
    if (currentAccount) {
      setDisplayName(currentAccount.display_name);
      setBio(currentAccount.note.replace(/<[^>]*>/g, '')); // Strip HTML
      setLocked(currentAccount.locked);
      setBot(currentAccount.bot);
      setDiscoverable(currentAccount.discoverable ?? true);
    }
  }, [currentAccount]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const params: Record<string, string | File | boolean> = {};

    if (displayName !== currentAccount?.display_name) {
      params.display_name = displayName;
    }
    if (bio !== currentAccount?.note.replace(/<[^>]*>/g, '')) {
      params.note = bio;
    }
    if (locked !== currentAccount?.locked) {
      params.locked = locked;
    }
    if (bot !== currentAccount?.bot) {
      params.bot = bot;
    }
    if (discoverable !== (currentAccount?.discoverable ?? true)) {
      params.discoverable = discoverable;
    }
    if (avatarFile) {
      params.avatar = avatarFile;
    }
    if (headerFile) {
      params.header = headerFile;
    }

    try {
      await updateAccountMutation.mutateAsync(params);
      router.push(`/@${currentAccount?.acct}`);
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  const handleSignOut = () => {
    authStore.signOut();
    window.location.href = '/auth/signin';
  };

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <Spinner />
        <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>
          Loading settings...
        </p>
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
    <div className="container" style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--size-4)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-3)',
        marginBottom: 'var(--size-5)',
      }}>
        <Link href={`/@${currentAccount.acct}`}>
          <IconButton>
            <ArrowLeft size={20} />
          </IconButton>
        </Link>
        <h1 style={{
          fontSize: 'var(--font-size-4)',
          fontWeight: 'var(--font-weight-6)',
          color: 'var(--text-1)',
        }}>
          Edit Profile
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Header Image */}
        <Card padding="none" style={{ marginBottom: 'var(--size-4)' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '100%',
                height: '200px',
                background: headerPreview
                  ? `url(${headerPreview}) center/cover`
                  : currentAccount.header
                    ? `url(${currentAccount.header}) center/cover`
                    : 'var(--surface-3)',
                borderRadius: 'var(--radius-2) var(--radius-2) 0 0',
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 'var(--size-3)',
                right: 'var(--size-3)',
                display: 'flex',
                gap: 'var(--size-2)',
              }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => headerInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Upload Header
                </Button>
                {(headerPreview || headerFile) && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setHeaderFile(null);
                      setHeaderPreview(null);
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: 'var(--size-4)',
            }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: avatarPreview
                      ? `url(${avatarPreview}) center/cover`
                      : currentAccount.avatar
                        ? `url(${currentAccount.avatar}) center/cover`
                        : 'var(--surface-3)',
                    border: '4px solid var(--surface-1)',
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                  }}
                >
                  <Upload size={14} />
                </Button>
              </div>
            </div>
          </div>

          <div style={{ padding: 'var(--size-4)', paddingTop: 'var(--size-8)' }} />
        </Card>

        {/* Hidden file inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />
        <input
          ref={headerInputRef}
          type="file"
          accept="image/*"
          onChange={handleHeaderChange}
          style={{ display: 'none' }}
        />

        {/* Profile Fields */}
        <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-3)',
            fontWeight: 'var(--font-weight-6)',
            marginBottom: 'var(--size-4)',
          }}>
            Profile Information
          </h2>

          <div style={{ marginBottom: 'var(--size-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-1)',
              fontWeight: 'var(--font-weight-6)',
              marginBottom: 'var(--size-2)',
              color: 'var(--text-1)',
            }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              style={{
                width: '100%',
                padding: 'var(--size-2)',
                border: '1px solid var(--surface-4)',
                borderRadius: 'var(--radius-2)',
                background: 'var(--surface-1)',
                color: 'var(--text-1)',
                fontSize: 'var(--font-size-1)',
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--size-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-1)',
              fontWeight: 'var(--font-weight-6)',
              marginBottom: 'var(--size-2)',
              color: 'var(--text-1)',
            }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--size-2)',
                border: '1px solid var(--surface-4)',
                borderRadius: 'var(--radius-2)',
                background: 'var(--surface-1)',
                color: 'var(--text-1)',
                fontSize: 'var(--font-size-1)',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <div style={{
              fontSize: 'var(--font-size-0)',
              color: 'var(--text-2)',
              marginTop: 'var(--size-1)',
              textAlign: 'right',
            }}>
              {bio.length} / 500
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card padding="medium" style={{ marginBottom: 'var(--size-4)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-3)',
            fontWeight: 'var(--font-weight-6)',
            marginBottom: 'var(--size-4)',
          }}>
            Privacy & Preferences
          </h2>

          <div style={{ marginBottom: 'var(--size-3)' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-3)',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => setLocked(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <div>
                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                  Locked Account
                </div>
                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                  Manually approve followers
                </div>
              </div>
            </label>
          </div>

          <div style={{ marginBottom: 'var(--size-3)' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-3)',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={bot}
                onChange={(e) => setBot(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <div>
                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                  Bot Account
                </div>
                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                  This account mainly performs automated actions
                </div>
              </div>
            </label>
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-3)',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={discoverable}
                onChange={(e) => setDiscoverable(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <div>
                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                  Suggest Account to Others
                </div>
                <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                  Allow your account to be discovered
                </div>
              </div>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 'var(--size-3)',
          justifyContent: 'flex-end',
        }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={updateAccountMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateAccountMutation.isPending}
            isLoading={updateAccountMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Sign Out Section */}
      <Card padding="medium" style={{ marginTop: 'var(--size-6)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-3)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-3)',
        }}>
          Account
        </h2>
        <p style={{
          fontSize: 'var(--font-size-1)',
          color: 'var(--text-2)',
          marginBottom: 'var(--size-4)',
        }}>
          Signed in as <strong style={{ color: 'var(--text-1)' }}>@{currentAccount.acct}</strong>
          {authStore.instanceURL && (
            <span> on {authStore.instanceURL.replace('https://', '')}</span>
          )}
        </p>
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
