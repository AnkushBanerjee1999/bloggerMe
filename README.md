# bloggerMe — Full-Stack MERN Blog Platform

> A production-style, TypeScript-powered blogging platform built with React, Node.js, Express, MongoDB, Socket.io, and JWT authentication.

---

## 1. Overview

**bloggerMe** is a full-featured, secure, and performant content publishing platform designed with clean architectural boundaries. It delivers a modern developer and user experience with robust role-based access control, real-time event updates, resilient token management, social OAuth 2.0 authentication, and a clean administrative suite.

### Key Highlights
- **Audience & Use Cases**: Authors and readers looking for a responsive publishing platform with rich Markdown styling, personal management dashboards, comment threads, and administrative oversight.
- **Main User Flows**: Readers can browse published posts, search by keyword/tag, read articles, and participate in discussion threads. Registered authors can publish, edit, draft, and soft-delete their own posts and manage comments.
- **Admin Capabilities**: Dedicated administrative console providing user directory management, role upgrades/downgrades, account suspension (ban/unban), post moderation, and comment visibility toggling (`visible` / `hidden`).
- **Real-Time Experience**: Socket.io integration delivering instantaneous notifications directly to targeted user rooms for comments, status changes, and role assignments without polling.
- **Security-First Architecture**: Dual-token JWT (access & refresh) with database-backed revocation, bcrypt password hashing, Joi validation schemas with unknown property stripping, Helmet protection, strict CORS, and centralized error sanitization.

---

## 2. Features

### Authentication & Sessions
- **Email & Password Registration**: Clean registration with client & server validation; automatically assigns default `'user'` role with zero privilege escalation attack surface.
- **Dual-Token JWT Authentication**: Short-lived access tokens (15m) and long-lived refresh tokens (7d).
- **Token Invalidation & Revocation**: Instant revocation of all issued refresh tokens on logout via atomic `tokenVersion` increments in MongoDB.
- **OAuth 2.0 Integration**: Native Google and Facebook social login flows that securely map external identities to local database accounts and issue standard application JWTs.
- **Rate Limiting**: IP-based rate limiting on sensitive authentication routes (`20` requests per 15 minutes) and API endpoints (`100` requests per 15 minutes) via `express-rate-limit`.

### Authorization & RBAC
- **Strict Role-Based Access Control**:
  - `user`: Create, update, soft-delete own posts and comments; manage personal profile.
  - `admin`: Platform-wide access to all posts, moderation over comments, user management, and analytics.
- **Resource Ownership Verification**: Verified server-side via authenticated token payload (`req.user.id`). Client-supplied user identities are never trusted.
- **Backend Boundary**: Frontend route guards provide clean navigation UX, while server-side middleware (`authenticate`, `requireRole`, `requireAdmin`) guarantees impenetrable authorization boundaries.

### Blog Posts
- **Full CRUD Lifecycle**: Create, view, update, and soft-delete posts with rich content, excerpts, tags, and cover images.
- **Clean URL Slugs**: Automatic kebab-case slug generation with collision detection and sequential suffix resolution (`post-title-1`, `post-title-2`).
- **Soft Deletion Pattern**: Deleted posts retain referential integrity with `deletedAt` timestamps and are automatically filtered out from public queries via Mongoose query middleware.
- **Admin Overrides**: Administrators can edit or delete any post to enforce platform standards.
- **Pagination & Sorting**: Paginated listing supporting `newest`, `oldest`, and `popular` (by views) with capped maximum limits.

### Comments & Moderation
- **Post Discussion Threads**: Authenticated users can leave comments on any published post.
- **Author Ownership**: Commenters can edit or delete their own comments.
- **Admin Moderation**: Administrators can toggle comment visibility (`visible` / `hidden`) across all posts.
- **Real-Time Notification Delivery**: Socket.io alerts the post author immediately when a new comment is posted (skipping self-notifications) and notifies comment authors when moderation status changes.

### Admin Panel
- **Analytics & Platform Stats**: Global statistics including total registered users, published posts, drafts, and comments.
- **User Management**: Paginated user directory with search by name/email, account ban/unban toggling, and role modification (`user` ↔ `admin`).
- **Centralized Moderation**: Administrative comment browser to inspect, hide, or restore discussions platform-wide.

### Real-Time Notifications (Socket.io)
- **Unified Server**: Attached directly to the existing HTTP server instance (`http.createServer(app)`).
- **Handshake Authentication**: Mandatory JWT verification on socket connection via `auth: { token }` or headers.
- **Personal User Rooms**: Authenticated sockets are automatically joined to isolated rooms (`user:{userId}`).
- **Event Types Supported**:
  - `NEW_COMMENT`: Delivered to the post author when a reader comments.
  - `COMMENT_STATUS_CHANGED`: Delivered to the comment author when an admin changes comment status.
  - `ROLE_CHANGED`: Delivered to the user when their account role is updated by an admin.
