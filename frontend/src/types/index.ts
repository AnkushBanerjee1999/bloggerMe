export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  bio: string;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  banned?: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: 'published' | 'draft';
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  status: 'visible' | 'hidden';
}

export interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  totalUsers: number;
  publishedPosts: number;
  draftPosts: number;
  recentPosts: Post[];
  postsByMonth: { month: string; count: number }[];
}
