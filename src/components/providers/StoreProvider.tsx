'use client';

import { type ReactNode, useMemo } from 'react';
import { getRootStore, type RootStoreInitialState } from '@/stores/rootStore';
import { StoreContext } from '@/hooks/useStores';

interface StoreProviderProps {
  children: ReactNode;
  initialState?: RootStoreInitialState;
}

export function StoreProvider({ children, initialState }: StoreProviderProps) {
  // Create store only once on client mount with initial state from server
  const rootStore = useMemo(() => getRootStore(initialState), []);

  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
}
