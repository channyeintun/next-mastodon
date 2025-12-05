'use client';

import { observer } from 'mobx-react-lite';
import { useAuthStore } from '@/hooks/useStores';
import Navigation from '@/components/molecules/Navigation';

const NavigationWrapper = observer(() => {
  const authStore = useAuthStore();

  return (
    <Navigation
      isAuthenticated={authStore.isAuthenticated}
      instanceURL={authStore.instanceURL}
    />
  );
});

export default NavigationWrapper;
