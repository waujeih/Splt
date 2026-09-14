'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/store';
import { useApp } from '@/context/AppContext';
import { Button, Input, Card } from '@/components/ui';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { refresh } = useApp();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    store.signup(name, email, password);
    refresh(); router.push('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-brand-50 to-white">
      <Card className="w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="text-2xl font-black tracking-tight">Create your Splt</div>
          <p className="text-sm text-gray-500 mt-1">Start splitting in seconds.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password (min 6)" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          <Button type="submit" className="w-full" size="lg">Create account</Button>
        </form>
        <div className="text-center text-sm mt-4 text-gray-600">
          Have an account? <Link href="/login" className="text-brand-600 font-semibold">Log in</Link>
        </div>
      </Card>
    </div>
  );
}