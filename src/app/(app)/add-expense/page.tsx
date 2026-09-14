'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { buildShares } from '@/lib/calculations';
import { formatMoney, CATEGORIES, categoryMeta } from '@/lib/currency';
import { Button, Input, Card, Avatar } from '@/components/ui';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { SplitKind } from '@/lib/types';

export default function AddExpensePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useApp();
  const preselectGroup = params.get('group') ?? '';

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [groupId, setGroupId] = useState(preselectGroup);
  const [paidBy, setPaidBy] = useState(user?.id ?? '');
  const [split, setSplit] = useState<SplitKind>('equal');
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const groups = store.groups();
  const group = groups.find(g => g.id === groupId);
  const members = group ? group.memberIds.map(id => store.userById(id)) : [];

  useEffect(() => {
    if (group && !paidBy) setPaidBy(user?.id ?? '');
    if (group) {
      setIncluded(Object.fromEntries(group.memberIds.map(id => [id, true])));
      setValues(Object.fromEntries(group.memberIds.map(id => [id, ''])));
    }
  }, [groupId]);

  const includedIds = useMemo(() => members.filter(m => included[m.id]).map(m => m.id), [members, included]);
  const amt = parseFloat(amount) || 0;

  const shares = useMemo(() => {
    if (!group || amt <= 0 || includedIds.length === 0) return null;
    try {
      if (split === 'percent' || split === 'exact' || split === 'unequal') {
        const v: Record<string, number> = {};
        for (const id of includedIds) v[id] = parseFloat(values[id] || '0') || 0;
        return buildShares(amt, includedIds, split, v);
      }
      return buildShares(amt, includedIds, 'equal', {});
    } catch (e: any) { return { error: e.message as string }; }
  }, [group, amt, includedIds, split, values]);

  const save = () => {
    if (!group) return setError('Pick a group');
    if (!title.trim()) return setError('Enter a title');
    if (amt <= 0) return setError('Enter an amount');
    if (!shares || 'error' in shares) return setError(shares?.error ?? 'Invalid split');
    if (!shares.every(s => s.userId === paidBy || includedIds.includes(s.userId))) return setError('Payer must be involved');
    store.addExpense({
      groupId: group.id, title: title.trim(), amount: amt, paidBy, category, date,
      split, shares,
    });
    router.push(`/groups/${group.id}`);
  };

  if (!user) return null;

  return (
    <div className="px-4 pt-5 space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Add expense</h1>
      </header>

      <Card className="p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Dinner at Trishna" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <Input type="number" className="pl-8 text-lg font-semibold" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Category</label>
          <div className="flex gap-2 flex-wrap mt-1.5">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border', category===c.id?'bg-brand-600 text-white border-brand-600':'bg-white border-gray-200 text-gray-700')}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-600">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Group</label>
            <select className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm" value={groupId} onChange={e => setGroupId(e.target.value)}>
              <option value="">Select group…</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
            </select>
          </div>
        </div>

        {group && (
          <div>
            <label className="text-xs font-medium text-gray-600">Paid by</label>
            <div className="flex gap-2 flex-wrap mt-1.5">
              {members.map(m => (
                <button key={m.id} onClick={() => setPaidBy(m.id)} className={clsx('flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-xs', paidBy===m.id?'bg-brand-50 border-brand-500 text-brand-700':'bg-white border-gray-200')}>
                  <Avatar name={m.name} size={20} />{m.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {group && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Split</div>
              <div className="text-xs text-gray-500">{includedIds.length} people · {formatMoney(amt, user.currency)}</div>
            </div>
            <select className="rounded-lg border border-gray-200 px-2 py-1 text-xs" value={split} onChange={e => setSplit(e.target.value as SplitKind)}>
              <option value="equal">Equal</option>
              <option value="unequal">Unequal</option>
              <option value="percent">Percent</option>
              <option value="exact">Exact amounts</option>
            </select>
          </div>

          <div className="space-y-1.5">
            {members.map(m => {
              const on = included[m.id];
              {members.map(m => {
  const on = included[m.id];
  const share = 'error' in (shares ?? {}) ? null : shares?.find(s => s.userId === m.id);
  return (
    <div key={m.id} className={clsx('flex items-center gap-2 p-2 rounded-xl border', on?'border-gray-200':'border-gray-100 opacity-50')}>
      
              return (
                <div key={m.id} className={clsx('flex items-center gap-2 p-2 rounded-xl border', on?'border-gray-200':'border-gray-100 opacity-50')}>
                  <button onClick={() => setIncluded(x => ({ ...x, [m.id]: !x[m.id] }))} className={clsx('w-5 h-5 rounded-md border-2 flex items-center justify-center', on?'bg-brand-600 border-brand-600':'border-gray-300')}>
                    {on && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <Avatar name={m.name} size={28} />
                  <div className="flex-1 text-sm">{m.name}</div>
                  {on && split === 'equal' && <div className="text-sm font-semibold">{formatMoney(share?.amount ?? 0, user.currency)}</div>}
                  {on && (split === 'percent' || split === 'exact' || split === 'unequal') && (
                    <div className="flex items-center gap-1">
                      <Input type="number" className="w-20 text-right" placeholder="0" value={values[m.id] ?? ''} onChange={e => setValues(v => ({ ...v, [m.id]: e.target.value }))} />
                      <span className="text-xs text-gray-500 w-5">{split === 'percent' ? '%' : '₹'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {shares && 'error' in shares && <div className="text-xs text-rose-600">{shares.error}</div>}
        </Card>
      )}

      <Card className="p-3 flex items-center gap-3 bg-brand-50 border-brand-100">
        <Camera className="w-5 h-5 text-brand-600" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-brand-900">Scan receipt (AI)</div>
          <div className="text-xs text-brand-700">Coming soon — extract items automatically.</div>
        </div>
        <Button size="sm" variant="secondary">Upload</Button>
      </Card>

      {error && <div className="text-sm text-rose-600 px-1">{error}</div>}

      <Button className="w-full" size="lg" onClick={save}>Save expense</Button>
    </div>
  );
}