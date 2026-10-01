import { Router } from 'express';
import authRoutes from './auth.routes.js';
import postRoutes from './post.routes.js';
import commentRoutes from './comment.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
