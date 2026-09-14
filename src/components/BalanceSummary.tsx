import { formatMoney } from '@/lib/currency';
import { Card } from './ui';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';

export function BalanceSummary({ owe, owed, net, currency }: { owe: number; owed: number; net: number; currency: string }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <Card className="p-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />You owe</div>
        <div className="mt-1 text-lg font-bold text-rose-600">{formatMoney(owe, currency)}</div>
      </Card>
      <Card className="p-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />Owed to you</div>
        <div className="mt-1 text-lg font-bold text-emerald-600">{formatMoney(owed, currency)}</div>
      </Card>
      <Card className="p-3 bg-brand-600 text-white border-brand-600">
        <div className="flex items-center gap-1.5 text-xs text-brand-100"><Wallet className="w-3.5 h-3.5" />Net</div>
        <div className="mt-1 text-lg font-bold">{formatMoney(net, currency, true)}</div>
      </Card>
    </div>
  );
}