import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Search, Trash2, EyeOff, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { formatRelative, truncate } from '@/utils/format';
import type { Comment } from '@/types';

export function ManageCommentsPage() {
  const { comments, posts, deleteComment, hideComment, unhideComment, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const filtered = comments.filter(c => {
    const matchesSearch = c.content.toLowerCase().includes(search.toLowerCase()) || c.authorName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteComment(deleteTarget.id);
    setDeleteTarget(null);
    showToast('Comment deleted');
  };

  const handleToggleHide = async (comment: Comment) => {
    if (comment.status === 'visible') {
      await hideComment(comment.id);
      showToast('Comment hidden');
    } else {
      await unhideComment(comment.id);
      showToast('Comment made visible');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Comments</h1>
        <p className="text-sm text-gray-500 mt-1">Moderate comments across all posts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by content or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          {(['all', 'visible', 'hidden'] as const).map(tab => (
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
        <div className="space-y-3">
          {filtered.map(comment => {
            const post = posts.find(p => p.id === comment.postId);
            return (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar src={comment.authorAvatar} alt={comment.authorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
                      <span className="text-xs text-gray-400">{formatRelative(comment.createdAt)}</span>
                      {comment.status === 'hidden' ? <Badge color="red">Hidden</Badge> : <Badge color="green">Visible</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{truncate(comment.content, 200)}</p>
                    {post && (
                      <Link to={`/posts/${post.slug}`} className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
                        on "{post.title}"
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleHide(comment)}
                      className={`p-2 rounded-lg transition-colors ${comment.status === 'visible' ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                      title={comment.status === 'visible' ? 'Hide' : 'Unhide'}
                    >
                      {comment.status === 'visible' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(comment)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><EmptyState icon={MessageSquare} title="No comments found" description="No comments match your search or filter." /></Card>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Comment"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        Are you sure you want to delete this comment by {deleteTarget?.authorName}? This action cannot be undone.
      </Modal>
    </div>
  );
}
