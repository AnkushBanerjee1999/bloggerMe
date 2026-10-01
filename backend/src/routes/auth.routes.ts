import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', authRateLimiter, validate({ body: refreshTokenSchema }), authController.refresh);
router.post('/logout', optionalAuthenticate, authController.logout);
router.get('/me', authenticate, authController.me);

// OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', authController.facebookCallback);

export default router;
