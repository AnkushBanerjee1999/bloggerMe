import { UserModel } from '../models/User.js';
import { PostModel } from '../models/Post.js';
import { CommentModel } from '../models/Comment.js';
import { PostModel as Post } from '../models/Post.js';

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  publishedPosts: number;
  draftPosts: number;
  hiddenComments: number;
}

export const adminService = {
  async getStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      publishedPosts,
      draftPosts,
      hiddenComments,
    ] = await Promise.all([
      UserModel.countDocuments(),
      Post.countDocuments({ deletedAt: null }),
      CommentModel.countDocuments({ deletedAt: null }),
      Post.countDocuments({ deletedAt: null, status: 'published' }),
      Post.countDocuments({ deletedAt: null, status: 'draft' }),
      CommentModel.countDocuments({ deletedAt: null, status: 'hidden' }),
    ]);

    return {
      totalUsers,
      totalPosts,
      totalComments,
      publishedPosts,
      draftPosts,
      hiddenComments,
    };
  },

  async getAllComments(page: number, limit: number, search?: string) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (search) {
      filter.content = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      CommentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatar')
        .populate('post', 'title slug')
        .exec(),
      CommentModel.countDocuments(filter),
    ]);

    return { items, totalItems };
  },
};