- **Frontend Reactive UI**: Interactive notification bell in public, user, and admin headers with real-time badges, dropdown panels, mark-as-read state, and instant navigation.

---

## 3. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Component-based, fully typed user interface |
| **Frontend Tooling** | Vite 5 | Fast development server and production bundler |
| **Routing** | React Router v6 | Client-side routing and protected layout guards |
| **Icons & Styling** | Lucide React + Tailwind CSS | Iconography and responsive styling |
| **Real-Time Client** | Socket.io Client (v4.8) | WebSocket connection with fallback transports |
| **Backend Runtime** | Node.js (ESM) + TypeScript | Modern JavaScript backend environment |
| **Web Framework** | Express 4 | RESTful API server with routing middleware |
| **Real-Time Server** | Socket.io (v4.8) | Real-time event gateway and room isolation |
| **Database & ODM** | MongoDB + Mongoose 8 | Document database with schema enforcement and indexes |
| **Authentication** | JWT (`jsonwebtoken`) | Stateless access and refresh tokens |
| **Password Hashing** | `bcryptjs` | Salted password hashing (10 rounds) |
| **Validation** | Joi | Input schema validation with unknown field stripping |
| **Security & Headers** | Helmet, CORS, Cookie-Parser | HTTP header hardening and origin protection |
| **Compression & Rate Limiting** | `compression`, `express-rate-limit` | Response gzip compression and IP request limiting |
| **Backend Testing** | Jest + Supertest + `ts-jest` | Unit and integration test runners |
| **Frontend Testing** | Vitest + Testing Library + JSDOM | Component unit and form validation tests |

---

## 4. Architecture

### Directory Structure

```text
mern-blog/
├── package.json                   # Workspace scripts for dev, build, test, and seed
├── frontend/                      # React + TypeScript client application
│   ├── src/
│   │   ├── components/            # Reusable UI components (Avatar, Button, Card, Toast, notifications)
│   │   ├── context/               # Global state (AppContext: auth, notifications, data)
│   │   ├── layouts/               # Layout shells (PublicLayout, DashboardLayout, AdminLayout)
│   │   ├── pages/
│   │   │   ├── admin/             # Admin console views (Dashboard, Users, Posts, Comments)
│   │   │   ├── public/            # Public views (HomePage, BlogListPage, PostDetailPage, LoginPage, RegisterPage)
│   │   │   └── user/              # Author views (Dashboard, MyPosts, CreatePost, EditPost, Profile)
│   │   ├── services/              # Singleton socket manager (socket.ts)
│   │   ├── test/                  # Frontend test suites (auth.test.tsx, setup.ts)
│   │   ├── types/                 # Shared frontend TypeScript interfaces
│   │   └── utils/                 # Axios-like fetch API wrapper and token storage
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/                       # Express + TypeScript server application
    ├── src/
    │   ├── config/                # Environment variable parsing and defaults
    │   ├── controllers/           # HTTP request/response handlers
    │   ├── middleware/            # Auth, RBAC, validation, rate limiting, error handling
    │   ├── models/                # Mongoose schemas (User, Post, Comment)
    │   ├── routes/                # Express router definitions (/api/v1/*)
    │   ├── scripts/               # Admin seeding and demo content generators
    │   ├── services/              # Pure business logic and database operations
    │   ├── socket/                # Socket.io auth, handlers, emitter, and room logic
    │   ├── utils/                 # JWT sign/verify, API response wrappers, slug generator, AppError
    │   ├── validators/            # Joi validation schemas
    │   ├── app.ts                 # Express application setup
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
Service Layer (business rules, permission validation, persistence)
      │
      ├── Mongoose Models ──► MongoDB
      └── Socket Notification Emitter ──► Socket.io (`user:{userId}`)
      │
      ▼
Consistent JSON Response (`sendSuccess` / `sendPaginated`)
      │
      ▼ (on error)
Centralized Error Handler (`errorHandler` strips internals in production)
```

---

## 5. Authentication Flow

