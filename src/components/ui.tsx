import { ButtonHTMLAttributes, forwardRef, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button ref={ref} className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none',
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'md' && 'px-4 py-2.5 text-sm',
      size === 'lg' && 'px-5 py-3 text-base',
      variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
      variant === 'secondary' && 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50',
      variant === 'ghost' && 'text-gray-700 hover:bg-gray-100',
      variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700',
      className,
    )} {...props} />
  )
);
Button.displayName = 'Button';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={clsx(
      'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-gray-400',
      'focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
      className,
    )} {...props} />
  )
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={clsx(
      'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition',
      'focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
      className,
    )} {...props}>{children}</select>
  )
);
Select.displayName = 'Select';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('rounded-2xl bg-white shadow-soft border border-gray-100', className)} {...props} />
);

export const Chip: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span className={clsx('inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700', className)} {...props} />
);

export const Avatar: React.FC<{ name: string; url?: string; size?: number; className?: string }> = ({ name, url, size = 36, className }) => {
  const initials = name.split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase();
  const colors = ['bg-brand-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-sky-500','bg-violet-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (url) return <img src={url} alt={name} style={{ width: size, height: size }} className={clsx('rounded-full object-cover', className)} />;
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.4 }} className={clsx('rounded-full flex items-center justify-center text-white font-semibold', color, className)}>
      {initials}
    </div>
  );
};

export const Empty: React.FC<{ icon?: string; title: string; hint?: string }> = ({ icon = '📭', title, hint }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-3">{icon}</div>
    <div className="font-semibold text-gray-900">{title}</div>
    {hint && <div className="text-sm text-gray-500 mt-1 max-w-xs">{hint}</div>}
  </div>
);