import type { Response } from 'express';
import { commentService } from '../services/comment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const commentController = {
  async listByPost(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const includeHidden = req.user?.role === 'admin';
      const comments = await commentService.listByPost(req.params.postId, includeHidden);
      sendSuccess(res, { comments });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const comment = await commentService.create(req.user, req.body);
      sendSuccess(res, { comment }, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const comment = await commentService.update(req.params.id, req.user, req.body.content);
      sendSuccess(res, { comment });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const result = await commentService.softDelete(req.params.id, req.user);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async setStatus(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      if (req.user.role !== 'admin') {
        throw new AppError('FORBIDDEN', 'Only admins can change comment visibility', 403);
      }
      const status = req.body.status === 'hidden' ? 'hidden' : 'visible';
      const comment = await commentService.setStatus(req.params.id, status);
      sendSuccess(res, { comment });
    } catch (err) {
      next(err);
    }
  },
};
