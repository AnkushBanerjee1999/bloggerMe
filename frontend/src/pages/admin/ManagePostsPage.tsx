import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Trash2, Eye, Pencil } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatNumber } from '@/utils/format';
import type { Post } from '@/types';

export function ManagePostsPage() {
  const { posts, deletePost, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const filtered = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.authorName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePost(deleteTarget.id);
    setDeleteTarget(null);
    showToast('Post deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Posts</h1>
        <p className="text-sm text-gray-500 mt-1">Oversee all posts across the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          {(['all', 'published', 'draft'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${filter === tab ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Post</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Author</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Views</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={post.coverImage} alt="" className="h-10 w-14 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <Link to={`/posts/${post.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate max-w-xs">
                            {post.title}
                          </Link>
                          <div className="flex gap-1 mt-0.5">
                            {post.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar src={post.authorAvatar} alt={post.authorName} size="sm" />
                        <span className="text-sm text-gray-600">{post.authorName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={post.status === 'published' ? 'green' : 'amber'}>{post.status}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{formatNumber(post.views)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/posts/${post.slug}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/dashboard/edit-post/${post.id}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => setDeleteTarget(post)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card><EmptyState icon={FileText} title="No posts found" description="No posts match your search or filter." /></Card>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Post"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete Post</Button>
          </>
        }
      >
        Are you sure you want to delete "{deleteTarget?.title}"? All associated comments will also be removed.
      </Modal>
    </div>
  );
}