### Local Email & Password Flow
1. **Registration / Login**: Client sends credentials to `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.
2. **Verification & Hashing**: Passwords are verified using `bcrypt.compare()` against salt-hashed database entries.
3. **Token Issuance**: The server generates:
   - **Access Token**: Signed with `JWT_ACCESS_SECRET` (expires in 15 minutes), containing `{ userId, role }`.
   - **Refresh Token**: Signed with `JWT_REFRESH_SECRET` (expires in 7 days), containing `{ userId, role, tokenVersion }`.
4. **Subsequent API Requests**: The client provides the access token via the HTTP header:
   ```http
   Authorization: Bearer <access_token>
   ```
5. **Token Refresh**: When the access token expires, the client calls `POST /api/v1/auth/refresh` with the refresh token. The server validates the token and confirms `tokenVersion` matches the user record.
6. **Session Revocation**: Calling `POST /api/v1/auth/logout` atomically increments the user's `tokenVersion` in MongoDB, instantly invalidating all previously issued refresh tokens.

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
   │                              │    (strictly assign role: 'user')     │
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
| **Admin** | All user capabilities + manage any post, moderate any comment (`visible` / `hidden`), access admin metrics/stats, list users, toggle user bans, and upgrade/downgrade user roles. |

*Note: While client-side route guards prevent unauthorized navigation, the Express backend serves as the authoritative security boundary.*

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

All API responses strictly adhere to a consistent contract.

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

### Entity Relationship Diagram

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
  - Soft Delete: Query middleware automatically suppresses records where `deletedAt !== null` unless explicitly requested.
- **Comment (`Comment.ts`)**:
  - Fields: `content`, `author` (ref: `User`), `post` (ref: `Post`), `status` (`visible` \| `hidden`), `deletedAt`.
  - Indexes: `{ post: 1, status: 1, createdAt: -1 }`, `{ author: 1 }`, `{ post: 1 }`.

---

## 10. Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application runtime mode (`development` / `production`) | `development` |
| `PORT` | HTTP port for backend API & Socket.io server | `5000` |
| `CLIENT_URL` | Allowed frontend URL for CORS & redirects | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mern_blog` |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens | `<strong-random-string>` |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | `<different-strong-random-string>` |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Global rate limit window in milliseconds | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Maximum API requests allowed per window | `100` |
| `ADMIN_NAME` | Display name for seed admin account | `Administrator` |
| `ADMIN_EMAIL` | Email for seed admin account | `admin@example.com` |
| `ADMIN_PASSWORD` | Password for seed admin account | `<secure-admin-password>` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console OAuth Client ID | `<client-id>.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| Google Cloud Console OAuth Client Secret | `<client-secret>` |
| `GOOGLE_CALLBACK_URL` | Registered Google OAuth redirect URI | `http://localhost:5000/api/v1/auth/google/callback` |
| `FACEBOOK_APP_ID` | Meta for Developers App ID | `<app-id>` |
| `FACEBOOK_APP_SECRET` | Meta for Developers App Secret | `<app-secret>` |
| `FACEBOOK_CALLBACK_URL`| Registered Facebook OAuth redirect URI | `http://localhost:5000/api/v1/auth/facebook/callback` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint URL for the backend API | `http://localhost:5000/api/v1` |

---

## 11. Installation & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a MongoDB Atlas cluster URI

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
   # Edit .env with your MongoDB URI, JWT secrets, and optional OAuth credentials
   ```
4. **Provision the Administrator Account**:
   ```bash
   npm run seed:admin
   ```
   *Creates the initial admin account defined by `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.*
5. **(Optional) Seed Rich Demo Blogs**:
   ```bash
   npm run seed:blogs
   ```
6. **Start the backend development server**:
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
4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

## 14. Running Tests

The test suite covers unit logic, end-to-end HTTP integration, real-time Socket.io events, and React component behaviors.

### Backend Tests (Jest)
Run all backend unit and integration test suites:
```bash
cd backend
npm test
```
Run with code coverage reporting:
```bash
npm run test:coverage
```

### Frontend Tests (Vitest)
Run frontend UI and authentication tests:
```bash
cd frontend
npm test
```

### Current Test Suite Verification
```text
Backend Test Suites:  6 passed, 6 total
Backend Tests:        73 passed, 73 total
Frontend Test Suites: 1 passed, 1 total
Frontend Tests:       6 passed, 6 total
Total Passing Tests:  79 passed (100% pass rate)
```

---

## 15. Security & Hardening Controls

- **Database Password Obfuscation**: User passwords cannot be fetched by default queries (`select: false`), and are scrubbed inside the schema's `toJSON()` transform.
- **Strict Role Elevation Prevention**: The public registration schema strips any arbitrary `role` parameter using Joi's `{ stripUnknown: true }`. New accounts are always instantiated with role `'user'`.
- **Dual-Layer RBAC**: Endpoints require `authenticate` and `requireAdmin()` middleware before reaching business logic.
- **Resource Ownership Enforcement**: Update and delete handlers check `resource.author.toString() === req.user.id` or bypass only if `req.user.role === 'admin'`.
- **JWT Cryptographic Isolation**: Access tokens and refresh tokens utilize distinct secrets (`JWT_ACCESS_SECRET` vs `JWT_REFRESH_SECRET`) and are rejected if interchanged.
- **Refresh Token Invalidation**: Instant logout revocation using an atomic `tokenVersion` counter.
- **Input Sanitization**: MongoDB ObjectIds, slugs, and payload schemas are strictly typed and validated before reaching Mongoose.
- **Production Error Masking**: `errorHandler` suppresses internal error stacks and database details in production environments.
- **Strict CORS & Helmet**: CORS is restricted to the specific frontend origin (`config.clientUrl`), and standard HTTP security headers are set via Helmet.

