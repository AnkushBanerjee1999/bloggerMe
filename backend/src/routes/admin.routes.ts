import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminPaginationSchema } from '../validators/pagination.validator.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin());

router.get('/stats', adminController.getStats);
router.get('/comments', validate({ query: adminPaginationSchema }), adminController.getAllComments);

export default router;
