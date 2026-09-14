'use client';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { Card, Button, Avatar, Empty } from '@/components/ui';
import { ExpenseCard } from '@/components/ExpenseCard';
import { Modal } from '@/components/Modal';
import { formatMoney } from '@/lib/currency';
import { ArrowLeft, Plus, Settings, Check } from 'lucide-react';
import { clsx } from 'clsx';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useApp();
  const [, force] = useState(0);
  const [settleOpen, setSettleOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const group = store.group(id);
  const expenses = useMemo(() => store.expenses(id).sort((a,b) => b.createdAt - a.createdAt), [id, settleOpen]);
  if (!group || !user) return <div className="p-6 text-sm">Group not found.</div>;

  const balances = store.balances(id);
  const simplified = store.simplified(id);
  const total = expenses.reduce((s,e) => s + e.amount, 0);

  const refresh = () => force(n => n + 1);

  return (
    <div className="px-4 pt-5 space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-11 h-11 rounded-2xl bg-brand-50 grid place-items-center text-2xl">{group.emoji ?? '👥'}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{group.name}</div>
          <div className="text-xs text-gray-500">{group.memberIds.length} members · {formatMoney(total, user.currency)} total</div>
        </div>
        <button onClick={() => setMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100"><Settings className="w-5 h-5" /></button>
      </header>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Balances</h3>
        <Card className="divide-y divide-gray-100">
          {balances.map(b => {
            const u = store.userById(b.userId);
            const isMe = b.userId === user.id;
            return (
              <div key={b.userId} className="flex items-center gap-3 p-3">
                <Avatar name={u.name} url={u.photoUrl} size={32} />
                <div className="flex-1 text-sm">{u.name}{isMe && <span className="text-xs text-gray-400 ml-1">(you)</span>}</div>
                <div className={clsx('text-sm font-semibold', b.net > 0 ? 'text-emerald-600' : b.net < 0 ? 'text-rose-600' : 'text-gray-400')}>
                  {b.net === 0 ? 'settled' : (b.net > 0 ? 'gets ' : 'owes ') + formatMoney(Math.abs(b.net), user.currency)}
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      {simplified.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Settle up</h3>
          <Card className="p-3 space-y-2">
            {simplified.map((s, i) => {
              const from = store.userById(s.from), to = store.userById(s.to);
              const involvesMe = s.from === user.id || s.to === user.id;
              return (
                <div key={i} className={clsx('flex items-center gap-2 text-sm', involvesMe ? 'font-semibold' : 'text-gray-600')}>
                  <Avatar name={from.name} size={24} />
                  <span className="truncate">{from.name}</span>
                  <span className="text-gray-400">pays</span>
                  <span className="font-semibold">{formatMoney(s.amount, user.currency)}</span>
                  <span className="text-gray-400">to</span>
                  <Avatar name={to.name} size={24} />
                  <span className="truncate">{to.name}</span>
                </div>
              );
            })}
            <Button size="sm" className="w-full mt-2" onClick={() => setSettleOpen(true)}><Check className="w-4 h-4" />Record settlement</Button>
          </Card>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Expenses</h3>
          <Link href={`/add-expense?group=${id}`}><Button size="sm" variant="secondary"><Plus className="w-4 h-4" />Add</Button></Link>
        </div>
        <div className="space-y-2">
          {expenses.length === 0 && <Empty icon="🧾" title="No expenses yet" hint="Add your first expense to start tracking." />}
          {expenses.map(e => <ExpenseCard key={e.id} expense={e} currency={user.currency} />)}
        </div>
      </section>

      <Modal open={settleOpen} onClose={() => setSettleOpen(false)} title="Record settlement" footer={<>
        <Button variant="secondary" onClick={() => setSettleOpen(false)}>Cancel</Button>
        <Button onClick={() => { /* handled inline */ }}>Save</Button>
      </>}>
        <SettleForm groupId={id} onDone={() => { setSettleOpen(false); refresh(); }} />
      </Modal>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Group settings" footer={
        <Button variant="ghost" onClick={() => setMenuOpen(false)}>Close</Button>
      }>
        <div className="space-y-2">
          {group.ownerId === user.id ? (
            <Button variant="danger" className="w-full" onClick={() => { if (confirm('Delete this group and all its expenses?')) { store.deleteGroup(id); router.push('/groups'); } }}>Delete group</Button>
          ) : (
            <Button variant="secondary" className="w-full" onClick={() => { store.leaveGroup(id); router.push('/groups'); }}>Leave group</Button>
          )}
        </div>
      </Modal>
    </div>
  );
}

function SettleForm({ groupId, onDone }: { groupId: string; onDone: () => void }) {
  const { user } = useApp();
  const [method, setMethod] = useState<'cash' | 'upi'>('upi');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  if (!user) return null;
  const simplified = store.simplified(groupId).filter(s => s.from === user.id);
  const amt = parseFloat(amount) || 0;

  const save = () => {
    if (!to || amt <= 0) return;
    store.addSettlement({ groupId, payerId: user.id, receiverId: to, amount: amt, method });
    onDone();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-600">Pay to</label>
        <div className="mt-1 space-y-1.5">
          {simplified.length === 0 && <div className="text-xs text-gray-500">You don't owe anyone in this group.</div>}
          {simplified.map(s => {
            const u = store.userById(s.to);
            return (
              <button key={s.to} onClick={() => { setTo(s.to); setAmount(String(s.amount)); }} className={clsx('w-full flex items-center gap-3 p-2 rounded-xl border', to===s.to?'border-brand-500 bg-brand-50':'border-gray-200')}>
                <Avatar name={u.name} size={28} />
                <div className="flex-1 text-left text-sm">{u.name}</div>
                <div className="text-sm font-semibold">{formatMoney(s.amount, user.currency)}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Amount</label>
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Method</label>
        <div className="flex gap-2 mt-1">
          {(['upi','cash'] as const).map(m => (
            <button key={m} onClick={() => setMethod(m)} className={clsx('flex-1 py-2 rounded-xl border text-sm font-medium', method===m?'border-brand-500 bg-brand-50 text-brand-700':'border-gray-200')}>
              {m === 'upi' ? 'UPI' : 'Cash'}
            </button>
          ))}
        </div>
      </div>
      <Button className="w-full" size="lg" onClick={save}>Record payment</Button>
    </div>
  );
}