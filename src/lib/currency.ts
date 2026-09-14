const FORMATS: Record<string, { symbol: string; locale: string; decimals: number }> = {
  INR: { symbol: '₹', locale: 'en-IN', decimals: 0 },
  USD: { symbol: '$', locale: 'en-US', decimals: 2 },
  EUR: { symbol: '€', locale: 'de-DE', decimals: 2 },
  GBP: { symbol: '£', locale: 'en-GB', decimals: 2 },
};

export function formatMoney(amount: number, currency = 'INR', showSign = false): string {
  const fmt = FORMATS[currency] ?? FORMATS.INR;
  const abs = Math.abs(amount);
  const str = new Intl.NumberFormat(fmt.locale, {
    minimumFractionDigits: fmt.decimals,
    maximumFractionDigits: fmt.decimals,
  }).format(abs);
  const sign = showSign ? (amount > 0 ? '+' : amount < 0 ? '−' : '') : amount < 0 ? '−' : '';
  return `${sign}${fmt.symbol}${str}`;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const CATEGORIES = [
  { id: 'food',          label: 'Food',          emoji: '🍔' },
  { id: 'transport',     label: 'Transport',     emoji: '🚕' },
  { id: 'accommodation', label: 'Stay',          emoji: '🏨' },
  { id: 'shopping',      label: 'Shopping',      emoji: '🛍️' },
  { id: 'entertainment', label: 'Fun',           emoji: '🎬' },
  { id: 'groceries',     label: 'Groceries',     emoji: '🛒' },
  { id: 'utilities',     label: 'Utilities',     emoji: '💡' },
  { id: 'other',         label: 'Other',         emoji: '📦' },
] as const;

export function categoryMeta(id: string) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}