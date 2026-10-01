import type { ReactNode } from 'react';

type BadgeColor = 'blue' | 'green' | 'red' | 'gray' | 'amber' | 'purple';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md';
}

const colors: Record<BadgeColor, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function Badge({ children, color = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colors[color]} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {children}
    </span>
  );
}
