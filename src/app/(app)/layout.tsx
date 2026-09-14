'use client';
import { ReactNode, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const router = useRouter();
  useEffect(() => { if (!user) router.replace('/login'); }, [user, router]);
  if (!user) return null;
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-md mx-auto">{children}</div>
      <BottomNav />
    </div>
  );
}