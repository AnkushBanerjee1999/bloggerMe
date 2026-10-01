import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { IUser } from '../models/User.js';

interface AccessTokenPayload {
  userId: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
  role: string;
  tokenVersion?: number;
}

export function signAccessToken(user: IUser): string {
  const payload: AccessTokenPayload = { userId: user.id, role: user.role };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function signRefreshToken(user: IUser): string {
  const payload: RefreshTokenPayload = {
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
  };
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
}
