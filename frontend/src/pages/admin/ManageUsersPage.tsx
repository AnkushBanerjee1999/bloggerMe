import { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, Trash2, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/utils/format';
import type { User } from '@/types';

export function ManageUsersPage() {
  const { users, posts, comments, banUser, unbanUser, deleteUser, updateUserRole, showToast, currentUser, refreshUsers } = useApp();
  const [search, setSearch] = useState('');
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<{ user: User; nextRole: 'user' | 'admin' } | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Fetch users when this page mounts (only if not already loaded)
  useEffect(() => {
    if (users.length === 0) refreshUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleBanToggle = async () => {
    if (!banTarget) return;
    if (banTarget.banned) {
      await unbanUser(banTarget.id);
      showToast(`Unbanned ${banTarget.name}`);
    } else {
      await banUser(banTarget.id);
      showToast(`Banned ${banTarget.name}`);
    }
    setBanTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    showToast(`User ${deleteTarget.name} deleted`);
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setRoleLoading(true);
    const success = await updateUserRole(roleTarget.user.id, roleTarget.nextRole);
    setRoleLoading(false);
    if (success) {
      setRoleTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-sm text-gray-500 mt-1">View, ban, or remove users from the platform.</p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      {filtered.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Posts</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Comments</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => {
                  const userPosts = posts.filter(p => p.authorId === user.id).length;
                  const userComments = comments.filter(c => c.authorId === user.id).length;
                  const isSelf = currentUser?.id === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} alt={user.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge color={user.role === 'admin' ? 'purple' : 'gray'}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{userPosts}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{userComments}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">{formatDate(user.joinedAt || user.createdAt || '')}</td>
                      <td className="px-4 py-3">
                        {user.banned ? <Badge color="red">Banned</Badge> : <Badge color="green">Active</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setRoleTarget({ user, nextRole: user.role === 'admin' ? 'user' : 'admin' })}
                                className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'text-purple-600 hover:bg-purple-50' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`}
                                title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              >
                                <Shield size={16} />
                              </button>
                              <button
                                onClick={() => setBanTarget(user)}
                                className={`p-2 rounded-lg transition-colors ${user.banned ? 'text-green-500 hover:bg-green-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                title={user.banned ? 'Unban' : 'Ban'}
                              >
                                {user.banned ? <CheckCircle size={16} /> : <Ban size={16} />}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(user)}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {isSelf && <span className="text-xs text-gray-300">You</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card><EmptyState icon={Users} title="No users found" description="No users match your search criteria." /></Card>
      )}

      {/* Role Change Modal */}
      <Modal
        open={!!roleTarget}
        onClose={() => !roleLoading && setRoleTarget(null)}
        title={roleTarget?.nextRole === 'admin' ? 'Promote to Administrator' : 'Demote to Standard User'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRoleTarget(null)} disabled={roleLoading}>Cancel</Button>
            <Button
              variant={roleTarget?.nextRole === 'admin' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleRoleChange}
              disabled={roleLoading}
            >
              {roleLoading ? 'Updating...' : roleTarget?.nextRole === 'admin' ? 'Promote to Admin' : 'Demote to User'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {roleTarget?.nextRole === 'admin' ? (
              <>
                Are you sure you want to promote <strong>{roleTarget.user.name}</strong> ({roleTarget.user.email}) to an <strong>Administrator</strong>? They will gain full administrative privileges including user moderation, comments moderation, and system settings.
              </>
            ) : (
              <>
                Are you sure you want to demote <strong>{roleTarget?.user.name}</strong> ({roleTarget?.user.email}) to a <strong>Standard User</strong>? They will lose access to the Admin Dashboard and all administrative controls.
              </>
            )}
          </p>
        </div>
      </Modal>

      <Modal
        open={!!banTarget}
        onClose={() => setBanTarget(null)}
        title={banTarget?.banned ? 'Unban User' : 'Ban User'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setBanTarget(null)}>Cancel</Button>
            <Button variant={banTarget?.banned ? 'primary' : 'danger'} size="sm" onClick={handleBanToggle}>
              {banTarget?.banned ? 'Unban User' : 'Ban User'}
            </Button>
          </>
        }
      >
        {banTarget?.banned
          ? `Are you sure you want to unban ${banTarget.name}? They will be able to log in and post again.`
          : `Are you sure you want to ban ${banTarget?.name}? They will no longer be able to log in.`}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete User</Button>
          </>
        }
      >
        Are you sure you want to permanently delete {deleteTarget?.name}? This will remove them from the platform. This action cannot be undone.
      </Modal>
    </div>
  );
}
