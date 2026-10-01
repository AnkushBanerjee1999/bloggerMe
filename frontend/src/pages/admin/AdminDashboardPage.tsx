import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, MessageSquare, Eye, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatNumber, formatRelative, formatDate } from '@/utils/format';
import { api } from '@/utils/api';

export function AdminDashboardPage() {
  const { users, posts, comments } = useApp();
  const [adminStats, setAdminStats] = useState<{
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    publishedPosts: number;
    draftPosts: number;
    hiddenComments: number;
  } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/stats');
        if (res?.stats) {
          setAdminStats(res.stats);
        }
      } catch (err: any) {
        console.warn('Failed to load admin stats:', err.message);
      }
    }
    loadStats();
  }, []);

  const totalUsersCount = adminStats ? adminStats.totalUsers : users.length;
  const totalPostsCount = adminStats ? adminStats.totalPosts : posts.length;
  const totalCommentsCount = adminStats ? adminStats.totalComments : comments.length;
  const publishedPostsCount = adminStats ? adminStats.publishedPosts : posts.filter(p => p.status === 'published').length;
  const draftPostsCount = adminStats ? adminStats.draftPosts : posts.filter(p => p.status === 'draft').length;
  const hiddenCommentsCount = adminStats ? adminStats.hiddenComments : comments.filter(c => c.status === 'hidden').length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  const stats = [
    { label: 'Total Users', value: totalUsersCount, icon: Users, color: 'blue', link: '/admin/users' },
    { label: 'Total Posts', value: totalPostsCount, icon: FileText, color: 'green', link: '/admin/posts' },
    { label: 'Total Comments', value: totalCommentsCount, icon: MessageSquare, color: 'purple', link: '/admin/comments' },
    { label: 'Total Views', value: formatNumber(totalViews), icon: Eye, color: 'amber', link: '/admin/posts' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-brand-50 text-brand-600 border border-brand-100',
    green: 'bg-success-50 text-success-600 border border-success-100',
    purple: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    amber: 'bg-warning-50 text-warning-600 border border-warning-100',
  };

  // Posts by author
  const postsByAuthor = users.map(u => ({
    user: u,
    count: posts.filter(p => p.authorId === u.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // Recent activity (comments)
  const recentComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide statistics and recent activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.link}>
              <Card hover className="p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${colorMap[stat.color]}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overview */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Content Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100"><FileText size={16} className="text-green-600" /></div>
                <span className="text-sm text-gray-700">Published Posts</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{publishedPostsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100"><FileText size={16} className="text-amber-600" /></div>
                <span className="text-sm text-gray-700">Draft Posts</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{draftPostsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100"><MessageSquare size={16} className="text-red-600" /></div>
                <span className="text-sm text-gray-700">Hidden Comments</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{hiddenCommentsCount}</span>
            </div>
          </div>
        </Card>

        {/* Top authors */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Authors</h3>
            <TrendingUp size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {postsByAuthor.map(({ user, count }, index) => (
              <div key={user.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-4">{index + 1}</span>
                <Avatar src={user.avatar} alt={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
                <Badge color="blue">{count} posts</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Activity size={18} /> Recent Comments</h3>
          <Link to="/admin/comments" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        {recentComments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentComments.map(comment => {
              const post = posts.find(p => p.id === comment.postId);
              return (
                <div key={comment.id} className="flex items-start gap-3 p-4">
                  <Avatar src={comment.authorAvatar} alt={comment.authorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{comment.authorName}</span> commented on{' '}
                      <Link to={post ? `/posts/${post.slug}` : '#'} className="font-medium text-blue-600 hover:text-blue-700">{post?.title}</Link>
                    </p>
                    <p className="text-sm text-gray-500 mt-1 truncate">{comment.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{formatRelative(comment.createdAt)}</span>
                      {comment.status === 'hidden' && <Badge color="red">Hidden</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-gray-500">No recent activity.</p>
        )}
      </Card>
    </div>
  );
}
