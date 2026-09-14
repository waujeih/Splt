'use client';
import { useMemo, useState } from 'react';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { Empty } from '@/components/ui';
import { ExpenseCard } from '@/components/ExpenseCard';
import { Search } from 'lucide-react';

export default function ActivityPage() {
  const { user } = useApp();
  const [q, setQ] = useState('');
  if (!user) return null;
  const expenses = useMemo(() => store.expenses().sort((a,b) => b.createdAt - a.createdAt), []);
  const filtered = expenses.filter(e => e.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Activity</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search expenses…" className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <Empty icon="🔍" title="No expenses found" />}
        {filtered.map(e => <ExpenseCard key={e.id} expense={e} currency={user.currency} showGroup />)}
      </div>
    </div>
  );
}