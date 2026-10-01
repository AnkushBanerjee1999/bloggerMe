import type { Response } from 'express';
import { adminService } from '../services/admin.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const adminController = {
  async getStats(_req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const stats = await adminService.getStats();
      sendSuccess(res, { stats });
    } catch (err) {
      next(err);
    }
  },

  async getAllComments(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const { page, limit, search } = req.query;
      const result = await adminService.getAllComments(Number(page), Number(limit), search as string | undefined);
      sendPaginated(res, result.items, Number(page), Number(limit), result.totalItems);
    } catch (err) {
      next(err);
    }
  },
};
