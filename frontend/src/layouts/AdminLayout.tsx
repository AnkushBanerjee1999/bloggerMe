import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Shield, Users, FileText, MessageSquare, LogOut, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const adminNav = [
  { label: 'Dashboard', to: '/admin', icon: Shield },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Posts', to: '/admin/posts', icon: FileText },
  { label: 'Manage Comments', to: '/admin/comments', icon: MessageSquare },
];

export function AdminLayout() {
  const { currentUser, loading: authLoading, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-64 flex-col bg-gray-900 fixed inset-y-0 left-0">
        <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm">M</span>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Administration</p>
          {adminNav.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(item.to) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-800 p-3">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 transition-colors mb-1">
            <Home size={18} />User Dashboard
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-red-400 hover:bg-gray-800 transition-colors w-full">
            <LogOut size={18} />Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed inset-x-0 top-0 z-40 bg-gray-900 h-14 flex items-center justify-between px-4">
        <span className="font-bold text-white">Admin Panel</span>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-800 text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 inset-y-0 w-64 bg-gray-900 flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
              <span className="font-bold text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-800 text-white"><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1" onClick={() => setMobileOpen(false)}>
              {adminNav.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg ${isActive(item.to) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                    <Icon size={18} />{item.label}
                  </Link>
                );
              })}
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800"><Home size={18} />User Dashboard</Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-red-400 hover:bg-gray-800 w-full"><LogOut size={18} />Logout</button>
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="hidden md:flex sticky top-0 z-30 items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Admin Console</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden h-14" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
