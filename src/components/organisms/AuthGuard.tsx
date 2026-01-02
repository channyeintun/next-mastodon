'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '@/hooks/useStores';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = observer(({ children }: AuthGuardProps) => {
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authStore.isAuthenticated, router]);

  if (!authStore.isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <div
          className="spinner"
          style={{
            margin: '0 auto var(--size-4)',
            width: 'var(--size-8)',
            height: 'var(--size-8)',
          }}
        />
        <p style={{ color: 'var(--text-2)' }}>Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
});

export default AuthGuard;
