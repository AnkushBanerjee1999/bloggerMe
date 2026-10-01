import { Link } from 'react-router-dom';
import { Eye, Heart, Clock } from 'lucide-react';
import type { Post } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatNumber, formatRelative, readingTime, truncate } from '@/utils/format';

interface PostCardProps {
  post: Post;
  showStatus?: boolean;
}

export function PostCard({ post, showStatus = false }: PostCardProps) {
  const getTagStyle = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes('react') || lower.includes('front')) return 'text-brand-700 bg-brand-50 border-brand-200/80';
    if (lower.includes('node') || lower.includes('back')) return 'text-indigo-700 bg-indigo-50 border-indigo-200/80';
    if (lower.includes('devops') || lower.includes('cloud')) return 'text-orange-700 bg-orange-50 border-orange-200/80';
    if (lower.includes('arch') || lower.includes('design')) return 'text-teal-700 bg-teal-50 border-teal-200/80';
    return 'text-brand-700 bg-brand-50 border-brand-200/80';
  };

  return (
    <Link to={`/posts/${post.slug}`} className="group flex flex-col h-full bg-white border border-editorial-border rounded-md overflow-hidden hover:border-brand-400 transition-colors shadow-2xs">
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 border-b border-neutral-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {showStatus && (
          <div className="absolute top-2.5 left-2.5">
            <Badge color={post.status === 'published' ? 'green' : 'amber'}>
              {post.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          {post.tags[0] && (
            <span className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-semibold ${getTagStyle(post.tags[0])}`}>
              {post.tags[0]}
            </span>
          )}
          <span className="text-neutral-300 text-xs">·</span>
          <span className="text-[11px] text-neutral-500 font-medium">
            {readingTime(post.content)}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-neutral-900 leading-snug group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed mb-4 flex-1 line-clamp-2">
          {truncate(post.excerpt, 110)}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-auto text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Avatar src={post.authorAvatar} alt={post.authorName} size="sm" />
            <span className="font-medium text-neutral-800 text-[11px] truncate max-w-[110px] group-hover:text-neutral-900">{post.authorName}</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">{formatRelative(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
