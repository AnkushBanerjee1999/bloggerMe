import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PenSquare, LogOut, LayoutDashboard, Shield, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function PublicLayout() {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Blog', to: '/blog' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-base shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
                b
              </span>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                blogger<span className="text-blue-600">Me</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/70 border border-slate-200/60">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    isActive(link.to)
                      ? 'text-blue-600 bg-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* <Link
              to="/search"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-100/80 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60 transition-colors"
              title="Search articles"
            >
              <Search size={14} className="text-slate-400" />
              <span>Search</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">⌘K</kbd>
            </Link> */}

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <NotificationBell />

                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 transition-colors"
                  >
                    <Shield size={14} /> Admin
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>

                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200/60 transition-all group"
                  title="View Profile"
                >
                  <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate group-hover:text-blue-600">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-sm shadow-blue-500/25 active:scale-[0.98] transition-all"
                >
                  <PenSquare size={15} /> Get started
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Link
                to="/search"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200"
              >
                <Search size={15} /> Search articles...
              </Link>
            </div>

            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-xl ${
                  isActive(link.to) ? 'text-blue-600 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 space-y-1">
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 rounded-xl"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-xs"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20">b</span>
            <span className="font-extrabold text-base text-white tracking-tight">blogger<span className="text-blue-500">Me</span></span>
            <span className="text-xs text-slate-500 hidden sm:inline-block">· The modern developer publishing network</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/blog" className="hover:text-white transition-colors">Explore Articles</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Join Free</Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">© {new Date().getFullYear()} bloggerMe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
