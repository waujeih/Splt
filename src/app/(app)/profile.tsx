'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { Card, Button, Avatar, Input } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { LogOut, User as UserIcon, Palette, Info } from 'lucide-react';

export default function ProfilePage() {
  const { user, refresh } = useApp();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'INR');
  if (!user) return null;

  const save = () => {
    store.updateProfile({ name: name.trim() || user.name, currency });
    refresh(); setEditOpen(false);
  };

  const logout = () => { store.logout(); refresh(); router.push('/login'); };

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>
      <Card className="p-5 flex items-center gap-4">
        <Avatar name={user.name} url={user.photoUrl} size={56} />
        <div className="flex-1">
          <div className="font-bold">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          <div className="text-xs text-gray-400 mt-0.5">Currency: {user.currency}</div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => { setName(user.name); setCurrency(user.currency); setEditOpen(true); }}>Edit</Button>
      </Card>

      <div className="space-y-2">
        <Row Icon={UserIcon} label="Display name" value={user.name} onClick={() => setEditOpen(true)} />
        <Row Icon={Palette} label="Currency" value={user.currency} onClick={() => setEditOpen(true)} />
        <Row Icon={Info} label="About Splt" value="v1.0 · MVP" />
      </div>

      <Button variant="secondary" className="w-full" onClick={logout}><LogOut className="w-4 h-4" />Log out</Button>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" footer={<>
        <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
        <Button onClick={save}>Save</Button>
      </>}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Currency</label>
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="INR">INR — ₹ Indian Rupee</option>
              <option value="USD">USD — $ US Dollar</option>
              <option value="EUR">EUR — € Euro</option>
              <option value="GBP">GBP — £ British Pound</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ Icon, label, value, onClick }: { Icon: any; label: string; value: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-soft hover:bg-gray-50">
      <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div className="flex-1 text-left">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </button>
  );
}