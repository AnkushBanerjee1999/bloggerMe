import http from 'http';
import mongoose from 'mongoose';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { createApp } from '../../src/app.js';
import { initSocketIO } from '../../src/socket/index.js';
import { signAccessToken } from '../../src/utils/jwt.js';
import { config } from '../../src/config/index.js';
import { UserModel, IUser } from '../../src/models/User.js';
import { PostModel } from '../../src/models/Post.js';
import { CommentModel } from '../../src/models/Comment.js';
import { commentService } from '../../src/services/comment.service.js';
import { userService } from '../../src/services/user.service.js';
import type { AppNotification } from '../../src/socket/types.js';

describe('Socket.io Real-Time Notification Tests', () => {
  let server: http.Server;
  let serverPort: number;
  let serverUrl: string;

  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();

  let userAToken: string;
  let userBToken: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodbUri);
    }

    // Generate JWT tokens
    userAToken = signAccessToken({ id: userAId, role: 'user' } as unknown as IUser);
    userBToken = signAccessToken({ id: userBId, role: 'user' } as unknown as IUser);

    // Setup unified HTTP + Socket.io test server
    const app = createApp();
    server = http.createServer(app);
    initSocketIO(server);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          serverPort = addr.port;
          serverUrl = `http://localhost:${serverPort}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await mongoose.disconnect();
  });

  describe('1. Socket Authentication & Room Joining', () => {
    it('should reject connection when no token is provided', (done) => {
      const client = Client(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      client.on('connect_error', (err: Error) => {
        expect(err.message).toBe('Authentication required');
        client.close();
        done();
      });

      client.on('connect', () => {
        client.close();
        done(new Error('Should not have connected without token'));
      });
    });

    it('should reject connection when invalid token is provided', (done) => {
      const client = Client(serverUrl, {
        auth: { token: 'invalid.token.here' },
        transports: ['websocket'],
        reconnection: false,
      });

      client.on('connect_error', (err: Error) => {
        expect(err.message).toBe('Invalid or expired access token');
        client.close();
        done();
      });

      client.on('connect', () => {
        client.close();
        done(new Error('Should not have connected with invalid token'));
      });
    });

    it('should connect successfully with valid JWT token', (done) => {
      const client = Client(serverUrl, {
        auth: { token: userAToken },
        transports: ['websocket'],
        reconnection: false,
      });

      client.on('connect', () => {
        expect(client.connected).toBe(true);
        client.close();
        done();
      });

      client.on('connect_error', (err: Error) => {
        done(err);
      });
    });
  });

  describe('2. Room Isolation & Targeted Delivery', () => {
    let clientA: ClientSocket;
    let clientB: ClientSocket;

    beforeEach((done) => {
      let connectedCount = 0;
      const checkDone = () => {
        connectedCount++;
        if (connectedCount === 2) done();
      };

      clientA = Client(serverUrl, {
        auth: { token: userAToken },
        transports: ['websocket'],
        reconnection: false,
      });
      clientA.on('connect', checkDone);

      clientB = Client(serverUrl, {
        auth: { token: userBToken },
        transports: ['websocket'],
        reconnection: false,
      });
      clientB.on('connect', checkDone);
    });

    afterEach(() => {
      if (clientA?.connected) clientA.close();
      if (clientB?.connected) clientB.close();
    });

    it('should deliver notification only to targeted user room', (done) => {
      const bNotifications: AppNotification[] = [];

      clientB.on('notification', (payload: AppNotification) => {
        bNotifications.push(payload);
      });

      clientA.on('notification', (payload: AppNotification) => {
        expect(payload.type).toBe('NEW_COMMENT');
        expect(payload.title).toBe('New comment on your post');

        // Verify client B received nothing
        setTimeout(() => {
          expect(bNotifications.length).toBe(0);
          done();
        }, 100);
      });

      // Emit specifically to userA
      import('../../src/socket/notificationEmitter.js').then(({ emitToUser }) => {
        emitToUser(userAId, {
          type: 'NEW_COMMENT',
          title: 'New comment on your post',
          message: 'Someone commented on your post',
          data: { postId: '123', commentId: '456' },
        });
      });
    });
  });

  describe('3. End-to-End Service Notification Triggers', () => {
    let clientA: ClientSocket;
    let clientB: ClientSocket;
    let testPost: any;
    let userAUser: any;
    let userBUser: any;
    let adminUser: any;

    beforeAll(async () => {
      // Seed users in database
      userAUser = await UserModel.create({
        name: 'Socket User A',
        email: `socket_a_${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'user',
      });

      userBUser = await UserModel.create({
        name: 'Socket User B',
        email: `socket_b_${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'user',
      });

      adminUser = await UserModel.create({
        name: 'Socket Admin',
        email: `socket_admin_${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'admin',
      });

      // Create post authored by User A
      testPost = await PostModel.create({
        title: 'Socket Notification Test Post',
        slug: `socket-test-post-${Date.now()}`,
        excerpt: 'This is a short excerpt for socket notification testing.',
        content: 'This post will receive real-time comments.',
        author: userAUser._id,
        tags: ['socket', 'test'],
        status: 'published',
      });
    });

    afterAll(async () => {
      if (testPost?._id) {
        await PostModel.deleteMany({ _id: testPost._id });
        await CommentModel.deleteMany({ post: testPost._id });
      }
      if (userAUser?._id && userBUser?._id && adminUser?._id) {
        await UserModel.deleteMany({ _id: { $in: [userAUser._id, userBUser._id, adminUser._id] } });
      }
    });

    beforeEach((done) => {
      let count = 0;
      const ready = () => {
        count++;
        if (count === 2) done();
      };

      const tokenA = signAccessToken(userAUser);
      const tokenB = signAccessToken(userBUser);

      clientA = Client(serverUrl, {
        auth: { token: tokenA },
        transports: ['websocket'],
        reconnection: false,
      });
      clientA.on('connect', ready);

      clientB = Client(serverUrl, {
        auth: { token: tokenB },
        transports: ['websocket'],
        reconnection: false,
      });
      clientB.on('connect', ready);
    });

    afterEach(() => {
      if (clientA?.connected) clientA.close();
      if (clientB?.connected) clientB.close();
    });

    it('NEW_COMMENT: when User B comments on User A post, User A receives notification and User B does not', (done) => {
      let userBReceived = false;
      clientB.on('notification', () => {
        userBReceived = true;
      });

      clientA.on('notification', (notif: AppNotification) => {
        expect(notif.type).toBe('NEW_COMMENT');
        expect(notif.title).toBe('New comment on your post');
        expect(notif.message).toContain('Socket User B');
        expect(notif.data?.postId).toBe(testPost._id.toString());

        setTimeout(() => {
          expect(userBReceived).toBe(false);
          done();
        }, 100);
      });

      // User B creates a comment on User A's post
      commentService.create(userBUser, {
        content: 'Awesome real-time comment test!',
        postId: testPost._id.toString(),
      });
    });

    it('COMMENT_STATUS_CHANGED: when admin changes comment status, comment author (User B) receives notification', async () => {
      // First create a comment by User B
      const comment = await commentService.create(userBUser, {
        content: 'Comment awaiting status update',
        postId: testPost._id.toString(),
      });

      return new Promise<void>((resolve) => {
        clientB.on('notification', (notif: AppNotification) => {
          expect(notif.type).toBe('COMMENT_STATUS_CHANGED');
          expect(notif.title).toBe('Comment status updated');
          expect(notif.data?.commentId).toBe(comment.id);
          expect(notif.data?.status).toBe('hidden');
          resolve();
        });

        // Admin updates comment status to 'hidden'
        commentService.setStatus(comment.id, 'hidden');
      });
    });

    it('ROLE_CHANGED: when admin changes user role, targeted user receives ROLE_CHANGED notification', () => {
      return new Promise<void>((resolve) => {
        clientB.on('notification', (notif: AppNotification) => {
          expect(notif.type).toBe('ROLE_CHANGED');
          expect(notif.title).toBe('Account role updated');
          expect(notif.data?.role).toBe('admin');
          resolve();
        });

        // Admin changes User B role to admin
        userService.updateUserRole(userBUser._id.toString(), 'admin', adminUser);
      });
    });
  });
});
