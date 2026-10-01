import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import type { IUser } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ConflictError, AuthError, NotFoundError } from '../utils/AppError.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toSafeUser(user: IUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    banned: user.banned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildAuthResponse(user: IUser) {
  return {
    user: toSafeUser(user),
    tokens: {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    },
  };
}

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    return buildAuthResponse(user);
  },

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }
    if (user.banned) {
      throw new AuthError('This account has been banned', 'BANNED');
    }

    if (!user.password) {
      throw new AuthError('Please sign in using your OAuth provider (Google or Facebook)', 'OAUTH_ACCOUNT');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    return buildAuthResponse(user);
  },

  async refreshAccessToken(refreshToken: string) {
    let payload: { userId: string; role: string; tokenVersion?: number };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    if (user.banned) {
      throw new AuthError('This account has been banned', 'BANNED');
    }

    // Verify tokenVersion to ensure token hasn't been revoked via logout
    if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
      throw new AuthError('Refresh token has been revoked', 'REVOKED_TOKEN');
    }

    return {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  },

  async logout(userId?: string) {
    if (userId) {
      // Increment tokenVersion so previously issued refresh tokens are instantly revoked
      await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    }
    return { message: 'Logged out successfully' };
  },

  async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return toSafeUser(user);
  },

  async handleOAuthLogin(params: {
    provider: 'google' | 'facebook';
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    const normalizedEmail = params.email.toLowerCase().trim();

    // 1. Check if user already exists with this email or providerId
    let user = await UserModel.findOne({
      $or: [
        { email: normalizedEmail },
        { provider: params.provider, providerId: params.providerId },
      ],
    });

    if (user) {
      if (user.banned) {
        throw new AuthError('This account has been banned', 'BANNED');
      }

      let updated = false;
      // Link provider if not yet linked
      if (!user.providerId || user.provider === 'local') {
        user.provider = params.provider;
        user.providerId = params.providerId;
        updated = true;
      }
      // Update avatar if not present
      if (!user.avatar && params.avatar) {
        user.avatar = params.avatar;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
      // CRITICAL: We preserve user.role as is! If existing user was admin, they remain admin.
      return buildAuthResponse(user);
    }

    // 2. Create new user — OAuth-created accounts MUST default to role = "user"
    user = await UserModel.create({
      name: params.name || 'Anonymous User',
      email: normalizedEmail,
      provider: params.provider,
      providerId: params.providerId,
      avatar: params.avatar || '',
      role: 'user', // Strictly enforced!
    });

    return buildAuthResponse(user);
  },

  toSafeUser,
};

