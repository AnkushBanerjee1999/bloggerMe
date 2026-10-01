import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
