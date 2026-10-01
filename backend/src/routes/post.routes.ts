import { Router } from 'express';
import { postController } from '../controllers/post.controller.js';
import { commentController } from '../controllers/comment.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { createPostSchema, updatePostSchema, postSlugParamSchema, postIdParamSchema } from '../validators/post.validator.js';
import { createCommentSchema, postIdParamSchema as commentPostIdParamSchema } from '../validators/comment.validator.js';
import { paginationSchema } from '../validators/pagination.validator.js';

const router = Router();

// Public routes (with optional auth to detect admin or user roles)
router.get(
  '/',
  optionalAuthenticate,
  validate({ query: paginationSchema }),
  postController.list,
);
router.get(
  '/stats',
  postController.getPublicStats,
);
router.get(
  '/:slug',
  validate({ params: postSlugParamSchema }),
  postController.getBySlug,
);

// Protected routes
router.post(
  '/',
  authenticate,
  validate({ body: createPostSchema }),
  postController.create,
);
router.put(
  '/:id',
  authenticate,
  validate({ params: postIdParamSchema, body: updatePostSchema }),
  postController.update,
);
router.delete(
  '/:id',
  authenticate,
  validate({ params: postIdParamSchema }),
  postController.delete,
);

// Nested sub-resource support for comments: /api/v1/posts/:postId/comments
router.get(
  '/:postId/comments',
  validate({ params: commentPostIdParamSchema }),
  commentController.listByPost,
);

router.post(
  '/:postId/comments',
  authenticate,
  (req, _res, next) => {
    req.body = { ...req.body, postId: req.params.postId };
    next();
  },
  validate({ body: createCommentSchema }),
  commentController.create,
);

export default router;
