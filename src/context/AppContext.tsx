'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { store, seedDemo } from '@/lib/store';

type Ctx = {
  user: User | null;
  refresh: () => void;
};
const AppCtx = createContext<Ctx>({ user: null, refresh: () => {} });

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDemo();
    setUser(store.currentUser());
    setReady(true);
  }, []);

  const refresh = () => setUser(store.currentUser());

  if (!ready) return null;
  return <AppCtx.Provider value={{ user, refresh }}>{children}</AppCtx.Provider>;
}
export const useApp = () => useContext(AppCtx);