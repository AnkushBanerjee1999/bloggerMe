import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-xs focus:ring-brand-500',
  secondary: 'border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 hover:border-brand-300 active:bg-brand-200 focus:ring-brand-500',
  outline: 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 focus:ring-brand-500',
  ghost: 'text-neutral-700 hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100 focus:ring-brand-500',
  danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-xs focus:ring-error-500',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

const baseClass = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

interface ButtonAsButton extends BaseProps {
  to?: undefined;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
}

interface ButtonAsLink extends BaseProps {
  to: string;
  type?: never;
  onClick?: never;
  disabled?: never;
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', size = 'md', children, className = '' } = props;
  const classes = `${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
