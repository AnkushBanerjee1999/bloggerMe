import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PenSquare, Pencil, Trash2, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatNumber } from '@/utils/format';

export function MyPostsPage() {
  const { currentUser, posts, deletePost, showToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!currentUser) return null;

  const myPosts = posts.filter(p => p.authorId === currentUser.id);
  const filtered = filter === 'all' ? myPosts : myPosts.filter(p => p.status === filter);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deletePost(deleteTarget);
    setDeleteTarget(null);
    if (ok) {
      showToast('Post deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your articles, drafts, and published content.</p>
        </div>
        <Button to="/dashboard/create-post"><PenSquare size={16} /> New Post</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {(['all', 'published', 'draft'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${filter === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab} {tab !== 'all' && `(${myPosts.filter(p => p.status === tab).length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <Card>
          <div className="divide-y divide-gray-100">
            {filtered.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <img src={post.coverImage} alt="" className="h-14 w-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/posts/${post.slug}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <Badge color={post.status === 'published' ? 'green' : 'amber'}>{post.status}</Badge>
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(post.views)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link to={`/dashboard/edit-post/${post.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Pencil size={16} />
                  </Link>
                  <button onClick={() => setDeleteTarget(post.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={FileText}
            title={filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
            description="Start writing to share your ideas with the community."
            action={<Button to="/dashboard/create-post" size="sm"><PenSquare size={16} /> Create your first post</Button>}
          />
        </Card>
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
        Are you sure you want to delete this post? All associated comments will also be removed. This action cannot be undone.
      </Modal>
    </div>
  );
}
