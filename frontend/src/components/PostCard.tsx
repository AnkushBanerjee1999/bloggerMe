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
  return (
    <Link to={`/posts/${post.slug}`} className="block group h-full">
      <div className="h-full flex flex-col rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {showStatus && (
            <div className="absolute top-3 left-3">
              <Badge color={post.status === 'published' ? 'green' : 'amber'}>
                {post.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {post.tags.slice(0, 2).map(tag => (
              <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1 line-clamp-3">
            {truncate(post.excerpt, 120)}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2.5">
              <Avatar src={post.authorAvatar} alt={post.authorName} size="sm" />
              <div>
                <p className="text-xs font-bold text-slate-800">{post.authorName}</p>
                <p className="text-[11px] text-slate-400">{formatRelative(post.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1"><Clock size={13} /> {readingTime(post.content)}</span>
              <span className="flex items-center gap-1"><Eye size={13} /> {formatNumber(post.views)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
