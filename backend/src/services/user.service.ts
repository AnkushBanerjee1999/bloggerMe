import { UserModel } from '../models/User.js';
import { PostModel } from '../models/Post.js';
import { CommentModel } from '../models/Comment.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/AppError.js';
import type { IUser, UserRole } from '../models/User.js';
import type { SafeUser } from './auth.service.js';

export const userService = {
  async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  },

  async updateProfile(user: IUser, input: { name?: string; bio?: string; avatar?: string }) {
    if (input.name !== undefined) user.name = input.name;
    if (input.bio !== undefined) user.bio = input.bio;
    if (input.avatar !== undefined) user.avatar = input.avatar;
    await user.save();

    // Update author info on existing posts
    if (input.name || input.avatar) {
      await PostModel.updateMany(
        { author: user.id, deletedAt: null },
        {},
      );
    }

    return user;
  },

  async listAll(page: number, limit: number, search?: string) {
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      UserModel.countDocuments(filter),
    ]);

    return { items, totalItems };
  },

  async getById(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  },

  async setBanStatus(userId: string, banned: boolean, requester: IUser) {
    if (userId === requester.id) {
      throw new ForbiddenError('You cannot ban or unban yourself');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role === 'admin') {
      throw new ForbiddenError('You cannot ban an admin user');
    }

    user.banned = banned;
    await user.save();
    return user;
  },

  async deleteUser(userId: string, requester: IUser) {
    if (userId === requester.id) {
      throw new ForbiddenError('You cannot delete your own account from here');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role === 'admin') {
      throw new ConflictError('Cannot delete an admin user');
    }

    // Soft delete user's posts and comments
    await PostModel.updateMany(
      { author: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
    await CommentModel.updateMany(
      { author: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );

    await UserModel.findByIdAndDelete(userId);
    return { id: userId, deleted: true };
  },

  async updateUserRole(userId: string, newRole: UserRole, requester: IUser) {
    if (userId === requester.id) {
      throw new ForbiddenError('You cannot change your own role');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    user.role = newRole;
    await user.save();

    // Notify user in real-time about role change
    const { emitToUser } = await import('../socket/index.js');
    emitToUser(userId, {
      type: 'ROLE_CHANGED',
      title: 'Account role updated',
      message: `Your account role has been updated to "${newRole}".`,
      data: {
        role: newRole,
      },
    });

    return user;
  },

  toSafeUserList(users: IUser[]): SafeUser[] {
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      bio: u.bio,
      banned: u.banned,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  },
};
