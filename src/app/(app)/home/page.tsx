'use client';
import Link from 'next/link';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { BalanceSummary } from '@/components/BalanceSummary';
import { GroupCard } from '@/components/GroupCard';
import { ExpenseCard } from '@/components/ExpenseCard';
import { Card, Button, Avatar } from '@/components/ui';
import { Plus, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useApp();
  if (!user) return null;
  const groups = store.groups();
  const allExp = store.expenses();
  const recent = [...allExp].sort((a,b) => b.createdAt - a.createdAt).slice(0, 5);

  let owe = 0, owed = 0;
  for (const g of groups) {
    const bal = store.balances(g.id).find(b => b.userId === user.id)?.net ?? 0;
    if (bal < 0) owe += -bal; else owed += bal;
  }
  const net = owed - owe;

  return (
    <div className="px-4 pt-6 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Welcome back</div>
          <div className="text-xl font-bold">{user.name.split(' ')[0]} 👋</div>
        </div>
        <Link href="/profile"><Avatar name={user.name} url={user.photoUrl} size={40} /></Link>
      </header>

      <BalanceSummary owe={owe} owed={owed} net={net} currency={user.currency} />

      <div className="grid grid-cols-2 gap-2.5">
        <Link href="/add-expense"><Button className="w-full" size="md"><Plus className="w-4 h-4" />Add expense</Button></Link>
        <Link href="/groups"><Button variant="secondary" className="w-full" size="md">New group</Button></Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Your groups</h2>
          <Link href="/groups" className="text-xs text-brand-600 font-semibold flex items-center gap-0.5">See all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="space-y-2">
          {groups.length === 0 && <Card className="p-5 text-sm text-gray-500 text-center">No groups yet. Create one to start splitting!</Card>}
          {groups.slice(0, 3).map(g => <GroupCard key={g.id} group={g} currency={user.currency} />)}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Recent expenses</h2>
          <Link href="/activity" className="text-xs text-brand-600 font-semibold">View all</Link>
        </div>
        <div className="space-y-2">
          {recent.length === 0 && <Card className="p-5 text-sm text-gray-500 text-center">No expenses yet.</Card>}
          {recent.map(e => <ExpenseCard key={e.id} expense={e} currency={user.currency} showGroup />)}
        </div>
      </section>
    </div>
  );
}