'use client';

import { Activity } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useStores';
import { observer } from 'mobx-react-lite';

const Header = observer(() => {
  const authStore = useAuthStore();

  const handleSignOut = () => {
    authStore.signOut();
    window.location.href = '/auth/signin';
  };

  return (
    <header
      style={{
        padding: 'var(--size-4)',
        background: 'var(--surface-2)',
        boxShadow: 'var(--shadow-2)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-5)' }}>
          <Link
            href="/"
            style={{
              fontSize: 'var(--font-size-4)',
              fontWeight: 'var(--font-weight-7)',
              textDecoration: 'none',
              color: 'var(--text-1)',
            }}
          >
            Mastodon
          </Link>

          <Activity mode={authStore.isAuthenticated ? 'visible' : 'hidden'}>
            <nav style={{ display: 'flex', gap: 'var(--size-4)' }}>
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-2)',
                  fontSize: 'var(--font-size-1)',
                }}
              >
                Home
              </Link>
              <Link
                href="/compose"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-2)',
                  fontSize: 'var(--font-size-1)',
                }}
              >
                Compose
              </Link>
              <Link
                href="/bookmarks"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-2)',
                  fontSize: 'var(--font-size-1)',
                }}
              >
                Bookmarks
              </Link>
              <Link
                href="/search"
                style={{
                  textDecoration: 'none',
                  color: 'var(--text-2)',
                  fontSize: 'var(--font-size-1)',
                }}
              >
                Search
              </Link>
            </nav>
          </Activity>
        </div>

        <div>
          <Activity mode={authStore.isAuthenticated ? 'visible' : 'hidden'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
              <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                {authStore.instanceURL?.replace('https://', '')}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  padding: 'var(--size-2) var(--size-4)',
                  fontSize: 'var(--font-size-1)',
                  fontWeight: 'var(--font-weight-6)',
                  border: '1px solid var(--red-7)',
                  borderRadius: 'var(--radius-2)',
                  background: 'transparent',
                  color: 'var(--red-7)',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </Activity>

          <Activity mode={!authStore.isAuthenticated ? 'visible' : 'hidden'}>
            <Link
              href="/auth/signin"
              style={{
                display: 'inline-block',
                padding: 'var(--size-2) var(--size-4)',
                fontSize: 'var(--font-size-1)',
                fontWeight: 'var(--font-weight-6)',
                border: 'none',
                borderRadius: 'var(--radius-2)',
                background: 'var(--blue-6)',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </Activity>
        </div>
      </div>
    </header>
  );
});

export default Header;
