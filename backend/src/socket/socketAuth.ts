import type { ExtendedError } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AuthenticatedSocket } from './types.js';

export function socketAuth(socket: AuthenticatedSocket, next: (err?: ExtendedError) => void): void {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      const err = new Error('Authentication required') as ExtendedError;
      err.data = { code: 'NO_TOKEN' };
      return next(err);
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
      const err = new Error('Invalid token payload') as ExtendedError;
      err.data = { code: 'INVALID_TOKEN' };
      return next(err);
    }

    socket.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    const err = new Error('Invalid or expired access token') as ExtendedError;
    err.data = { code: 'INVALID_TOKEN' };
    next(err);
  }
}
