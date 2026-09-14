import type { User, Group, Expense, Settlement, ActivityEvent } from './types';
import { buildShares, computeBalances, simplifyDebts } from './calculations';

const K = {
  users: 'splt:users',
  current: 'splt:currentUserId',
  groups: 'splt:groups',
  expenses: 'splt:expenses',
  settlements: 'splt:settlements',
  activity: 'splt:activity',
};

const read = <T>(k: string, fb: T): T => {
  if (typeof window === 'undefined') return fb;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
};
const write = (k: string, v: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(k, JSON.stringify(v));
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function seedDemo() {
  if (read<string | null>(K.current, null)) return;
  const you: User = { id: 'u_you', name: 'You', email: 'you@splt.app', currency: 'INR', createdAt: Date.now() };
  const arjun: User = { id: 'u_arj', name: 'Arjun', email: 'arjun@demo.app', currency: 'INR', createdAt: Date.now() };
  const priya: User = { id: 'u_pri', name: 'Priya', email: 'priya@demo.app', currency: 'INR', createdAt: Date.now() };
  const riya:  User = { id: 'u_riy', name: 'Riya',  email: 'riya@demo.app',  currency: 'INR', createdAt: Date.now() };
  const kabir: User = { id: 'u_kab', name: 'Kabir', email: 'kabir@demo.app', currency: 'INR', createdAt: Date.now() };
  write(K.users, [you, arjun, priya, riya, kabir]);
  write(K.current, you.id);

  const g1: Group = { id: 'g_ker', name: 'Kerala Trip',   emoji: '🌴', ownerId: you.id, memberIds: [you.id, arjun.id, priya.id, riya.id], createdAt: Date.now() - 86400000 * 10 };
  const g2: Group = { id: 'g_room',name: 'Roommates',     emoji: '🏠', ownerId: you.id, memberIds: [you.id, kabir.id, arjun.id], createdAt: Date.now() - 86400000 * 40 };
  const g3: Group = { id: 'g_bday',name: "Riya's Birthday", emoji: '🎂', ownerId: riya.id, memberIds: [you.id, priya.id, riya.id, kabir.id], createdAt: Date.now() - 86400000 * 3 };
  write(K.groups, [g1, g2, g3]);

  const now = Date.now();
  const mkExp = (id: string, g: string, title: string, amount: number, paidBy: string, category: string, daysAgo: number, splitKind: Expense['split'], values?: Record<string, number>): Expense => {
    const group = [g1, g2, g3].find(x => x.id === g)!;
    const shares = buildShares(amount, group.memberIds, splitKind, values ?? {});
    return { id, groupId: g, title, amount, paidBy, category, date: new Date(now - daysAgo * 86400000).toISOString().slice(0,10), split: splitKind, shares, createdBy: paidBy, createdAt: now - daysAgo * 86400000 };
  };

  const expenses: Expense[] = [
    mkExp('e1', 'g_ker', 'Houseboat stay — Alleppey', 12000, you.id,  'accommodation', 8, 'equal'),
    mkExp('e2', 'g_ker', 'Kariman beach shacks',        2400, arjun.id, 'food',          7, 'equal'),
    mkExp('e3', 'g_ker', 'Cab to Munnar',               3600, priya.id,'transport',     6, 'equal'),
    mkExp('e4', 'g_ker', 'Tea plantation entry',         800, you.id,  'entertainment', 5, 'percent', { u_you: 40, u_arj: 20, u_pri: 20, u_riy: 20 }),
    mkExp('e5', 'g_ker', 'Groceries for villa',         2200, riya.id, 'groceries',     4, 'equal'),
    mkExp('e6', 'g_room','Rent — September',           24000, you.id,  'accommodation', 2, 'equal'),
    mkExp('e7', 'g_room','Internet bill',               1200, kabir.id,'utilities',     5, 'equal'),
    mkExp('e8', 'g_room','Milk + bread',                 180, arjun.id, 'groceries',     1, 'exact', { u_you: 80, u_kab: 60, u_arj: 40 }),
    mkExp('e9', 'g_bday','Cake',                        1500, you.id,  'food',          2, 'equal'),
    mkExp('e10','g_bday','Decorations',                  900, priya.id,'shopping',      2, 'equal'),
  ];
  write(K.expenses, expenses);

  const settlements: Settlement[] = [
    { id: 's1', groupId: 'g_ker', payerId: arjun.id, receiverId: you.id, amount: 600, method: 'upi', createdAt: now - 86400000 * 3 },
  ];
  write(K.settlements, settlements);

  const activity: ActivityEvent[] = expenses.map(e => ({
    id: 'a_' + e.id, groupId: e.groupId, type: 'expense_added', actorId: e.paidBy,
    message: `${userById(e.paidBy).name} added "${e.title}"`, createdAt: e.createdAt,
  }));
  write(K.activity, activity);
}

function userById(id: string): User {
  const users = read<User[]>(K.users, []);
  return users.find(u => u.id === id) ?? { id, name: 'Unknown', email: '', currency: 'INR', createdAt: 0 };
}

export const store = {
  currentUser(): User | null {
    const id = read<string | null>(K.current, null);
    if (!id) return null;
    return read<User[]>(K.users, []).find(u => u.id === id) ?? null;
  },
  login(email: string, _password: string): User | null {
    const users = read<User[]>(K.users, []);
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (u) { write(K.current, u.id); return u; }
    const newU: User = { id: uid(), name: email.split('@')[0], email, currency: 'INR', createdAt: Date.now() };
    write(K.users, [...users, newU]);
    write(K.current, newU.id);
    return newU;
  },
  signup(name: string, email: string, _password: string): User {
    const users = read<User[]>(K.users, []);
    const newU: User = { id: uid(), name, email, currency: 'INR', createdAt: Date.now() };
    write(K.users, [...users, newU]);
    write(K.current, newU.id);
    return newU;
  },
  logout() { write(K.current, null); },
  updateProfile(patch: Partial<User>) {
    const me = this.currentUser(); if (!me) return;
    const users = read<User[]>(K.users, []);
    write(K.users, users.map(u => u.id === me.id ? { ...u, ...patch } : u));
  },
  allUsers(): User[] { return read<User[]>(K.users, []); },

  groups(): Group[] {
    const me = this.currentUser(); if (!me) return [];
    return read<Group[]>(K.groups, []).filter(g => g.memberIds.includes(me.id));
  },
  group(id: string): Group | undefined { return read<Group[]>(K.groups, []).find(g => g.id === id); },
  createGroup(data: { name: string; emoji?: string; memberIds: string[] }): Group {
    const me = this.currentUser()!;
    const g: Group = { id: uid(), name: data.name, emoji: data.emoji, ownerId: me.id, memberIds: Array.from(new Set([me.id, ...data.memberIds])), createdAt: Date.now() };
    write(K.groups, [...read<Group[]>(K.groups, []), g]);
    this.logActivity({ groupId: g.id, type: 'group_created', actorId: me.id, message: `${me.name} created "${g.name}"` });
    return g;
  },
  leaveGroup(id: string) {
    const me = this.currentUser()!;
    const groups = read<Group[]>(K.groups, []);
    write(K.groups, groups.map(g => g.id === id ? { ...g, memberIds: g.memberIds.filter(x => x !== me.id) } : g));
  },
  deleteGroup(id: string) {
    write(K.groups, read<Group[]>(K.groups, []).filter(g => g.id !== id));
    write(K.expenses, read<Expense[]>(K.expenses, []).filter(e => e.groupId !== id));
    write(K.settlements, read<Settlement[]>(K.settlements, []).filter(s => s.groupId !== id));
  },

  expenses(groupId?: string): Expense[] {
    const all = read<Expense[]>(K.expenses, []);
    return groupId ? all.filter(e => e.groupId === groupId) : all;
  },
  expense(id: string): Expense | undefined { return read<Expense[]>(K.expenses, []).find(e => e.id === id); },
   addExpense(data: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>):
   Expense{
    const me = this.currentUser()!;
    const e: Expense = { ...data, id: uid(), createdBy: me.id, createdAt: Date.now() };
    write(K.expenses, [...read<Expense[]>(K.expenses, []), e]);
    this.logActivity({ groupId: e.groupId, type: 'expense_added', actorId: me.id, message: `${me.name} added "${e.title}"` });
    return e;
  },
  updateExpense(id: string, patch: Partial<Expense>) {
    write(K.expenses, read<Expense[]>(K.expenses, []).map(e => e.id === id ? { ...e, ...patch } : e));
  },
  deleteExpense(id: string) {
    write(K.expenses, read<Expense[]>(K.expenses, []).filter(e => e.id !== id));
  },

  settlements(groupId?: string): Settlement[] {
    const all = read<Settlement[]>(K.settlements, []);
    return groupId ? all.filter(s => s.groupId === groupId) : all;
  },
  addSettlement(data: Omit<Settlement, 'id' | 'createdAt'>): Settlement {
    const me = this.currentUser()!;
    const s: Settlement = { ...data, id: uid(), createdAt: Date.now() };
    write(K.settlements, [...read<Settlement[]>(K.settlements, []), s]);
    this.logActivity({ groupId: s.groupId, type: 'settlement', actorId: me.id, message: `${me.name} settled ₹${s.amount}` });
    return s;
  },
  deleteSettlement(id: string) {
    write(K.settlements, read<Settlement[]>(K.settlements, []).filter(s => s.id !== id));
  },

  activity(): ActivityEvent[] { return read<ActivityEvent[]>(K.activity, []).sort((a,b) => b.createdAt - a.createdAt); },
  logActivity(e: Omit<ActivityEvent, 'id' | 'createdAt'>) {
    const ev: ActivityEvent = { ...e, id: uid(), createdAt: Date.now() };
    write(K.activity, [ev, ...read<ActivityEvent[]>(K.activity, [])]);
  },

  balances(groupId: string) { return computeBalances(this.expenses(groupId), this.settlements(groupId), groupId); },
  simplified(groupId: string) { return simplifyDebts(this.balances(groupId)); },
  userById,
};