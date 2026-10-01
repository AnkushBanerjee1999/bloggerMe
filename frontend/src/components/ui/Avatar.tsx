import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const [error, setError] = useState(false);
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };

  // Calculate clean initials from alt name
  const initials = (alt || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'U';

  const hasValidImage = Boolean(src && src.trim() && !error);

  if (hasValidImage) {
    return (
      <img
        src={src!}
        alt={alt}
        onError={() => setError(true)}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold flex items-center justify-center ring-2 ring-white shadow-sm flex-shrink-0 select-none ${className}`}
      title={alt}
    >
      {initials}
    </div>
  );
}
