'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { Card, Button, Avatar } from '@/components/ui';
import { formatMoney, categoryMeta } from '@/lib/currency';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useApp();
  const [, force] = useState(0);
  if (!user) return null;
  const exp = store.expense(id);
  if (!exp) return <div className="p-6 text-sm">Expense not found.</div>;
  const group = store.group(exp.groupId);
  const payer = store.userById(exp.paidBy);
  const cat = categoryMeta(exp.category);
  const myShare = exp.shares.find(s => s.userId === user.id)?.amount ?? 0;

  const del = () => {
    if (!confirm('Delete this expense?')) return;
    store.deleteExpense(exp.id);
    router.back();
  };

  return (
    <div className="px-4 pt-5 space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{group?.emoji} {group?.name}</div>
          <h1 className="text-lg font-bold truncate">{exp.title}</h1>
        </div>
        <button onClick={del} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="w-5 h-5" /></button>
      </header>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 grid place-items-center text-2xl">{cat.emoji}</div>
          <div>
            <div className="text-xs text-gray-500">{cat.label} · {exp.date}</div>
            <div className="text-xs text-gray-500">Split: {exp.split}</div>
          </div>
        </div>
        <div className="text-3xl font-black">{formatMoney(exp.amount, user.currency)}</div>
        <div className="text-sm text-gray-600 mt-1">Paid by <span className="font-semibold">{payer.name}</span></div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold mb-2">Split details</div>
        <div className="space-y-2">
          {exp.shares.map(s => {
            const u = store.userById(s.userId);
            return (
              <div key={s.userId} className="flex items-center gap-3">
                <Avatar name={u.name} size={28} />
                <div className="flex-1 text-sm">{u.name}</div>
                <div className="text-sm font-semibold">{formatMoney(s.amount, user.currency)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {exp.notes && (
        <Card className="p-4">
          <div className="text-sm font-semibold mb-1">Notes</div>
          <div className="text-sm text-gray-700">{exp.notes}</div>
        </Card>
      )}
    </div>
  );
}