import { useState, useRef } from 'react';
import { Save, Camera, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/format';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
];

export function ProfilePage() {
  const { currentUser, posts, updateProfile, showToast } = useApp();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const myPosts = posts.filter(p => p.authorId === currentUser.id);
  const publishedCount = myPosts.filter(p => p.status === 'published').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatar(result);
        showToast('Image loaded! Click "Save Changes" to apply.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name: name.trim() || currentUser.name,
      bio: bio.trim(),
      avatar: avatar.trim(),
    });
    setSaving(false);
    showToast('Profile updated successfully');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your public profile, avatar, and account settings.</p>
      </div>

      {/* Profile preview */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative group">
            <Avatar src={avatar || currentUser.avatar} alt={name || currentUser.name} size="lg" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              title="Upload profile picture"
            >
              <Camera size={15} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{name || currentUser.name}</h2>
            <p className="text-sm text-gray-400">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge color={currentUser.role === 'admin' ? 'purple' : 'blue'}>{currentUser.role}</Badge>
              <span className="text-xs text-gray-400">Joined {formatDate(currentUser.joinedAt || currentUser.createdAt || '')}</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">{bio || currentUser.bio || 'No bio yet.'}</p>
            <div className="flex gap-4 mt-4 text-sm">
              <span><strong className="text-gray-900">{myPosts.length}</strong> <span className="text-gray-400">total posts</span></span>
              <span><strong className="text-gray-900">{publishedCount}</strong> <span className="text-gray-400">published</span></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Edit Profile</h3>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar selection & upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors"
              >
                <Upload size={16} className="text-blue-600" />
                Upload from device
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove picture
                </button>
              )}
            </div>

            {/* Quick avatar presets */}
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-500" /> Or pick a recommended avatar:
              </p>
              <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative rounded-full ring-2 transition-all p-0.5 ${avatar === url ? 'ring-blue-600 scale-105' : 'ring-transparent hover:ring-gray-300'}`}
                  >
                    <img src={url} alt={`Preset ${i + 1}`} className="h-9 w-9 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Or Avatar Image URL"
              name="avatar"
              value={avatar.startsWith('data:image') ? '(Custom uploaded image)' : avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/... or paste image URL"
            />
          </div>

          <Input
            label="Full Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={currentUser.email}
            disabled
            hint="Email address cannot be changed."
          />
          <TextArea
            label="Bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community about yourself..."
            rows={4}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
