import Link from 'next/link';
import type { Group } from '@/lib/types';
import { Card } from './ui';
import { formatMoney } from '@/lib/currency';
import { store } from '@/lib/store';
import { clsx } from 'clsx';

export function GroupCard({ group, currency }: { group: Group; currency: string }) {
  const me = store.currentUser()!;
  const balances = store.balances(group.id);
  const my = balances.find(b => b.userId === me.id)?.net ?? 0;
  const expenses = store.expenses(group.id);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="p-4 flex items-center gap-3 hover:shadow-card transition">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl">{group.emoji ?? '👥'}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{group.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{group.memberIds.length} members · {expenses.length} expenses · {formatMoney(total, currency)}</div>
        </div>
        <div className={clsx('text-right text-sm font-semibold', my > 0 ? 'text-emerald-600' : my < 0 ? 'text-rose-600' : 'text-gray-500')}>
          {my === 0 ? 'settled' : (my > 0 ? 'you get ' : 'you owe ') + formatMoney(Math.abs(my), currency)}
        </div>
      </Card>
    </Link>
  );
}