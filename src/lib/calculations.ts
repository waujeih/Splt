import type { Expense, Settlement, Balance } from './types';
import { round2 } from './currency';

export function computeBalances(
  expenses: Expense[],
  settlements: Settlement[],
  groupId: string,
): Balance[] {
  const map = new Map<string, number>();
  const ensure = (id: string) => { if (!map.has(id)) map.set(id, 0); };

  for (const e of expenses.filter(x => x.groupId === groupId)) {
    ensure(e.paidBy);
    map.set(e.paidBy, (map.get(e.paidBy) ?? 0) + e.amount);
    for (const s of e.shares) {
      ensure(s.userId);
      map.set(s.userId, (map.get(s.userId) ?? 0) - s.amount);
    }
  }
  for (const s of settlements.filter(x => x.groupId === groupId)) {
    ensure(s.payerId); ensure(s.receiverId);
    map.set(s.payerId,   (map.get(s.payerId)   ?? 0) + s.amount);
    map.set(s.receiverId,(map.get(s.receiverId)?? 0) - s.amount);
  }

  return Array.from(map.entries()).map(([userId, net]) => ({ userId, net: round2(net) }));
}

export function simplifyDebts(balances: Balance[]): { from: string; to: string; amount: number }[] {
  const debtors  = balances.filter(b => b.net < -0.01).map(b => ({ id: b.userId, amt: -b.net }));
  const creditors= balances.filter(b => b.net >  0.01).map(b => ({ id: b.userId, amt:  b.net }));
  debtors.sort((a,b) => b.amt - a.amt);
  creditors.sort((a,b) => b.amt - a.amt);

  const out: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > 0.01) out.push({ from: debtors[i].id, to: creditors[j].id, amount: round2(pay) });
    debtors[i].amt   -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt   < 0.01) i++;
    if (creditors[j].amt < 0.01) j++;
  }
  return out;
}

export function buildShares(
  amount: number,
  memberIds: string[],
  kind: 'equal' | 'percent' | 'exact' | 'unequal',
  values: Record<string, number>,
): { userId: string; amount: number }[] {
  const ids = memberIds.filter(id => values[id] !== undefined || kind === 'equal');
  if (ids.length === 0) throw new Error('Select at least one person');

  if (kind === 'equal') {
    const per = round2(amount / ids.length);
    const shares = ids.map((id, i) => ({
      userId: id,
      amount: i === ids.length - 1 ? round2(amount - per * (ids.length - 1)) : per,
    }));
    return shares;
  }
  if (kind === 'percent') {
    const total = ids.reduce((s, id) => s + (values[id] ?? 0), 0);
    if (Math.abs(total - 100) > 0.01) throw new Error(`Percentages must total 100 (got ${total})`);
    const raw = ids.map(id => round2(amount * ((values[id] ?? 0) / 100)));
    const sum = raw.reduce((s, x) => s + x, 0);
    raw[raw.length - 1] = round2(raw[raw.length - 1] + (amount - sum));
    return ids.map((id, i) => ({ userId: id, amount: raw[i] }));
  }
  const shares = ids.map(id => ({ userId: id, amount: round2(values[id] ?? 0) }));
  const sum = shares.reduce((s, x) => s + x.amount, 0);
  if (Math.abs(sum - amount) > 0.01) throw new Error(`Shares total ${sum}, expected ${amount}`);
  return shares;
}