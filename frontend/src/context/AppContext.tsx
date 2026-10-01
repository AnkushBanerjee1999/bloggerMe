import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User, Post, Comment } from '@/types';
import { api, tokenStorage, ApiError } from '@/utils/api';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AppNotification {
  id: string;
  type: 'NEW_COMMENT' | 'COMMENT_STATUS_CHANGED' | 'ROLE_CHANGED';
  title: string;
  message: string;
  data: Record<string, any>;
  createdAt: string;
  read?: boolean;
}

interface AppContextValue {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  handleOAuthSuccess: (accessToken: string, refreshToken: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: 'admin' | 'user') => void;
  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) => Promise<void>;

  notifications: AppNotification[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  users: User[];
  posts: Post[];
  comments: Comment[];

  refreshPosts: () => Promise<void>;
  refreshComments: (postId?: string) => Promise<void>;
  refreshUsers: () => Promise<void>;

  createPost: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'authorId' | 'authorName' | 'authorAvatar' | 'slug'>) => Promise<Post | null>;
  updatePost: (id: string, data: Partial<Post>) => Promise<Post | null>;
  deletePost: (id: string) => Promise<boolean>;

  addComment: (postId: string, content: string) => Promise<Comment | null>;
  deleteComment: (id: string) => Promise<boolean>;
  hideComment: (id: string) => Promise<void>;
  unhideComment: (id: string) => Promise<void>;

  banUser: (id: string) => Promise<void>;
  unbanUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserRole: (id: string, role: 'user' | 'admin') => Promise<boolean>;

  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('blog_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = genId('t');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch posts from real backend
  const refreshPosts = useCallback(async () => {
    try {
      // If admin, load all posts; otherwise load published posts
      const endpoint = currentUser?.role === 'admin'
        ? '/posts?limit=100'
        : '/posts?limit=100&status=published';
      const data = await api.get(endpoint);
      const items: Post[] = (data?.items || []).map((p: any) => ({
        ...p,
        coverImage: p.coverImage || 'https://images.pexels.com/photos/3781338/pexels-photo-3781338.jpeg?auto=compress&cs=tinysrgb&w=1200',
      }));

      // If logged in as standard user, also fetch user's own draft posts
      if (currentUser && currentUser.role !== 'admin') {
        try {
          const myDraftsData = await api.get(`/posts?limit=100&authorId=${currentUser.id}&status=draft`);
          const myDrafts: Post[] = (myDraftsData?.items || []).map((p: any) => ({
            ...p,
            coverImage: p.coverImage || 'https://images.pexels.com/photos/3781338/pexels-photo-3781338.jpeg?auto=compress&cs=tinysrgb&w=1200',
          }));
          const existingIds = new Set(items.map((i) => i.id));
          for (const draft of myDrafts) {
            if (!existingIds.has(draft.id)) {
              items.push(draft);
            }
          }
        } catch {
          // Ignore draft fetch errors
        }
      }

      setPosts(items);
    } catch (err: any) {
      console.warn('Could not load posts from API:', err.message);
    }
  }, [currentUser]);

  // Fetch comments (if postId provided, or admin comments)
  const refreshComments = useCallback(async (postId?: string) => {
    try {
      if (postId) {
        const data = await api.get(`/comments/post/${postId}`);
        const items = data?.comments || [];
        setComments((prev) => {
          const others = prev.filter((c) => c.postId !== postId);
          return [...others, ...items];
        });
      } else if (currentUser?.role === 'admin') {
        const data = await api.get('/admin/comments?limit=100');
        const rawItems = data?.items || [];
        // Normalize raw Mongoose populated docs to frontend Comment type
        const normalized = rawItems.map((item: any) => ({
          id: item.id || item._id,
          content: item.content,
          postId: typeof item.post === 'object' ? (item.post?._id || '') : (item.postId || item.post || ''),
          postTitle: item.post?.title || '',
          authorId: typeof item.author === 'object' ? (item.author?._id || '') : (item.authorId || item.author || ''),
          authorName: item.author?.name || item.authorName || 'Unknown',
          authorAvatar: item.author?.avatar || item.authorAvatar || '',
          status: item.status || 'visible',
          createdAt: item.createdAt,
        }));
        setComments(normalized);
      }
    } catch (err: any) {
      console.warn('Could not load comments from API:', err.message);
    }
  }, [currentUser?.role]);

  // Fetch admin user list
  const refreshUsers = useCallback(async () => {
    if (currentUser?.role !== 'admin') return;
    try {
      const data = await api.get('/users?limit=100');
      setUsers(data?.users || []);
    } catch (err: any) {
      console.warn('Could not load users from API:', err.message);
    }
  }, [currentUser?.role]);

  // Check current session on mount via /auth/me
  useEffect(() => {
    async function initAuth() {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get('/auth/me');
        if (data?.user) {
          const u: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            avatar: data.user.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(data.user.email)}`,
            bio: data.user.bio || '',
            banned: data.user.banned,
            createdAt: data.user.createdAt,
            joinedAt: data.user.createdAt,
          };
          setCurrentUser(u);
          localStorage.setItem('blog_current_user', JSON.stringify(u));
        }
      } catch (err) {
        // Token invalid or expired
        tokenStorage.clearTokens();
        setCurrentUser(null);
        localStorage.removeItem('blog_current_user');
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // Load public posts on initial load
  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  // Load admin data (users + comments) when user is admin
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      refreshUsers();
      refreshComments();
    }
  }, [currentUser?.role, refreshUsers, refreshComments]);

  // Socket.io Real-time connection & notification listener
  useEffect(() => {
    if (!currentUser) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();
    if (!socket) return;

    const handleNotification = (notif: AppNotification) => {
      setNotifications((prev) => [{ ...notif, read: false }, ...prev]);
      showToast(notif.message, 'info');

      // If user's role was changed in real-time by admin, update reactive state
      if (notif.type === 'ROLE_CHANGED' && notif.data?.role) {
        setCurrentUser((prev) => (prev ? { ...prev, role: notif.data.role } : null));
        const stored = localStorage.getItem('blog_current_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.role = notif.data.role;
            localStorage.setItem('blog_current_user', JSON.stringify(parsed));
          } catch {}
        }
      }

      // If a comment was added or updated, refresh comments/posts
      if (notif.type === 'NEW_COMMENT' || notif.type === 'COMMENT_STATUS_CHANGED') {
        refreshComments(notif.data?.postId);
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [currentUser, showToast, refreshComments]);

  // Real backend Login
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data?.tokens?.accessToken) {
        tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      }
      const rawUser = data.user;
      const user: User = {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role,
        avatar: rawUser.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(rawUser.email)}`,
        bio: rawUser.bio || '',
        banned: rawUser.banned,
        createdAt: rawUser.createdAt,
        joinedAt: rawUser.createdAt,
      };
      setCurrentUser(user);
      localStorage.setItem('blog_current_user', JSON.stringify(user));
      await refreshPosts();
      return { success: true, message: `Welcome back, ${user.name}!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed. Please check your credentials.' };
    }
  }, [refreshPosts]);

  // Real backend Registration
  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await api.post('/auth/register', { name, email, password });
      if (data?.tokens?.accessToken) {
        tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      }
      const rawUser = data.user;
      const user: User = {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role,
        avatar: rawUser.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(rawUser.email)}`,
        bio: rawUser.bio || '',
        banned: rawUser.banned,
        createdAt: rawUser.createdAt,
        joinedAt: rawUser.createdAt,
      };
      setCurrentUser(user);
      localStorage.setItem('blog_current_user', JSON.stringify(user));
      return { success: true, message: `Welcome to the community, ${name}!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  }, []);

  // Real backend OAuth Session Establishment
  const handleOAuthSuccess = useCallback(async (accessToken: string, refreshToken: string, rawUser: any) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    const user: User = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      role: rawUser.role,
      avatar: rawUser.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(rawUser.email)}`,
      bio: rawUser.bio || '',
      banned: rawUser.banned,
      createdAt: rawUser.createdAt,
      joinedAt: rawUser.createdAt,
    };
    setCurrentUser(user);
    localStorage.setItem('blog_current_user', JSON.stringify(user));
    await refreshPosts();
  }, [refreshPosts]);

  // Real backend Logout
  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore network errors on logout
    } finally {
      disconnectSocket();
      setNotifications([]);
      tokenStorage.clearTokens();
      setCurrentUser(null);
      localStorage.removeItem('blog_current_user');
    }
  }, []);

  // Role switch is disabled in production — role is strictly managed by backend RBAC
  const switchRole = useCallback((_role: 'admin' | 'user') => {
    console.warn('[RBAC] Client-side role spoofing is disabled. Roles are enforced strictly by the backend.');
  }, []);

  // Real backend Profile Update
  const updateProfile = useCallback(async (data: { name?: string; bio?: string; avatar?: string }) => {
    if (!currentUser) return;
    try {
      const res = await api.put('/users/me', data);
      const rawUser = res?.user || res;
      const updated: User = {
        ...currentUser,
        name: rawUser.name ?? currentUser.name,
        bio: rawUser.bio ?? currentUser.bio,
        avatar: rawUser.avatar ?? currentUser.avatar,
      };
      setCurrentUser(updated);
      localStorage.setItem('blog_current_user', JSON.stringify(updated));
      await refreshPosts();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  }, [currentUser, refreshPosts, showToast]);

  // Real backend Post Creation
  const createPost: AppContextValue['createPost'] = useCallback(async (data) => {
    if (!currentUser) return null;
    try {
      const res = await api.post('/posts', {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || '',
        tags: data.tags || [],
        status: data.status || 'draft',
      });
      const post = res?.post || res;
      setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
      return post;
    } catch (err: any) {
      showToast(err.message || 'Failed to create post', 'error');
      return null;
    }
  }, [currentUser, showToast]);

  // Real backend Post Update
  const updatePost = useCallback(async (id: string, data: Partial<Post>) => {
    try {
      const res = await api.put(`/posts/${id}`, data);
      const updated = res?.post || res;
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      return updated;
    } catch (err: any) {
      showToast(err.message || 'Failed to update post', 'error');
      return null;
    }
  }, [showToast]);

  // Real backend Post Soft Delete
  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setComments((prev) => prev.filter((c) => c.postId !== id));
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete post', 'error');
      return false;
    }
  }, [showToast]);

  // Real backend Comment Creation
  const addComment = useCallback(async (postId: string, content: string): Promise<Comment | null> => {
    if (!currentUser) return null;
    try {
      const res = await api.post('/comments', { postId, content });
      const comment = res?.comment || res;
      setComments((prev) => [...prev, comment]);
      return comment;
    } catch (err: any) {
      showToast(err.message || 'Failed to add comment', 'error');
      return null;
    }
  }, [currentUser, showToast]);

  // Real backend Comment Soft Delete
  const deleteComment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete comment', 'error');
      return false;
    }
  }, [showToast]);

  // Real backend Comment Status: Hide
  const hideComment = useCallback(async (id: string) => {
    try {
      const res = await api.patch(`/comments/${id}/status`, { status: 'hidden' });
      const updated = res?.comment || res;
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'hidden' } : c)));
    } catch (err: any) {
      showToast(err.message || 'Failed to hide comment', 'error');
    }
  }, [showToast]);

  // Real backend Comment Status: Unhide
  const unhideComment = useCallback(async (id: string) => {
    try {
      const res = await api.patch(`/comments/${id}/status`, { status: 'visible' });
      const updated = res?.comment || res;
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'visible' } : c)));
    } catch (err: any) {
      showToast(err.message || 'Failed to unhide comment', 'error');
    }
  }, [showToast]);

  // Real backend Admin: Ban User
  const banUser = useCallback(async (id: string) => {
    try {
      await api.patch(`/users/${id}/ban`, { banned: true });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, banned: true } : u)));
    } catch (err: any) {
      showToast(err.message || 'Failed to ban user', 'error');
    }
  }, [showToast]);

  // Real backend Admin: Unban User
  const unbanUser = useCallback(async (id: string) => {
    try {
      await api.patch(`/users/${id}/ban`, { banned: false });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, banned: false } : u)));
    } catch (err: any) {
      showToast(err.message || 'Failed to unban user', 'error');
    }
  }, [showToast]);

  // Real backend Admin: Delete User
  const deleteUser = useCallback(async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      // Also refresh posts to reflect cascading deletion
      await refreshPosts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  }, [refreshPosts, showToast]);

  // Real backend Admin: Update User Role
  const updateUserRole = useCallback(async (id: string, role: 'user' | 'admin'): Promise<boolean> => {
    try {
      const res = await api.patch(`/users/${id}/role`, { role });
      const updatedUser = res?.user || res;
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: updatedUser.role || role } : u)));
      showToast(`User role updated to ${role}`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to update user role', 'error');
      return false;
    }
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        handleOAuthSuccess,
        logout,
        switchRole,
        updateProfile,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        users,
        posts,
        comments,
        refreshPosts,
        refreshComments,
        refreshUsers,
        createPost,
        updatePost,
        deletePost,
        addComment,
        deleteComment,
        hideComment,
        unhideComment,
        banUser,
        unbanUser,
        deleteUser,
        updateUserRole,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
