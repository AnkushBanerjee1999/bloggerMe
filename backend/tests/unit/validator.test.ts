import { registerSchema, loginSchema, refreshTokenSchema } from '../../src/validators/auth.validator.js';
import { createPostSchema, updatePostSchema } from '../../src/validators/post.validator.js';
import { createCommentSchema, commentStatusSchema } from '../../src/validators/comment.validator.js';

describe('Unit Tests: Joi Validation Schemas', () => {
  describe('Auth Validators', () => {
    it('should validate correct registration payload', () => {
      const { error } = registerSchema.validate({
        name: 'Alice Cooper',
        email: 'alice@example.com',
        password: 'password123',
      });
      expect(error).toBeUndefined();
    });

    it('should reject short passwords (< 6 chars)', () => {
      const { error } = registerSchema.validate({
        name: 'Alice',
        email: 'alice@example.com',
        password: '123',
      });
      expect(error).toBeDefined();
    });

    it('should reject invalid email formats', () => {
      const { error } = registerSchema.validate({
        name: 'Alice',
        email: 'not-an-email',
        password: 'password123',
      });
      expect(error).toBeDefined();
    });

    it('should validate login schema with valid inputs', () => {
      const { error } = loginSchema.validate({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(error).toBeUndefined();
    });

    it('should validate refresh token schema', () => {
      const valid = refreshTokenSchema.validate({ refreshToken: 'some-jwt-token' });
      expect(valid.error).toBeUndefined();

      const invalid = refreshTokenSchema.validate({});
      expect(invalid.error).toBeDefined();
    });
  });

  describe('Post Validators', () => {
    it('should validate proper post creation payload', () => {
      const { error } = createPostSchema.validate({
        title: 'Understanding MERN Stack & Testing',
        excerpt: 'An in-depth article about testing MERN apps.',
        content: 'Long markdown content goes here...',
        tags: ['nodejs', 'jest', 'mongodb'],
        status: 'published',
      });
      expect(error).toBeUndefined();
    });

    it('should reject post creation if title is shorter than 3 characters', () => {
      const { error } = createPostSchema.validate({
        title: 'Hi',
        excerpt: 'Short excerpt',
        content: 'Some content',
      });
      expect(error).toBeDefined();
    });

    it('should reject post update if status is invalid', () => {
      const { error } = updatePostSchema.validate({
        status: 'archived_invalid_status',
      });
      expect(error).toBeDefined();
    });
  });

  describe('Comment Validators', () => {
    it('should validate valid comment payload', () => {
      const { error } = createCommentSchema.validate({
        postId: '507f1f77bcf86cd799439011',
        content: 'Great post, thanks for sharing!',
      });
      expect(error).toBeUndefined();
    });

    it('should reject empty comment content', () => {
      const { error } = createCommentSchema.validate({
        postId: '507f1f77bcf86cd799439011',
        content: '',
      });
      expect(error).toBeDefined();
    });

    it('should validate comment status schema (visible/hidden)', () => {
      expect(commentStatusSchema.validate({ status: 'visible' }).error).toBeUndefined();
      expect(commentStatusSchema.validate({ status: 'hidden' }).error).toBeUndefined();
      expect(commentStatusSchema.validate({ status: 'deleted' }).error).toBeDefined();
    });
  });
});
