import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Shield, CheckCheck, Trash2, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { AppNotification } from '@/context/AppContext';

export function NotificationBell() {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    setIsOpen(false);

    if (notif.type === 'NEW_COMMENT' && notif.data?.postSlug) {
      navigate(`/posts/${notif.data.postSlug}`);
    } else if (notif.type === 'ROLE_CHANGED') {
      navigate('/dashboard/profile');
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'NEW_COMMENT':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'ROLE_CHANGED':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'COMMENT_STATUS_CHANGED':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    title="Mark all as read"
                    className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={clearNotifications}
                    title="Clear all"
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No notifications yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Real-time alerts will appear here</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notif.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 mt-0.5 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
