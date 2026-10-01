import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, userIdParamSchema, banActionSchema, updateRoleSchema } from '../validators/user.validator.js';
import { adminPaginationSchema } from '../validators/pagination.validator.js';

const router = Router();

// Authenticated user — own profile
router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, validate({ body: updateProfileSchema }), userController.updateProfile);

// Admin — manage users
router.get('/', authenticate, requireAdmin(), validate({ query: adminPaginationSchema }), userController.listUsers);
router.get('/:id', authenticate, requireAdmin(), validate({ params: userIdParamSchema }), userController.getUser);
router.patch('/:id/role', authenticate, requireAdmin(), validate({ params: userIdParamSchema, body: updateRoleSchema }), userController.updateUserRole);
router.patch('/:id/ban', authenticate, requireAdmin(), validate({ params: userIdParamSchema, body: banActionSchema }), userController.setBanStatus);
router.delete('/:id', authenticate, requireAdmin(), validate({ params: userIdParamSchema }), userController.deleteUser);

export default router;
