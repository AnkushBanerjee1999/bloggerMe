import type { Response } from 'express';
import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const userController = {
  async getProfile(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      sendSuccess(res, { user: authService.toSafeUser(req.user) });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const updated = await userService.updateProfile(req.user, req.body);
      sendSuccess(res, { user: authService.toSafeUser(updated) });
    } catch (err) {
      next(err);
    }
  },

  // Admin endpoints
  async listUsers(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const { page, limit, search } = req.query;
      const result = await userService.listAll(Number(page), Number(limit), search as string | undefined);
      sendSuccess(res, {
        users: userService.toSafeUserList(result.items),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalItems: result.totalItems,
          totalPages: Math.ceil(result.totalItems / Number(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getUser(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const user = await userService.getById(req.params.id);
      sendSuccess(res, { user: authService.toSafeUser(user) });
    } catch (err) {
      next(err);
    }
  },

  async setBanStatus(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const user = await userService.setBanStatus(req.params.id, req.body.banned, req.user);
      sendSuccess(res, { user: authService.toSafeUser(user) });
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const result = await userService.deleteUser(req.params.id, req.user);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async updateUserRole(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const user = await userService.updateUserRole(req.params.id, req.body.role, req.user);
      sendSuccess(res, { user: authService.toSafeUser(user) });
    } catch (err) {
      next(err);
    }
  },
};