---

## 16. Performance & Optimizations

- **Database Indexing**:
  - Slugs, email addresses, and authors have dedicated B-Tree indexes.
  - Compound indexes on `{ status: 1, createdAt: -1 }` and `{ post: 1, status: 1, createdAt: -1 }` optimize public feeds and discussion thread queries.
- **Pagination & Capped Page Limits**:
  - Global pagination validation enforces default (`limit=10`) and maximum (`limit=100`) constraints to prevent denial-of-service via unbounded database queries.
- **Selective Population**:
  - Population queries explicitly select minimal required fields (e.g., `.populate('author', 'name avatar')`), reducing memory usage and network transfer overhead.
- **Efficient Gzip Compression**:
  - Enabled globally via `compression()` middleware for all JSON responses.

---

## 17. Development Command Reference

### Root Workspace Commands
```bash
npm run dev            # Start both frontend and backend concurrently
npm run build          # Build both frontend and backend for production
npm run seed:admin     # Seed administrator account
npm run seed:blogs     # Seed sample articles and demo authors
```

### Backend Commands (`/backend`)
```bash
npm run dev            # Run backend in watch mode with tsx
npm run build          # Compile TypeScript code to dist/
npm run start          # Start compiled production server (node dist/server.js)
npm run typecheck      # Run tsc --noEmit for static type verification
npm test               # Run Jest test suite (unit + integration + socket)
npm run test:coverage  # Run Jest with coverage report
npm run seed:admin     # Provision admin user
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

## 18. Interview & Demo Walkthrough (5–10 Minutes)

Follow this structured flow for technical evaluations or portfolio walkthroughs:

1. **Architecture Overview (1 min)**:
   - Introduce the unified architecture: Express + TypeScript backend running beside a React 18 frontend with Socket.io real-time integration and MongoDB persistence.
2. **User Authentication & Session Management (2 mins)**:
   - Demonstrate user registration on `/register`. Explain how Joi validation prevents privilege escalation by stripping `role: admin`.
   - Log in and inspect the JWT tokens returned. Point out short-lived access tokens and database-backed refresh token rotation.
3. **Content Creation & Soft-Delete Lifecycle (2 mins)**:
   - Navigate to `/dashboard/create-post` and publish a blog article.
   - Show automatic slug generation with conflict suffix resolution.
   - Delete the post and demonstrate that it is softly deleted (`deletedAt`), remaining hidden from public queries while retaining data integrity.
4. **Role-Based Authorization & Admin Console (2 mins)**:
   - Log in with the administrator account (`npm run seed:admin`).
   - Open `/admin` to show platform metrics, the user directory, and comment moderation.
   - Toggle another user's role from `'user'` to `'admin'` or suspend an account.
5. **Real-Time Notification Delivery (2 mins)**:
   - Open two browser windows side-by-side (User A on window 1, User B on window 2).
   - Have User B leave a comment on User A's post.
   - Show the real-time notification bell update instantly on User A's screen via Socket.io without page reload.
6. **Code Quality & Testing (1 min)**:
   - Run `npm test` in the terminal to display all 79 unit and integration tests passing.

---

## 19. Engineering Highlights & Design Decisions

- **Unified HTTP + Socket.io Server**: Attached directly to a single HTTP instance (`http.createServer(app)`), avoiding duplicate server overhead or port conflicts.
- **Isolated Socket Authentication**: WebSocket handshakes verify standard application JWTs and automatically route users to private personal rooms (`user:{userId}`), isolating notification delivery.
- **Service Layer Pattern**: Business logic resides in dedicated services (`auth.service.ts`, `post.service.ts`, `comment.service.ts`, `user.service.ts`), decoupling Express request/response logic from database queries.
- **Standardized API Contract**: All endpoints use consistent JSON envelopes (`sendSuccess`, `sendPaginated`, `sendError`), making frontend consumption predictable.
- **Defense in Depth**: Public inputs are validated at the route boundary with Joi, authorized with JWT middleware, sanitized in the service layer, and indexed at the database level.

---

## 20. Future Roadmap

- **End-to-End Automated Testing**: Add Playwright test suites for automated cross-browser testing.
- **Object Storage Integration**: Migrate base64 image uploads to AWS S3 or Cloudinary.
- **Email Verification & Password Reset**: Implement transactional emails for account confirmation and secure reset flows.
- **Full-Text Search Indexing**: Upgrade regex search to MongoDB Atlas Search or compound text indexes.

---

## 21. License

No license has been specified for this project. All rights are reserved by the repository owner.
