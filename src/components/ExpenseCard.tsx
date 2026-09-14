import Link from 'next/link';
import type { Expense } from '@/lib/types';
import { Card, Avatar } from './ui';
import { formatMoney, categoryMeta } from '@/lib/currency';
import { store } from '@/lib/store';

export function ExpenseCard({ expense, currency, showGroup = false }: { expense: Expense; currency: string; showGroup?: boolean }) {
  const me = store.currentUser()!;
  const payer = store.userById(expense.paidBy);
  const myShare = expense.shares.find(s => s.userId === me.id)?.amount ?? 0;
  const iPaid = expense.paidBy === me.id;
  const cat = categoryMeta(expense.category);
  const group = showGroup ? store.group(expense.groupId) : null;

  return (
    <Link href={`/expense/${expense.id}`}>
      <Card className="p-3.5 flex items-center gap-3 hover:shadow-card transition">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">{cat.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{expense.title}</div>
          <div className="text-xs text-gray-500 truncate">
            {iPaid ? `You paid ${formatMoney(expense.amount, currency)}` : `${payer.name} paid ${formatMoney(expense.amount, currency)}`}
            {group && ` · ${group.emoji ?? ''} ${group.name}`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">{formatMoney(myShare, currency)}</div>
          <div className="text-[11px] text-gray-500">{iPaid ? 'you lent' : 'you owe'}</div>
        </div>
      </Card>
    </Link>
  );
}