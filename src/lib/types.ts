export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  currency: string;
  createdAt: number;
};

export type Group = {
  id: string;
  name: string;
  emoji?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: number;
};

export type SplitKind = 'equal' | 'unequal' | 'percent' | 'exact' | 'itemized';

export type ExpenseShare = {
  userId: string;
  amount: number;
};

export type Expense = {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: string;
  category: string;
  date: string;
  split: SplitKind;
  shares: ExpenseShare[];
  notes?: string;
  receiptUrl?: string;
  createdBy: string;
  createdAt: number;
};

export type Settlement = {
  id: string;
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  method: 'cash' | 'upi' | 'card' | 'other';
  note?: string;
  createdAt: number;
};

export type ActivityEvent = {
  id: string;
  groupId?: string;
  type: 'expense_added' | 'expense_edited' | 'expense_deleted' | 'settlement' | 'group_created' | 'member_joined';
  actorId: string;
  message: string;
  createdAt: number;
};

export type Balance = { userId: string; net: number };