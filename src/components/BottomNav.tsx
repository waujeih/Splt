'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, PlusCircle, Clock, User } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { href: '/home',         label: 'Home',    Icon: Home },
  { href: '/groups',       label: 'Groups',  Icon: Users },
  { href: '/add-expense',  label: 'Add',     Icon: PlusCircle, primary: true },
  { href: '/activity',     label: 'Activity',Icon: Clock },
  { href: '/profile',      label: 'Profile', Icon: User },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {items.map(({ href, label, Icon, primary }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={clsx(
              'flex flex-col items-center justify-center py-2.5 text-[11px] font-medium transition',
              primary ? 'text-brand-600' : active ? 'text-brand-600' : 'text-gray-500',
            )}>
              {primary ? (
                <div className="relative -mt-5 bg-brand-600 text-white rounded-2xl p-2.5 shadow-soft">
                  <Icon className="w-6 h-6" />
                </div>
              ) : (
                <Icon className={clsx('w-5 h-5', active && 'scale-110')} />
              )}
              <span className={clsx(primary && 'mt-0.5')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}