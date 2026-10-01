import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserModel } from '../models/User.js';
import type { IUser } from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthError, ForbiddenError } from '../utils/AppError.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }
  return null;
}

export const authenticate: RequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AuthError('Authentication required. Please provide a valid access token.', 'NO_TOKEN');
    }

    let payload: { userId: string; role: string };
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AuthError('Invalid or expired access token.', 'INVALID_TOKEN');
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new AuthError('User not found.', 'USER_NOT_FOUND');
    }
    if (user.banned) {
      throw new AuthError('This account has been banned.', 'BANNED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuthenticate: RequestHandler = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    let payload: { userId: string; role: string };
    try {
      payload = verifyAccessToken(token);
    } catch {
      return next();
    }

    const user = await UserModel.findById(payload.userId);
    if (user && !user.banned) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

export function requireRole(...roles: Array<'user' | 'admin'>): RequestHandler {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('Authentication required.', 'NO_TOKEN'));
    }
    if (!roles.includes(req.user.role as 'user' | 'admin')) {
      return next(new ForbiddenError());
    }
    next();
  };
}

export function requireAdmin(): RequestHandler {
  return requireRole('admin');
}
