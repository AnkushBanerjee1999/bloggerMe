import type { Response } from 'express';
import { postService } from '../services/post.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const postController = {
  async list(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const { page, limit, sort, status, search, tag, authorId } = req.query;
      const isAdmin = req.user?.role === 'admin';
      const result = await postService.list({
        page: Number(page),
        limit: Number(limit),
        sort: sort as 'newest' | 'oldest' | 'popular',
        status: isAdmin ? (status as 'published' | 'draft' | undefined) : undefined,
        search: search as string | undefined,
        tag: tag as string | undefined,
        authorId: authorId as string | undefined,
      });
      sendPaginated(res, result.items, Number(page), Number(limit), result.totalItems);
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const post = await postService.getBySlug(req.params.slug, true);
      sendSuccess(res, { post });
    } catch (err) {
      next(err);
    }
  },

  async getPublicStats(_req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const stats = await postService.getPublicStats();
      sendSuccess(res, { stats });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const post = await postService.create(req.user, req.body);
      sendSuccess(res, { post }, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const post = await postService.update(req.params.id, req.user, req.body);
      sendSuccess(res, { post });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      if (!req.user) throw new AppError('AUTH_ERROR', 'Not authenticated', 401);
      const result = await postService.softDelete(req.params.id, req.user);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
