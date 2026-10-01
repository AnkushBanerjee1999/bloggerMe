import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
  postIdParamSchema,
  commentStatusSchema,
} from '../validators/comment.validator.js';

const router = Router();

// Public: list comments for a post
router.get(
  '/post/:postId',
  validate({ params: postIdParamSchema }),
  commentController.listByPost,
);

// Protected
router.post(
  '/',
  authenticate,
  validate({ body: createCommentSchema }),
  commentController.create,
);
router.put(
  '/:id',
  authenticate,
  validate({ params: commentIdParamSchema, body: updateCommentSchema }),
  commentController.update,
);
router.delete(
  '/:id',
  authenticate,
  validate({ params: commentIdParamSchema }),
  commentController.delete,
);

// Admin only: hide/unhide a comment
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin(),
  validate({ params: commentIdParamSchema, body: commentStatusSchema }),
  commentController.setStatus,
);

export default router;
