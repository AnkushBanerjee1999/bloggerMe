import { Link } from 'react-router-dom';
import { FileText, Eye, Heart, MessageSquare, PenSquare, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatNumber, formatDate } from '@/utils/format';

export function UserDashboardPage() {
  const { currentUser, posts, comments } = useApp();

  if (!currentUser) return null;

  const myPosts = posts.filter(p => p.authorId === currentUser.id);
  const myComments = comments.filter(c => c.authorId === currentUser.id);
  const totalViews = myPosts.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);
  const publishedCount = myPosts.filter(p => p.status === 'published').length;
  const draftCount = myPosts.filter(p => p.status === 'draft').length;

  const stats = [
    { label: 'Total Posts', value: myPosts.length, icon: FileText, color: 'blue' },
    { label: 'Total Views', value: formatNumber(totalViews), icon: Eye, color: 'green' },
    { label: 'Total Likes', value: formatNumber(totalLikes), icon: Heart, color: 'red' },
    { label: 'Comments Made', value: myComments.length, icon: MessageSquare, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser.name}. Here's your writing overview.</p>
        </div>
        <Button to="/dashboard/create-post"><PenSquare size={16} /> New Post</Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${colorMap[stat.color]}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Published</h3>
            <Badge color="green">{publishedCount}</Badge>
          </div>
          <p className="text-3xl font-bold text-gray-900">{publishedCount}</p>
          <p className="text-sm text-gray-500 mt-1">articles are live</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Drafts</h3>
            <Badge color="amber">{draftCount}</Badge>
          </div>
          <p className="text-3xl font-bold text-gray-900">{draftCount}</p>
          <p className="text-sm text-gray-500 mt-1">unfinished posts</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Engagement</h3>
            <TrendingUp size={18} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(totalViews + totalLikes)}</p>
          <p className="text-sm text-gray-500 mt-1">views + likes combined</p>
        </Card>
      </div>

      {/* Recent posts */}
      <Card>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Your Recent Posts</h3>
          <Link to="/dashboard/my-posts" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        {myPosts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {myPosts.slice(0, 5).map(post => (
              <Link key={post.id} to={`/posts/${post.slug}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <img src={post.coverImage} alt="" className="h-12 w-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <Badge color={post.status === 'published' ? 'green' : 'amber'}>{post.status}</Badge>
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(post.views)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500 mb-4">You haven't written any posts yet.</p>
            <Button to="/dashboard/create-post" size="sm"><PenSquare size={16} /> Write your first post</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
