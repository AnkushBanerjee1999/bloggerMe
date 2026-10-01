import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Upload } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function CreatePostPage() {
  const { createPost, showToast, currentUser } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.pexels.com/photos/3781338/pexels-photo-3781338.jpeg?auto=compress&cs=tinysrgb&w=1200');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!excerpt.trim()) e.excerpt = 'Excerpt is required';
    if (!content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (publishStatus: 'published' | 'draft') => {
    if (!validate()) return;
    const post = await createPost({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: publishStatus,
    });
    if (post) {
      showToast(publishStatus === 'published' ? 'Post published successfully!' : 'Draft saved successfully!');
      navigate('/dashboard/my-posts');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button to="/dashboard/my-posts" variant="ghost" size="sm"><ArrowLeft size={16} /> Back</Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-sm text-gray-500 mt-1">Write your article and publish it to the community.</p>
      </div>

      <Card className="p-6 space-y-5">
        <Input
          label="Title"
          name="title"
          placeholder="An interesting title for your article"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />

        <Input
          label="Excerpt"
          name="excerpt"
          placeholder="A brief summary that appears in post listings"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          error={errors.excerpt}
          required
          hint="Keep it under 160 characters for best results."
        />

        <TextArea
          label="Content"
          name="content"
          placeholder="Write your article content here. Use double line breaks to separate paragraphs. Support for ## headings and - bullet lists."
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
              id="cover-upload"
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
                    showToast('Cover image uploaded successfully', 'success');
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            <label
              htmlFor="cover-upload"
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
                  htmlFor="cover-upload"
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
          placeholder="React, JavaScript, Tutorial"
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
        <Button variant="outline" onClick={() => handleSubmit('draft')}>
          <Save size={16} /> Save as Draft
        </Button>
        <Button onClick={() => handleSubmit('published')}>
          <Eye size={16} /> Publish
        </Button>
      </div>
    </div>
  );
}
