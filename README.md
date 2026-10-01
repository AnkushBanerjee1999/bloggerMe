# bloggerMe — Full-Stack MERN Blog Platform

bloggerMe is a full-stack blogging platform built with React, TypeScript, Node.js, Express, MongoDB, and Socket.io.

The application supports public blog browsing, authenticated publishing, discussions, role-based administration, social OAuth 2.0 authentication, and real-time notifications.

---

## 1. Overview

bloggerMe is designed with clean architectural separation between client, presentation, service, and data layers. It provides readers with a responsive reading and search experience, authors with content management tools, and administrators with moderation and governance controls.

### Key Features
- **Public Blog Browsing & Search**: Search articles by keyword or tag, filter by popularity or chronology, and browse paginated listings.
- **User Authentication**: Email/password authentication, JWT access/refresh token rotation, and Google/Facebook OAuth 2.0.
- **Post Lifecycle**: Create, edit, draft, and soft-delete posts with automatic slug generation and conflict resolution.
- **Comments & Moderation**: Discussion threads on posts with moderation status controls (`visible` / `hidden`).
- **Role-Based Administration**: Dedicated administrative panel for managing user accounts, roles, post content, and comment visibility.
- **Real-Time Notifications**: Instant event delivery via Socket.io to personal user rooms for comments, status changes, and role assignments.
- **Database Optimization**: Targeted indexes on MongoDB collections and capped pagination limits to ensure query efficiency.
- **Automated Test Coverage**: Comprehensive backend unit and integration test suites alongside frontend component tests.

---

## 2. Features

### Authentication & Sessions
- **Registration & Login**: Secure account creation and credential validation. Public registration automatically assigns the `user` role and ignores any client-supplied role values.
- **Dual-Token JWT Strategy**: Short-lived access tokens (15m) for API authentication and longer-lived refresh tokens (7d) for token renewals.
- **Refresh Token Invalidation**: Atomic `tokenVersion` increments on logout to immediately invalidate existing refresh tokens.
- **OAuth 2.0 Integration**: Native Google and Facebook social login flows that map external profiles to local database accounts and issue standard application JWTs.
- **Rate Limiting**: Request rate limiting on sensitive authentication routes (`20` requests per 15 minutes) and API endpoints (`100` requests per 15 minutes) using `express-rate-limit`.

### Authorization & Roles
- **Role-Based Access Control (RBAC)**:
  - `user`: Can create posts, edit or delete owned posts, post comments, edit or delete owned comments, and manage profile settings.
  - `admin`: Full platform access, including managing any post, moderating comments, listing users, updating user roles, and viewing analytics.
- **Ownership Verification**: Resource modification endpoints verify author ownership server-side using the verified JWT identity (`req.user.id`).
- **Server-Side Enforcement**: While client-side route guards improve navigation UX, all authorization checks are strictly enforced by backend middleware (`authenticate`, `requireRole`, `requireAdmin`).

### Blog Posts
- **CRUD Operations**: Create, read, update, and soft-delete blog posts with title, excerpt, markdown content, tags, and cover image.
- **Slug Generation**: Automatic kebab-case slug generation with collision detection and numeric suffixing (`post-title-1`, `post-title-2`).
- **Soft Deletion**: Posts marked as deleted retain referential integrity via `deletedAt` timestamps and are automatically excluded from public queries using Mongoose query middleware.
- **Admin Overrides**: Administrators can update or remove any post to maintain platform standards.
- **Pagination & Sorting**: Post listings support pagination with configurable sorting (`newest`, `oldest`, `popular`).

### Comments & Moderation
- **Discussion Threads**: Authenticated readers can post comments on any published article.
- **Author Ownership**: Comment authors can edit or soft-delete their own contributions.
- **Admin Moderation**: Administrators can toggle comment visibility between `visible` and `hidden`.
- **Real-Time Notification Delivery**: Socket.io alerts the post author when a new comment is posted (skipping self-comments) and notifies comment authors when moderation status changes.

### Admin Panel
- **System Metrics**: Platform-wide statistics on total users, published articles, drafts, and comments.
- **User Directory**: Paginated user listing with search by name/email, account ban/unban toggling, and role modification (`user` ↔ `admin`).
- **Comment Moderation View**: Centralized interface to browse, inspect, and moderate discussion threads across all articles.

