import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const [error, setError] = useState(false);

  const containerSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  const hasValidImage = Boolean(src && src.trim() && !error);

  if (hasValidImage) {
    return (
      <img
        src={src!}
        alt={alt}
        onError={() => setError(true)}
        className={`${containerSizes[size]} rounded-full object-cover ring-1 ring-editorial-border shadow-2xs flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${containerSizes[size]} rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center flex-shrink-0 select-none shadow-2xs ${className}`}
      title={alt || 'User'}
      aria-label={alt || 'User'}
    >
      <User size={iconSizes[size]} className="text-brand-600" />
    </div>
  );
}

