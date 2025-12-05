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
    <header className="header">
      <div className="container header-container">
        <div className="header-left">
          <Link href="/" className="header-logo">
            Mastodon
          </Link>
        </div>

        <div className="header-right">
          <Activity mode={authStore.isAuthenticated ? 'visible' : 'hidden'}>
            <div className="header-user-info">
              <span className="header-instance">
                {authStore.instanceURL?.replace('https://', '')}
              </span>
              <button onClick={handleSignOut} className="header-signout-button">
                Sign Out
              </button>
            </div>
          </Activity>

          <Activity mode={!authStore.isAuthenticated ? 'visible' : 'hidden'}>
            <Link href="/auth/signin" className="header-signin-button">
              Sign In
            </Link>
          </Activity>
        </div>
      </div>
    </header>
  );
});

export default Header;