### Real-Time Notifications (Socket.io)
- **Unified Server Setup**: Socket.io attaches directly to the HTTP server instance (`http.createServer(app)`).
- **Socket Authentication**: JWT verification on connection handshake via `auth: { token }` or headers.
- **Personal User Rooms**: Authenticated sockets automatically join isolated personal rooms (`user:{userId}`).
- **Supported Notification Events**:
  - `NEW_COMMENT`: Delivered to the post author when a new comment is submitted.
  - `COMMENT_STATUS_CHANGED`: Delivered to the comment author when an administrator moderates comment status.
  - `ROLE_CHANGED`: Delivered to the target user when their account role is updated by an administrator.
- **Notification UI**: Interactive bell icon in navigation bars with unread badge counter, dropdown panel, mark-as-read toggling, and direct resource navigation.

---

## 3. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Typed component-based user interface |
| **Frontend Tooling** | Vite 5 | Development server and production bundling |
| **Routing** | React Router v6 | Client-side routing and protected layout guards |
| **Styling & UI** | Tailwind CSS + Lucide React | Responsive layout styling and iconography |
| **Real-Time Client** | Socket.io Client (v4.8) | WebSocket connection with fallback transports |
| **Backend Runtime** | Node.js (ESM) + TypeScript | Server runtime environment |
| **Web Framework** | Express 4 | RESTful API routing and middleware pipeline |
| **Real-Time Server** | Socket.io (v4.8) | WebSocket event gateway and room management |
| **Database & ODM** | MongoDB + Mongoose 8 | Document database with schema validation and indexes |
| **Authentication** | JWT (`jsonwebtoken`) | Stateless access and refresh tokens |
| **Password Hashing** | `bcryptjs` | Salted password hashing (10 rounds) |
| **Validation** | Joi | Input schema validation with unknown field stripping |
| **Security & Headers** | Helmet, CORS, Cookie-Parser | HTTP header hardening and origin verification |
| **Compression & Rate Limiting** | `compression`, `express-rate-limit` | Gzip compression and IP rate limiting |
| **Backend Testing** | Jest + Supertest + `ts-jest` | Unit and integration test runners |
| **Frontend Testing** | Vitest + Testing Library + JSDOM | Component unit and form behavior tests |

---

## 4. Architecture

### Directory Structure

```text
mern-blog/
├── package.json                   # Workspace scripts for development, testing, and builds
├── frontend/                      # React + TypeScript client application
│   ├── src/
│   │   ├── components/            # Reusable UI components (Avatar, Button, Card, Toast, notifications)
│   │   ├── context/               # Global state (AppContext: auth, notifications, data)
│   │   ├── layouts/               # Layout shells (PublicLayout, DashboardLayout, AdminLayout)
│   │   ├── pages/
│   │   │   ├── admin/             # Admin console views (Dashboard, Users, Posts, Comments)
│   │   │   ├── public/            # Public views (HomePage, BlogListPage, PostDetailPage, LoginPage, RegisterPage)
│   │   │   └── user/              # Author views (Dashboard, MyPosts, CreatePost, EditPost, Profile)
│   │   ├── services/              # Socket client manager (socket.ts)
│   │   ├── test/                  # Frontend test suites (auth.test.tsx, setup.ts)
│   │   ├── types/                 # Shared TypeScript interfaces
│   │   └── utils/                 # Fetch API wrapper and token storage
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/                       # Express + TypeScript server application
    ├── src/
    │   ├── config/                # Environment configuration and defaults
    │   ├── controllers/           # HTTP request handlers
    │   ├── middleware/            # Auth, RBAC, validation, rate limiting, error handling
    │   ├── models/                # Mongoose schemas (User, Post, Comment)
    │   ├── routes/                # Express router definitions (/api/v1/*)
    │   ├── scripts/               # Admin seed and sample data scripts
    │   ├── services/              # Business logic and database operations
    │   ├── socket/                # Socket.io auth, handlers, and notification emitter
    │   ├── utils/                 # JWT utilities, API response formatters, slug generator
    │   ├── validators/            # Joi validation schemas
    │   ├── app.ts                 # Express application configuration
    │   └── server.ts              # Unified HTTP + Socket.io server bootstrap
    ├── tests/
    │   ├── integration/           # Supertest API and Socket.io integration tests
    │   └── unit/                  # Cryptography, JWT, RBAC, validators, slug unit tests
    ├── jest.config.js
    ├── package.json
    └── tsconfig.json
```

