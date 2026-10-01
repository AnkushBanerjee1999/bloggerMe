import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Trash2, Upload } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, updatePost, deletePost, showToast, currentUser } = useApp();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const post = posts.find(p => p.id === id);

  const [title, setTitle] = useState(post?.title ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '');
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '');
  const [status, setStatus] = useState<'published' | 'draft'>(post?.status ?? 'draft');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!post) return <Navigate to="/dashboard/my-posts" replace />;
  if (currentUser && post.authorId !== currentUser.id && currentUser.role !== 'admin') {
    return <Navigate to="/dashboard/my-posts" replace />;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!excerpt.trim()) e.excerpt = 'Excerpt is required';
    if (!content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (saveStatus: 'published' | 'draft') => {
    if (!validate()) return;
    const updated = await updatePost(post.id, {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: saveStatus,
    });
    if (updated) {
      showToast(saveStatus === 'published' ? 'Post updated and published!' : 'Draft saved!');
      navigate('/dashboard/my-posts');
    }
  };

  const handleDelete = async () => {
    const success = await deletePost(post.id);
    setDeleteOpen(false);
    if (success) {
      showToast('Post deleted');
      navigate('/dashboard/my-posts');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button to="/dashboard/my-posts" variant="ghost" size="sm"><ArrowLeft size={16} /> Back to My Posts</Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}><Trash2 size={16} /> Delete</Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-sm text-gray-500 mt-1">Update your article content, tags, or publish status.</p>
      </div>

      <Card className="p-6 space-y-5">
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />
        <Input
          label="Excerpt"
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          error={errors.excerpt}
          required
        />
        <TextArea
          label="Content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          rows={12}
          required
        />
        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              id="edit-cover-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                  showToast('Please select a valid image file', 'error');
                  return;
                }
                if (file.size > 2.5 * 1024 * 1024) {
                  showToast('Image size should be less than 2.5MB', 'error');
                  return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                  const result = event.target?.result as string;
                  if (result) {
                    setCoverImage(result);
                    showToast('Cover image updated', 'success');
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            <label
              htmlFor="edit-cover-upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-sm cursor-pointer transition-colors"
            >
              <Upload size={16} className="text-blue-600" />
              Upload Image
            </label>
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Remove Image
              </button>
            )}
          </div>

          {coverImage ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 mt-3 group">
              <img src={coverImage} alt="Cover preview" className="w-full h-48 sm:h-56 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label
                  htmlFor="edit-cover-upload"
                  className="px-3.5 py-1.5 rounded-lg bg-white/90 text-gray-800 text-xs font-semibold shadow hover:bg-white cursor-pointer"
                >
                  Change Image
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Upload a high-quality banner for your article (PNG, JPG, WebP up to 2.5MB).</p>
          )}
        </div>
        <Input
          label="Tags"
          name="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          hint="Separate tags with commas."
        />
        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
        >
          <option value="draft">Draft — save for later</option>
          <option value="published">Published — visible to everyone</option>
        </Select>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => handleSave('draft')}><Save size={16} /> Save as Draft</Button>
        <Button onClick={() => handleSave('published')}><Eye size={16} /> Publish</Button>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Post"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete Permanently</Button>
          </>
        }
      >
        Are you sure you want to permanently delete "{post.title}"? This action cannot be undone.
      </Modal>
    </div>
  );
}
