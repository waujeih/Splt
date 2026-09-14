'use client';
import { useState } from 'react';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { GroupCard } from '@/components/GroupCard';
import { Button, Input, Empty, Avatar } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { Plus, Users } from 'lucide-react';

export default function GroupsPage() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎉');
  const [selected, setSelected] = useState<string[]>([]);
  const [, force] = useState(0);
  if (!user) return null;

  const groups = store.groups();
  const others = store.allUsers().filter(u => u.id !== user.id);

  const create = () => {
    if (!name.trim()) return;
    store.createGroup({ name: name.trim(), emoji, memberIds: selected });
    setName(''); setEmoji('🎉'); setSelected([]); setOpen(false);
    force(n => n + 1);
  };

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="px-4 pt-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><Users className="w-5 h-5 text-brand-600" /><h1 className="text-xl font-bold">Groups</h1></div>
          <p className="text-xs text-gray-500">{groups.length} active</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />New</Button>
      </header>

      <div className="space-y-2">
        {groups.length === 0 && <Empty icon="👥" title="No groups yet" hint="Create a group for your trip, flat, or friend circle." />}
        {groups.map(g => <GroupCard key={g.id} group={g} currency={user.currency} />)}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New group" footer={<>
        <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={create}>Create group</Button>
      </>}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Group name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Goa Vacation" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Icon</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {['🎉','🌴','🏠','🎂','✈️','🍕','🎮','🏖️','🎓','💼'].map(e => (
                <button key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl text-xl ${emoji===e?'bg-brand-100 ring-2 ring-brand-500':'bg-gray-100'}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Add members</label>
            <div className="mt-1 space-y-1.5">
              {others.map(u => (
                <button key={u.id} onClick={() => toggle(u.id)} className={`w-full flex items-center gap-3 p-2 rounded-xl border transition ${selected.includes(u.id)?'border-brand-500 bg-brand-50':'border-gray-200'}`}>
                  <Avatar name={u.name} url={u.photoUrl} size={32} />
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 ${selected.includes(u.id)?'bg-brand-600 border-brand-600':'border-gray-300'}`} />
                </button>
              ))}
              {others.length === 0 && <div className="text-xs text-gray-500">No other users yet (demo mode).</div>}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}