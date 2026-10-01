import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../src/app.js';
import { config } from '../../src/config/index.js';
import { UserModel } from '../../src/models/User.js';
import { PostModel } from '../../src/models/Post.js';
import { CommentModel } from '../../src/models/Comment.js';

describe('Integration Tests: API Endpoints (Supertest)', () => {
  const app = createApp();
  const testId = Date.now();

  let userAToken: string;
  let userARefresh: string;
  let userAId: string;

  let userBToken: string;
  let userBId: string;

  let adminToken: string;
  let adminId: string;

  let createdPostId: string;
  let createdPostSlug: string;
  let createdCommentId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodbUri);
    }
  });

  afterAll(async () => {
    // Clean up created entities
    if (createdPostId) {
      await PostModel.deleteMany({ _id: createdPostId });
    }
    if (createdCommentId) {
      await CommentModel.deleteMany({ _id: createdCommentId });
    }
    await UserModel.deleteMany({ email: { $regex: `integration_${testId}` } });
    await mongoose.disconnect();
  });

  // 1. Health check
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  // 2. Authentication flows
  describe('Authentication Endpoints', () => {
    const userAEmail = `integration_${testId}_a@test.com`;
    const userBEmail = `integration_${testId}_b@test.com`;
    const adminEmail = `integration_${testId}_admin@test.com`;

    it('POST /api/v1/auth/register — should register User A', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'User A', email: userAEmail, password: 'Password123!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('user');
      userAId = res.body.data.user.id;
      userAToken = res.body.data.tokens.accessToken;
      userARefresh = res.body.data.tokens.refreshToken;
    });

    it('POST /api/v1/auth/register — should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'User A Dup', email: userAEmail, password: 'Password123!' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register — should create User B', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'User B', email: userBEmail, password: 'Password123!' });

      expect(res.status).toBe(201);
      userBId = res.body.data.user.id;
      userBToken = res.body.data.tokens.accessToken;
    });

    it('POST /api/v1/auth/register — public registration cannot specify role: admin', async () => {
      const exploitEmail = `integration_${testId}_exploit@test.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Hacker', email: exploitEmail, password: 'Password123!', role: 'admin' });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('user'); // Enforces stripped/default user role
      await UserModel.deleteMany({ email: exploitEmail });
    });

    it('GET /api/v1/auth/me — should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(userAId);
      expect(res.body.data.user.password).toBeUndefined(); // Never returns password
    });

    it('POST /api/v1/auth/login — should log in User A with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userAEmail, password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/login — should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userAEmail, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
    });

    it('POST /api/v1/auth/refresh — should refresh tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: userARefresh });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      userAToken = res.body.data.tokens.accessToken;
      userARefresh = res.body.data.tokens.refreshToken;
    });

    it('Create an Admin user for RBAC testing', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash('AdminPassword123!', 10);
      const admin = await UserModel.create({
        name: 'Integration Admin',
        email: adminEmail,
        password: hash,
        role: 'admin',
      });
      adminId = admin.id;

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: adminEmail, password: 'AdminPassword123!' });

      adminToken = loginRes.body.data.tokens.accessToken;
    });
  });

  // 3. RBAC & Admin routes
  describe('RBAC Protection', () => {
    it('Anonymous user GET /api/v1/admin/stats → 401', async () => {
      const res = await request(app).get('/api/v1/admin/stats');
      expect(res.status).toBe(401);
    });

    it('Regular user (User A) GET /api/v1/admin/stats → 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(403);
    });

    it('Admin user GET /api/v1/admin/stats → 200', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalUsers).toBeGreaterThanOrEqual(1);
    });

    it('Admin user GET /api/v1/users — list users with pagination → 200', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.pagination.page).toBe(1);
    });

    it('Regular user cannot promote self or modify roles PATCH /api/v1/users/:id/role → 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${userAId}/role`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
    });

    it('Admin user can change user role PATCH /api/v1/users/:id/role → 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${userBId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('admin');

      // Revert role back to user
      await request(app)
        .patch(`/api/v1/users/${userBId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' });
    });
  });

  // 4. Post CRUD & Ownership
  describe('Posts CRUD & Ownership', () => {
    it('POST /api/v1/posts — User A creates a post', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: `Integration Post by User A ${testId}`,
          excerpt: 'Short excerpt for integration test',
          content: 'Full article body content goes here...',
          tags: ['test', 'integration'],
          status: 'published',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.post.authorId).toBe(userAId);
      createdPostId = res.body.data.post.id;
      createdPostSlug = res.body.data.post.slug;
    });

    it('GET /api/v1/posts — Public can list posts with pagination and metadata', async () => {
      const res = await request(app).get('/api/v1/posts?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    it('GET /api/v1/posts/:slug — Public can view published post', async () => {
      const res = await request(app).get(`/api/v1/posts/${createdPostSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.post.id).toBe(createdPostId);
    });

    it('PUT /api/v1/posts/:id — User B attempts to edit User A post → 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked Title by User B' });

      expect(res.status).toBe(403);
    });

    it('PUT /api/v1/posts/:id — User A updates their own post → 200 OK', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: `Updated Title User A ${testId}` });

      expect(res.status).toBe(200);
      expect(res.body.data.post.title).toBe(`Updated Title User A ${testId}`);
    });

    it('PUT /api/v1/posts/:id — Admin can edit User A post (Admin Override) → 200 OK', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ excerpt: 'Admin updated excerpt' });

      expect(res.status).toBe(200);
    });
  });

  // 5. Comments CRUD & Ownership
  describe('Comments CRUD & Ownership', () => {
    it('POST /api/v1/posts/:postId/comments — User B comments on User A post', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ content: 'Great post User A!' });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.authorId).toBe(userBId);
      createdCommentId = res.body.data.comment.id;
    });

    it('GET /api/v1/posts/:postId/comments — Public can read comments for post', async () => {
      const res = await request(app).get(`/api/v1/posts/${createdPostId}/comments`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.comments)).toBe(true);
    });

    it('GET /api/v1/comments/post/:postId — Public can also read comments via root comments router', async () => {
      const res = await request(app).get(`/api/v1/comments/post/${createdPostId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.comments)).toBe(true);
    });

    it('PUT /api/v1/comments/:id — User A attempts to edit User B comment → 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/api/v1/comments/${createdCommentId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ content: 'Tampered comment content' });

      expect(res.status).toBe(403);
    });

    it('PUT /api/v1/comments/:id — User B updates their own comment → 200 OK', async () => {
      const res = await request(app)
        .put(`/api/v1/comments/${createdCommentId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ content: 'Updated comment content by User B' });

      expect(res.status).toBe(200);
    });

    it('PATCH /api/v1/comments/:id/status — Admin moderates comment (hides it)', async () => {
      const res = await request(app)
        .patch(`/api/v1/comments/${createdCommentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'hidden' });

      expect(res.status).toBe(200);
      expect(res.body.data.comment.status).toBe('hidden');
    });

    it('DELETE /api/v1/comments/:id — User B soft-deletes their comment', async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${createdCommentId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });
  });

  // 6. Post Soft Delete & Excluded from Public Queries
  describe('Post Soft-Delete Lifecycle', () => {
    it('DELETE /api/v1/posts/:id — User B attempts to delete User A post → 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    it('DELETE /api/v1/posts/:id — User A soft-deletes their post → 200 OK', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });

    it('GET /api/v1/posts/:slug — Soft-deleted post cannot be found by public → 404', async () => {
      const res = await request(app).get(`/api/v1/posts/${createdPostSlug}`);
      expect(res.status).toBe(404);
    });
  });

  // 7. Logout & Refresh Revocation
  describe('Logout & Session Invalidation', () => {
    it('POST /api/v1/auth/logout — logs out User A and revokes refresh tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ refreshToken: userARefresh });

      expect(res.status).toBe(200);
    });

    it('POST /api/v1/auth/refresh — previously issued refresh token is now rejected (REVOKED_TOKEN)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: userARefresh });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('REVOKED_TOKEN');
    });
  });

  // 8. Security Regression & Input Hardening
  describe('Security Regression & Input Hardening', () => {
    it('Rejects invalid/malformed ObjectId with 422 or 400', async () => {
      const res = await request(app).get('/api/v1/posts/invalid-object-id-123/comments');
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('Rejects malformed Authorization header with 401', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer malformed.token.value');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Does not expose stack traces or database details in error responses', async () => {
      const res = await request(app).get('/api/v1/non-existent-endpoint-test-404');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.stack).toBeUndefined();
    });
  });
});
