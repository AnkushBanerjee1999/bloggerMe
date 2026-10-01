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
    <article className="min-h-screen bg-paper-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 pb-6">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-600 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to articles
        </Link>
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs font-mono uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded font-semibold">
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 leading-[1.2] mb-6">
          {post.title}
        </h1>

        {/* Author byline */}
        <div className="flex items-center justify-between py-4 border-t border-b border-editorial-border">
          <Link to={`/blog?author=${post.authorId}`} className="flex items-center gap-3 group">
            <Avatar src={post.authorAvatar} alt={post.authorName} size="md" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors">{post.authorName}</p>
              <p className="text-[11px] text-neutral-400">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
            <span className="flex items-center gap-1 text-neutral-600"><Clock size={13} className="text-brand-600" /> {readingTime(post.content)}</span>
            <span className="flex items-center gap-1 text-neutral-600"><Eye size={13} className="text-brand-600" /> {formatNumber(post.views)}</span>
            <span className="flex items-center gap-1 text-neutral-600"><Heart size={13} className="text-error-500" /> {formatNumber(post.likes)}</span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 mb-8">
          <div className="aspect-[16/9] overflow-hidden rounded-md border border-editorial-border bg-neutral-100">
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Content */}
        <div className="py-6 space-y-6 text-neutral-800 leading-relaxed font-sans text-base sm:text-lg">
          <p className="font-serif italic text-lg sm:text-xl text-neutral-700 leading-relaxed pb-4 border-b border-neutral-200">
            {post.excerpt}
          </p>
          {contentParagraphs.map((para, i) => {
            const trimmed = para.trim();
            if (trimmed.startsWith('## ')) {
              return <h2 key={i} className="font-serif text-2xl font-bold text-neutral-950 mt-10 mb-3">{trimmed.replace('## ', '')}</h2>;
            }
            if (trimmed.startsWith('- ')) {
              const items = trimmed.split('\n').filter(l => l.startsWith('- ')).map(l => l.replace('- ', ''));
              return (
                <ul key={i} className="space-y-2 pl-4 text-sm sm:text-base">
                  {items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-neutral-700">
                      <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (trimmed.startsWith('```')) {
              const code = trimmed.replace(/```(\w+)?\n?/g, '').replace(/```$/g, '');
              return (
                <pre key={i} className="bg-neutral-900 text-neutral-100 rounded-md p-4 overflow-x-auto text-xs sm:text-sm font-mono my-4 border border-neutral-800">
                  <code>{code}</code>
                </pre>
              );
            }
            return <p key={i} className="text-neutral-700 leading-relaxed text-sm sm:text-base">{trimmed}</p>;
          })}
        </div>

        {/* Comments */}
        <div className="border-t border-editorial-border py-10 mt-10">
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
