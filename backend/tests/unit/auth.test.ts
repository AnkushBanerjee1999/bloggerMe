import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt.js';

describe('Unit Tests: Authentication & Cryptography', () => {
  describe('Password Hashing (bcrypt)', () => {
    it('should securely hash password and verify match', async () => {
      const plainPassword = 'SuperSecretPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(plainPassword, salt);

      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

      const isValid = await bcrypt.compare(plainPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('WrongPassword456!', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Access & Refresh Tokens', () => {
    const mockUser: any = {
      id: '507f1f77bcf86cd799439011',
      role: 'user',
      tokenVersion: 2,
    };

    it('should generate valid access token with userId and role in payload', () => {
      const accessToken = signAccessToken(mockUser);
      expect(typeof accessToken).toBe('string');

      const payload = verifyAccessToken(accessToken);
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.role).toBe(mockUser.role);
    });

    it('should generate valid refresh token with tokenVersion in payload', () => {
      const refreshToken = signRefreshToken(mockUser);
      expect(typeof refreshToken).toBe('string');

      const payload = verifyRefreshToken(refreshToken);
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.tokenVersion).toBe(2);
    });

    it('should reject access token when verified with refresh secret', () => {
      const accessToken = signAccessToken(mockUser);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });

    it('should reject refresh token when verified with access secret', () => {
      const refreshToken = signRefreshToken(mockUser);
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });

    it('should throw on completely invalid token strings', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
      expect(() => verifyRefreshToken('invalid.token.here')).toThrow();
    });
  });
});
