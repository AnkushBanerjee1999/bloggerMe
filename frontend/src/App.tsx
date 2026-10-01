import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { ToastContainer } from '@/components/ui/Toast';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { HomePage } from '@/pages/public/HomePage';
import { BlogListPage } from '@/pages/public/BlogListPage';
import { PostDetailPage } from '@/pages/public/PostDetailPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';

import { UserDashboardPage } from '@/pages/user/UserDashboardPage';
import { MyPostsPage } from '@/pages/user/MyPostsPage';
import { CreatePostPage } from '@/pages/user/CreatePostPage';
import { EditPostPage } from '@/pages/user/EditPostPage';
import { ProfilePage } from '@/pages/user/ProfilePage';

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { ManageUsersPage } from '@/pages/admin/ManageUsersPage';
import { ManagePostsPage } from '@/pages/admin/ManagePostsPage';
import { ManageCommentsPage } from '@/pages/admin/ManageCommentsPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/posts/:slug" element={<PostDetailPage />} />
          </Route>

          {/* Auth routes (standalone, no public header) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<UserDashboardPage />} />
            <Route path="my-posts" element={<MyPostsPage />} />
            <Route path="create-post" element={<CreatePostPage />} />
            <Route path="edit-post/:id" element={<EditPostPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="posts" element={<ManagePostsPage />} />
            <Route path="comments" element={<ManageCommentsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AppProvider>
  );
}

export default App;
