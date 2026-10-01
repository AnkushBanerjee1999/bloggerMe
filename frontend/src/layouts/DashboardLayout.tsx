import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PenSquare, User, LogOut, Home, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Posts', to: '/dashboard/my-posts', icon: FileText },
  { label: 'Create Post', to: '/dashboard/create-post', icon: PenSquare },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
];

export function DashboardLayout() {
  const { currentUser, loading: authLoading, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0">
        <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 font-bold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-semibold">b</span>
            bloggerMe
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">User Panel</p>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          {currentUser.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Shield size={18} />
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors mb-1">
            <Home size={18} />
            Back to site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 transition-colors w-full">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed inset-x-0 top-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
        <Link to="/dashboard" className="font-bold text-gray-900">Dashboard</Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 inset-y-0 w-64 bg-white flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1" onClick={() => setMobileOpen(false)}>
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg ${isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon size={18} />{item.label}
                  </Link>
                );
              })}
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"><Shield size={18} />Admin Panel</Link>
              )}
              <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"><Home size={18} />Back to site</Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 w-full"><LogOut size={18} />Logout</button>
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="hidden md:flex sticky top-0 z-30 items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
          <div>
            <p className="text-sm text-gray-400">Welcome back,</p>
            <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link to="/dashboard/profile" className="flex items-center gap-2">
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
            </Link>
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
