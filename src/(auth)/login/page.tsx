'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { Button, Input, Card } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('you@splt.app');
  const [password, setPassword] = useState('demo1234');
  const [err, setErr] = useState('');
  const router = useRouter();
  const { refresh } = useApp();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = store.login(email, password);
    if (!u) { setErr('Invalid credentials'); return; }
    refresh(); router.push('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-brand-50 to-white">
      <Card className="w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white grid place-items-center font-black text-lg">S</div>
            <span className="text-2xl font-black tracking-tight">Splt</span>
          </div>
          <p className="text-sm text-gray-500">Split expenses. Stay friends.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <Button type="submit" className="w-full" size="lg">Log in</Button>
        </form>
        <div className="my-4 flex items-center gap-2 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" /> OR <div className="h-px flex-1 bg-gray-200" />
        </div>
        <Button variant="secondary" className="w-full" onClick={() => { store.login('you@splt.app',''); refresh(); router.push('/home'); }}>
          Continue as demo user
        </Button>
        <div className="text-center text-sm mt-4 text-gray-600">
          New here? <Link href="/signup" className="text-brand-600 font-semibold">Create account</Link>
        </div>
      </Card>
    </div>
  );
}