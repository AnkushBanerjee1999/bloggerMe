import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { requireRole, requireAdmin } from '../../src/middleware/auth.js';
import { ForbiddenError } from '../../src/utils/AppError.js';

describe('Unit Tests: RBAC Authorization Middleware', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  describe('requireAdmin', () => {
    const adminMiddleware = requireAdmin();

    it('should call next() without error if user role is admin', () => {
      const req: any = { user: { role: 'admin' } };
      adminMiddleware(req, {} as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass ForbiddenError to next() if user role is user', () => {
      const req: any = { user: { role: 'user' } };
      adminMiddleware(req, {} as any, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.statusCode).toBe(403);
    });

    it('should pass AuthError (401 NO_TOKEN) to next() if req.user is missing', () => {
      const req: any = {};
      adminMiddleware(req, {} as any, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('NO_TOKEN');
    });
  });

  describe('requireRole', () => {
    it('should allow user if role matches allowed list', () => {
      const middleware = requireRole('admin', 'user');
      const req: any = { user: { role: 'user' } };

      middleware(req, {} as any, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject if role is not in allowed list', () => {
      const middleware = requireRole('admin');
      const req: any = { user: { role: 'user' } };

      middleware(req, {} as any, mockNext);
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
    });
  });
});
