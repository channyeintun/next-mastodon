'use client';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TimelinePage } from '@/components/organisms';
import { useAuthStore } from '@/hooks/useStores';

const HomePage = observer(() => {
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      router.replace('/explore');
    }
  }, [authStore.isAuthenticated, router]);

  if (!authStore.isAuthenticated) {
    return null;
  }

  return <TimelinePage />;
});

export default HomePage;
