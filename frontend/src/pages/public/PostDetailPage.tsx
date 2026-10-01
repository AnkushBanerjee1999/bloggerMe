import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Heart, Clock, Send, Trash2, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Feedback';
import { formatDate, formatNumber, formatRelative, readingTime } from '@/utils/format';
import { api } from '@/utils/api';
import type { Post } from '@/types';

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { posts, comments, currentUser, addComment, deleteComment, showToast, refreshComments } = useApp();
  const [commentText, setCommentText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [post, setPost] = useState<Post | null>(() => posts.find(p => p.slug === slug) || null);
  const [loadingPost, setLoadingPost] = useState(!post);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadPostData() {
      if (!slug) return;
      try {
        setLoadingPost(true);
        const data = await api.get(`/posts/${slug}`);
        const postData = data?.post || data;
        if (mounted && postData) {
          setPost(postData);
          refreshComments(postData.id);
        }
      } catch (err: any) {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoadingPost(false);
      }
    }
    loadPostData();
    return () => { mounted = false; };
  }, [slug, refreshComments]);

  if (notFound) {
    return <Navigate to="/blog" replace />;
  }

  if (loadingPost || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const postComments = comments.filter(c => c.postId === post.id && c.status === 'visible');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;
    const added = await addComment(post.id, commentText.trim());
    if (added) {
      setCommentText('');
      showToast('Comment added successfully');
      refreshComments(post.id);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteTarget) return;
    const ok = await deleteComment(deleteTarget);
    setDeleteTarget(null);
    if (ok) {
      showToast('Comment deleted');
      refreshComments(post.id);
    }
  };

  const contentParagraphs = post.content.split('\n\n');

  return (
    <article className="min-h-screen bg-white">
      {/* Cover */}
      <div className="relative h-[40vh] md:h-[50vh] bg-gray-900 overflow-hidden">
        <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={16} /> Back to blog
            </Link>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(tag => <Badge key={tag} color="blue">{tag}</Badge>)}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Author bar */}
        <div className="flex items-center justify-between py-6 border-b border-gray-100">
          <Link to={`/blog?author=${post.authorId}`} className="flex items-center gap-3">
            <Avatar src={post.authorAvatar} alt={post.authorName} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
              <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock size={14} /> {readingTime(post.content)}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {formatNumber(post.views)}</span>
            <span className="flex items-center gap-1"><Heart size={14} /> {formatNumber(post.likes)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="py-8 space-y-6">
          <p className="text-lg text-gray-600 leading-relaxed font-medium">{post.excerpt}</p>
          {contentParagraphs.map((para, i) => {
            const trimmed = para.trim();
            if (trimmed.startsWith('## ')) {
              return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-2">{trimmed.replace('## ', '')}</h2>;
            }
            if (trimmed.startsWith('- ')) {
              const items = trimmed.split('\n').filter(l => l.startsWith('- ')).map(l => l.replace('- ', ''));
              return (
                <ul key={i} className="space-y-2 pl-4">
                  {items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-600">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (trimmed.startsWith('```')) {
              const code = trimmed.replace(/```(\w+)?\n?/g, '').replace(/```$/g, '');
              return (
                <pre key={i} className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
                  <code>{code}</code>
                </pre>
              );
            }
            return <p key={i} className="text-gray-600 leading-relaxed">{trimmed}</p>;
          })}
        </div>

        {/* Comments */}
        <div className="border-t border-gray-100 py-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare size={20} className="text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Comments ({postComments.length})</h2>
          </div>

          {/* Comment form */}
          {currentUser ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex items-start gap-3">
                <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
                <div className="flex-1">
                  <TextArea
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" size="sm" disabled={!commentText.trim()}>
                      <Send size={14} /> Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <Card className="p-6 mb-8 text-center">
              <p className="text-sm text-gray-500 mb-3">You need to be signed in to leave a comment.</p>
              <Button to="/login" size="sm">Sign in</Button>
            </Card>
          )}

          {/* Comment list */}
          {postComments.length > 0 ? (
            <div className="space-y-4">
              {postComments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar src={comment.authorAvatar} alt={comment.authorName} size="sm" />
                  <div className="flex-1">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{comment.authorName}</p>
                          <p className="text-xs text-gray-400">{formatRelative(comment.createdAt)}</p>
                        </div>
                        {currentUser && (currentUser.id === comment.authorId || currentUser.role === 'admin') && (
                          <button
                            onClick={() => setDeleteTarget(comment.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No comments yet"
              description="Be the first to share your thoughts on this article."
            />
          )}
        </div>
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Comment"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteComment}>Delete</Button>
          </>
        }
      >
        Are you sure you want to delete this comment? This action cannot be undone.
      </Modal>
    </article>
  );
}
