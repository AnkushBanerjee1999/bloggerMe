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
    <div className="min-h-screen bg-paper-100 flex flex-col font-sans text-ink">
      <header className="sticky top-0 z-50 bg-paper-50/95 backdrop-blur-md border-b border-editorial-border transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-serif font-bold text-2xl tracking-tight text-neutral-900 group-hover:text-brand-600 transition-colors">
                blogger<span className="font-sans font-semibold text-brand-600 text-lg tracking-normal">Me</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-brand-700/80 bg-brand-50 border border-brand-200/60 px-1.5 py-0.5 rounded">
                Dispatch
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm tracking-tight transition-colors ${
                    isActive(link.to)
                      ? 'text-brand-600 font-semibold border-b-2 border-brand-600 py-1'
                      : 'text-neutral-600 hover:text-brand-600 py-1'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-brand-600 py-1.5 px-2.5 rounded hover:bg-brand-50 transition-colors"
              title="Search and browse"
            >
              <Search size={14} className="text-neutral-500" />
              <span>Search</span>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
                <NotificationBell />

                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors border border-brand-200"
                  >
                    <Shield size={13} /> Admin
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-neutral-700 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>

                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-2 p-1 rounded hover:bg-brand-50 transition-colors group"
                  title="View Profile"
                >
                  <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
                  <span className="text-xs font-medium text-neutral-800 group-hover:text-brand-600 max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-neutral-400 hover:text-error-600 transition-colors p-1.5 rounded hover:bg-error-50"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-medium text-neutral-700 hover:text-brand-600 px-3 py-1.5 rounded hover:bg-brand-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-xs transition-colors"
                >
                  <PenSquare size={13} /> Start writing
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-1.5 rounded text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-editorial-border bg-paper-50 px-4 py-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-neutral-600 bg-neutral-100 border border-neutral-200"
              >
                <Search size={14} /> Search articles...
              </Link>
            </div>

            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded ${
                  isActive(link.to) ? 'text-neutral-950 bg-neutral-100 font-semibold' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-neutral-200 space-y-1">
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded"
                  >
                    Dashboard
                  </Link>
                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-neutral-800 bg-neutral-100 rounded"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded border border-neutral-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-3 py-2 text-xs font-semibold text-white bg-neutral-900 rounded"
                  >
                    Start writing
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

      <footer className="border-t border-editorial-border bg-paper-50 text-neutral-600 mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="inline-block group">
              <span className="font-serif font-bold text-xl text-neutral-900 group-hover:text-brand-600 tracking-tight transition-colors">
                blogger<span className="font-sans font-semibold text-brand-600 text-sm">Me</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed">
              An independent developer publication covering software engineering, distributed systems, web standards, and modern architecture.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-600">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-brand-600 transition-colors">Articles</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Author Sign In</Link>
            <Link to="/register" className="hover:text-brand-600 transition-colors">Write with Us</Link>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-400">© {new Date().getFullYear()} bloggerMe. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