### Request Lifecycle Flow

```text
Client Request
      │
      ▼
Helmet & CORS Protection
      │
      ▼
Global Rate Limiter (`/api/*`)
      │
      ▼
Express Router (`/api/v1/*`)
      │
      ▼
Route-Level Middleware
  ├── Auth Middleware (`authenticate` / `optionalAuthenticate`)
  ├── RBAC Middleware (`requireRole` / `requireAdmin`)
  └── Input Validation (`validate({ body, params, query })`)
      │
      ▼
Controller Layer (extracts parameters, invokes service, formats response)
      │
      ▼
Service Layer (business rules, ownership checks, persistence)
      │
      ├── Mongoose Models ──► MongoDB
      └── Socket Notification Emitter ──► Socket.io (`user:{userId}`)
      │
      ▼
Consistent JSON Response (`sendSuccess` / `sendPaginated`)
      │
      ▼ (on error)
Centralized Error Handler (`errorHandler` formats response and masks internal errors)
```

---

## 5. Authentication Flow

### Local Email & Password Flow
1. **Registration / Login**: The client submits credentials to `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.
2. **Password Verification**: Passwords are compared using `bcrypt.compare()` against the stored hash.
3. **Token Issuance**: The server returns:
   - **Access Token**: Signed with `JWT_ACCESS_SECRET` (15-minute expiration), containing `{ userId, role }`.
   - **Refresh Token**: Signed with `JWT_REFRESH_SECRET` (7-day expiration), containing `{ userId, role, tokenVersion }`.
4. **Subsequent API Requests**: The client includes the access token in the authorization header:
   ```http
   Authorization: Bearer <access_token>
   ```
5. **Token Refresh**: When the access token expires, the client calls `POST /api/v1/auth/refresh` with the refresh token. The server verifies the token signature and checks that `tokenVersion` matches the database record.
6. **Session Invalidation**: Calling `POST /api/v1/auth/logout` increments the user's `tokenVersion` in MongoDB, invalidating all outstanding refresh tokens for that account.

### OAuth 2.0 Authentication Flow
```text
Browser                         Server                      OAuth Provider (Google/Facebook)
   │                              │                                       │
   │─── Click "Sign in with..." ─►│                                       │
   │    GET /api/v1/auth/{prov}   │─── Redirect with state & scope ──────►│
   │                              │                                       │
   │◄── User consents & redirects to Callback with ?code=... ─────────────│
   │    GET /api/v1/auth/{prov}/callback                                  │
   │                              │─── Exchange code for access token ───►│
   │                              │◄── Return provider access token ──────│
   │                              │                                       │
   │                              │─── Fetch user profile ───────────────►│
   │                              │◄── Return email, name, avatar ────────│
   │                              │                                       │
   │                              ├─── Find or create user in MongoDB     │
   │                              │    (new accounts default to 'user')   │
   │                              ├─── Sign application JWT tokens        │
   │                              │                                       │
   │◄── Redirect to Frontend ─────│                                       │
   │    /login?accessToken=...&refreshToken=...                           │
   │                                                                      │
   ├── Store tokens & initialize Socket.io connection                     │
```

---

## 6. Roles & Authorization

| Role | Access Scope & Capabilities |
| :--- | :--- |
| **Public** | Read published articles, browse tags, search posts, read approved comments. |
| **User** | All public capabilities + create posts, edit/delete owned posts, post comments, edit/delete owned comments, update profile, real-time notification alerts. |
| **Admin** | All user capabilities + manage any post, moderate comments (`visible` / `hidden`), access admin metrics, list all users, toggle user bans, and update user roles. |

---

## 7. API Documentation

Base path: `/api/v1`

### Authentication (`/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user account (rate limited) |
| `POST` | `/auth/login` | Public | Login with email and password (rate limited) |
| `POST` | `/auth/refresh` | Public | Exchange refresh token for fresh token pair (rate limited) |
| `POST` | `/auth/logout` | Optional Auth | Logout and revoke refresh tokens |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/auth/google` | Public | Initiate Google OAuth 2.0 authorization |
| `GET` | `/auth/google/callback` | Public | Handle Google OAuth code exchange |
| `GET` | `/auth/facebook` | Public | Initiate Facebook OAuth 2.0 authorization |
| `GET` | `/auth/facebook/callback`| Public | Handle Facebook OAuth code exchange |

### Posts (`/posts`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | Public (Opt. Auth) | List published posts with pagination, search, and filters |
| `GET` | `/posts/stats` | Public | Public post and reader statistics |
| `GET` | `/posts/:slug` | Public | Fetch a single post by unique slug (increments views) |
| `POST` | `/posts` | Authenticated | Create a new post |
| `PUT` | `/posts/:id` | Authenticated | Update post (author or admin override) |
| `DELETE`| `/posts/:id` | Authenticated | Soft delete post (author or admin override) |
| `GET` | `/posts/:postId/comments` | Public | Fetch published comments for a post |
| `POST` | `/posts/:postId/comments` | Authenticated | Add a comment to a post |

### Comments (`/comments`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/comments/post/:postId` | Public | Alternative root path for post comments |
| `POST` | `/comments` | Authenticated | Create comment (requires `content`, `postId`) |
| `PUT` | `/comments/:id` | Authenticated | Update own comment |
| `DELETE`| `/comments/:id` | Authenticated | Soft delete own comment |
| `PATCH` | `/comments/:id/status` | Admin | Moderate comment status (`visible` / `hidden`) |

### Users (`/users`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Authenticated | Get own profile details |
| `PUT` | `/users/me` | Authenticated | Update own name, bio, or avatar |
| `GET` | `/users` | Admin | List all registered users (paginated) |
| `GET` | `/users/:id` | Admin | Get single user by ID |
| `PATCH` | `/users/:id/role` | Admin | Change user role (`user` / `admin`) |
| `PATCH` | `/users/:id/ban` | Admin | Ban or unban user account |
| `DELETE`| `/users/:id` | Admin | Delete user and soft delete associated records |

### Admin Console (`/admin`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | Admin | Retrieve platform-wide metrics |
| `GET` | `/admin/comments` | Admin | Paginated list of all comments for moderation |

### System
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Healthcheck and server timestamp |

---

## 8. API Response Format

All API responses use a standard response envelope.

### Success Response
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "6740b2e3f538e1a1b8c12345",
      "title": "Scaling Distributed Applications",
      "slug": "scaling-distributed-applications",
      "excerpt": "An architectural guide to scalability...",
      "content": "Full article markdown content...",
      "authorId": "6740b2e3f538e1a1b8c12340",
      "authorName": "Elena Rostova",
      "views": 42,
      "createdAt": "2026-10-01T12:00:00.000Z"
    }
  }
}
```

### Paginated Success Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required, Excerpt must not exceed 500 characters",
    "details": [
      { "field": "title", "message": "\"title\" is required" }
    ]
  }
}
```

---

## 9. Database Models & Schema Design

### Entity Relationships

```text
       ┌──────────────────────┐
       │         User         │
       └──────────┬───────────┘
                  │ 1
                  │
        ┌─────────┴─────────┐
      N │                 N │
        ▼                   ▼
┌──────────────┐     ┌──────────────┐
│     Post     │◄────┤   Comment    │
└──────────────┘ 1 N └──────────────┘
```

### Models Overview
- **User (`User.ts`)**:
  - Fields: `name`, `email` (unique index), `password` (hashed, `select: false`), `role` (`user` \| `admin`), `provider` (`local` \| `google` \| `facebook`), `providerId`, `avatar`, `bio`, `banned`, `tokenVersion`.
  - Indexes: `{ email: 1 }` (unique), `{ provider: 1, providerId: 1 }` (sparse).
- **Post (`Post.ts`)**:
  - Fields: `title`, `slug` (unique index), `excerpt`, `content`, `coverImage`, `tags`, `status` (`published` \| `draft`), `author` (ref: `User`), `views`, `likes`, `deletedAt`.
  - Indexes: `{ slug: 1 }` (unique), `{ author: 1 }`, `{ status: 1, createdAt: -1 }`, `{ tags: 1, status: 1 }`, `{ author: 1, createdAt: -1 }`.
  - Soft Delete: Query middleware automatically filters out records where `deletedAt !== null` unless explicitly requested.
- **Comment (`Comment.ts`)**:
  - Fields: `content`, `author` (ref: `User`), `post` (ref: `Post`), `status` (`visible` \| `hidden`), `deletedAt`.
  - Indexes: `{ post: 1, status: 1, createdAt: -1 }`, `{ author: 1 }`, `{ post: 1 }`.

---

## 10. Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `PORT` | Server listening port | `5000` |
| `CLIENT_URL` | Allowed frontend origin for CORS and OAuth redirects | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/mern_blog` |
| `JWT_ACCESS_SECRET` | Secret key for access token signing | `<jwt-access-secret>` |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | `<jwt-refresh-secret>` |
| `JWT_ACCESS_EXPIRES_IN` | Access token duration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token duration | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Maximum API requests allowed per window | `100` |
| `ADMIN_NAME` | Name for initial admin account seed | `Administrator` |
| `ADMIN_EMAIL` | Email for initial admin account seed | `admin@example.com` |
| `ADMIN_PASSWORD` | Password for initial admin account seed | `<admin-password>` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `<google-client-id>` |
| `GOOGLE_CLIENT_SECRET`| Google OAuth Client Secret | `<google-client-secret>` |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | `http://localhost:5000/api/v1/auth/google/callback` |
| `FACEBOOK_APP_ID` | Facebook OAuth App ID | `<facebook-app-id>` |
| `FACEBOOK_APP_SECRET` | Facebook OAuth App Secret | `<facebook-app-secret>` |
| `FACEBOOK_CALLBACK_URL`| Facebook OAuth callback URL | `http://localhost:5000/api/v1/auth/facebook/callback` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | API base endpoint | `http://localhost:5000/api/v1` |

---

## 11. Installation & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas cluster

### Clone Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

---

## 12. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URI and secrets
   ```
4. **Seed the Initial Administrator Account**:
   ```bash
   npm run seed:admin
   ```
   *Creates the administrator account using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.*
5. **(Optional) Seed Sample Articles**:
   ```bash
   npm run seed:blogs
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:5000` with hot-reloading via `tsx`.*

---

## 13. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Ensure VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The client application starts at `http://localhost:5173`.*

---

## 14. Running Tests

The test suite includes unit tests, integration tests, Socket.io event tests, and frontend component tests.

### Backend Tests (Jest)
Run all backend unit and integration test suites:
```bash
cd backend
npm test
```

Run tests with coverage reporting:
```bash
npm run test:coverage
```

### Frontend Tests (Vitest)
Run frontend UI and form validation tests:
```bash
cd frontend
npm test
```

### Test Coverage Overview
The test suite contains 79 passing tests across backend and frontend:
- **Backend**: 6 test suites, 73 tests covering authentication, RBAC, validators, slug generation, REST endpoints, and Socket.io events.
- **Frontend**: 1 test suite, 6 tests covering login and registration form validation and rendering.

---

## 15. Security

- **Password Storage**: Passwords are encrypted using bcrypt with 10 salt rounds before persistence. The password field is omitted from default queries (`select: false`) and stripped by the schema's `toJSON()` transform.
- **Role Assignment**: Public registration schemas do not accept role parameters; accounts created via public endpoints are always assigned the `user` role.
- **Access Control**: Protected endpoints require `authenticate` and role-checking middleware (`requireRole`, `requireAdmin`).
- **Resource Ownership**: Authorship is verified by comparing `resource.author.toString()` with `req.user.id` from the verified JWT.
- **Token Separation**: Distinct secrets are used for access tokens and refresh tokens.
- **Refresh Revocation**: User records maintain a `tokenVersion` counter that is incremented upon logout to invalidate existing refresh tokens.
- **Input Validation**: Joi validation schemas strip unknown properties and enforce format and length constraints.
- **Error Handling**: The centralized error handler prevents internal error traces and database details from being returned in production.
- **Headers & CORS**: HTTP security headers are set using Helmet, and CORS is restricted to the configured `CLIENT_URL`.

---

## 16. Performance

- **Indexing**: B-Tree indexes on `slug`, `email`, and `author`, with compound indexes on `{ status: 1, createdAt: -1 }` and `{ post: 1, status: 1, createdAt: -1 }` to support common query patterns.
- **Capped Pagination**: Query parameters are validated with default (`limit=10`) and maximum (`limit=100`) page sizes to prevent unbounded database reads.
- **Field Selection**: Population queries explicitly select required fields (for example, `.populate('author', 'name avatar')`) to minimize memory usage and payload size.
- **Response Compression**: Gzip compression is enabled globally via `compression()` middleware.

---

## 17. Development Commands

### Root Workspace Commands
```bash
npm run dev            # Start frontend and backend concurrently
npm run build          # Build both frontend and backend for production
npm run seed:admin     # Seed administrator account
npm run seed:blogs     # Seed sample articles and demo authors
```

### Backend Commands (`/backend`)
```bash
npm run dev            # Start backend in watch mode with tsx
npm run build          # Compile TypeScript to dist/
npm run start          # Start compiled server (node dist/server.js)
npm run typecheck      # Run tsc type validation
npm test               # Run Jest test suites
npm run test:coverage  # Run Jest with coverage report
npm run seed:admin     # Seed administrator account
npm run seed:blogs     # Populate sample posts and users
```

### Frontend Commands (`/frontend`)
```bash
npm run dev            # Start Vite development server
npm run build          # Build production bundle with Vite
npm run typecheck      # Run tsc type validation
npm test               # Run Vitest test runner
npm run preview        # Preview production build locally
```

---

## 18. Demo Walkthrough

A walkthrough of the application can cover:

1. **Authentication**: Register a new account on `/register` or sign in on `/login`. Inspect the returned JWT access and refresh tokens.
2. **Blog Browsing & Search**: Browse the article index on `/blog`, search by keyword or tag, and view individual article details.
3. **Creating & Managing Posts**: Access `/dashboard/create-post` to draft or publish an article. Edit post details or soft-delete the post to verify it is excluded from public views while preserved in the database.
4. **Comments & Discussion**: Add comments on a published post and edit or delete owned comments.
5. **Administrative Controls**: Log in with the administrator account to access `/admin`. Review system metrics, inspect the user directory, modify user roles, and toggle comment visibility.
6. **Real-Time Notifications**: Open two browser windows with different authenticated users. Leave a comment from User B on User A's post to observe the immediate notification badge and dropdown update on User A's screen.
7. **Automated Tests**: Run `npm test` in the backend and frontend directories to execute the automated test suites.

---

## 19. Engineering Highlights & Design Decisions

- **Unified HTTP + Socket.io Server**: Socket.io attaches to the Express HTTP server instance, allowing real-time capabilities to share the same port and host without separate server management.
- **Isolated Socket Authentication**: WebSocket connections verify JWTs on handshake and place sockets in private personal rooms (`user:{userId}`) to isolate notification delivery.
- **Service Layer Pattern**: Business logic and database operations are encapsulated in service files (`auth.service.ts`, `post.service.ts`, `comment.service.ts`, `user.service.ts`), keeping controller methods concise and focused on HTTP transport.
- **Standardized API Contract**: All endpoints use consistent JSON envelopes (`sendSuccess`, `sendPaginated`, `sendError`), making client integration predictable.
- **Defense in Depth**: Incoming requests pass through Joi validation, JWT authentication, and role authorization before reaching service operations.

---

## 20. Future Roadmap

- **End-to-End Automated Testing**: Add Playwright test suites for automated browser testing.
- **Object Storage Integration**: Support cloud storage (AWS S3 or Cloudinary) for article cover images and avatars.
- **Email Verification & Password Reset**: Implement transactional emails for account verification and password reset workflows.
- **Full-Text Search Indexing**: Incorporate MongoDB Atlas Search or compound text indexing for enhanced search scoring.

---

## 21. License

No license has been specified for this project. All rights are reserved by the repository owner.
