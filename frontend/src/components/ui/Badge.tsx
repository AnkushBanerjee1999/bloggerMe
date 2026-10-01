import type { ReactNode } from 'react';

type BadgeColor = 'blue' | 'green' | 'red' | 'gray' | 'amber' | 'purple';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md';
}

const colors: Record<BadgeColor, string> = {
  blue: 'bg-brand-50 text-brand-700 border-brand-200',
  green: 'bg-success-50 text-success-700 border-success-100',
  red: 'bg-error-50 text-error-700 border-error-100',
  gray: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  amber: 'bg-warning-50 text-warning-700 border-warning-100',
  purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export function Badge({ children, color = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded border font-medium ${colors[color]} ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}>
      {children}
    </span>
  );
}
