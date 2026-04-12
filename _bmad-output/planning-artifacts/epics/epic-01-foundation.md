# Epic 1: Foundation & Development Environment

**Goal:** Establish the complete technical foundation and design system that enables all future development, including monorepo structure, database infrastructure, WebSocket architecture, deployment pipeline, and design token system.

**User Outcome:** Development team can build and deploy SyncRide features with proper tooling, infrastructure, monitoring, and design system in place.

**Requirements Covered:**

**Architecture Requirements (31):**
- ARCH-1 to ARCH-6: Monorepo setup with pnpm workspaces, Turborepo, frontend/backend structure, shared packages
- ARCH-7 to ARCH-11: Database and caching (MongoDB Atlas, Redis, time-series collections, TTL presence, geospatial indexing)
- ARCH-12 to ARCH-16: Backend infrastructure (Socket.io, JWT auth, WebSocket events, location broadcasting, CORS)
- ARCH-17 to ARCH-21: Frontend infrastructure (Vite PWA, Mapbox GL JS, Zustand, TanStack Query, WebSocket client)
- ARCH-22 to ARCH-25: Deployment and environment (Vercel, Railway, Zod validation, .env templates)
- ARCH-26 to ARCH-28: Monitoring and logging (Pino, Sentry, custom metrics)
- ARCH-29 to ARCH-31: CI/CD pipeline (GitHub Actions, Lighthouse CI, blue-green deployment)

**UX Design Requirements (13):**
- UX-DR1 to UX-DR4: Design system foundation (Tailwind CSS, design tokens, Shadcn/UI, Radix UI)
- UX-DR5 to UX-DR7: Color system (high-contrast palette, colorblind-safe, WCAG AA compliance)
- UX-DR8 to UX-DR10: Typography system (responsive scale, rem-based, glance mode sizes)
- UX-DR11 to UX-DR13: Spacing and layout (glove-friendly tokens, mobile-first, breakpoints)

**Non-Functional Requirements:**
- NFR-M1 to NFR-M14: Maintainability (TypeScript, ESLint, 70% test coverage, CI/CD, documentation)

**Implementation Priority:**
- Week 1-2: Monorepo initialization, database connections, shared types
- Week 3-4: WebSocket infrastructure, JWT auth, design system setup
- Week 5-6: CI/CD pipeline, monitoring, deployment configuration

---

## Stories (14 total)

### Story 1.1: Initialize Monorepo with Turborepo and pnpm Workspaces

As a **developer**,
I want **a monorepo structure with pnpm workspaces and Turborepo task orchestration**,
So that **I can develop frontend, backend, and shared packages in a unified codebase with efficient build caching**.

**Acceptance Criteria:**

**Given** I am setting up the SyncRide project
**When** I run the initialization commands
**Then** the following directory structure exists:
```
syncride-monorepo/
├── apps/
│   ├── web/          # React PWA (placeholder)
│   └── api/          # Node.js backend (placeholder)
├── packages/
│   ├── shared-types/ # TypeScript types (placeholder)
│   └── config/       # Shared configs (placeholder)
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
└── README.md
```

**And** `pnpm-workspace.yaml` defines the workspace structure with `apps/*` and `packages/*`
**And** `turbo.json` configures pipeline tasks (build, dev, lint, test) with proper caching
**And** root `package.json` includes Turborepo as dev dependency and workspace scripts
**And** `.gitignore` excludes `node_modules/`, `.turbo/`, `dist/`, and `.env` files
**And** `README.md` contains setup instructions for installing pnpm and running the monorepo

**Requirements Fulfilled:** ARCH-1

---

### Story 1.2: Setup Frontend App with Vite, React, TypeScript, and Tailwind CSS

As a **developer**,
I want **a frontend app initialized with Vite, React, TypeScript, and Tailwind CSS**,
So that **I can start building the PWA with fast HMR, type safety, and utility-first styling**.

**Acceptance Criteria:**

**Given** the monorepo structure exists from Story 1.1
**When** I initialize the frontend app in `apps/web/`
**Then** the app is created using Vite's `react-swc-ts` template with SWC compiler
**And** `package.json` in `apps/web/` includes dependencies:
  - `react`, `react-dom`
  - `vite`, `@vitejs/plugin-react-swc`
  - `typescript`
**And** `tailwindcss`, `postcss`, `autoprefixer` are installed as dev dependencies
**And** `tailwind.config.js` is initialized with proper content paths for purging unused styles
**And** `postcss.config.js` includes Tailwind and Autoprefixer plugins
**And** `src/index.css` imports Tailwind's base, components, and utilities layers
**And** `vite.config.ts` includes React plugin and configures dev server port (default 5173)
**And** `tsconfig.json` is configured with strict mode and proper ES module resolution
**And** running `pnpm dev` in `apps/web/` starts the Vite dev server successfully
**And** the default React app renders with Tailwind styles applied

**Requirements Fulfilled:** ARCH-2, UX-DR1

---

### Story 1.3: Setup Backend API with Node.js, Express, Socket.io, and TypeScript

As a **developer**,
I want **a backend API initialized with Node.js, Express, Socket.io, and TypeScript**,
So that **I can build the REST API and WebSocket server with type safety**.

**Acceptance Criteria:**

**Given** the monorepo structure exists from Story 1.1
**When** I initialize the backend app in `apps/api/`
**Then** the directory structure is created:
```
apps/api/
├── src/
│   ├── index.ts           # Entry point
│   ├── server.ts          # Express + Socket.io setup
│   └── routes/            # API routes (placeholder)
├── package.json
├── tsconfig.json
├── .env.example
└── nodemon.json
```

**And** `package.json` includes dependencies:
  - `express`, `socket.io`, `cors`, `dotenv`
  - `@types/express`, `@types/cors`
  - `typescript`, `ts-node-dev`, `nodemon` (dev dependencies)
**And** `tsconfig.json` is configured for Node.js with `commonjs` module, `esModuleInterop`, and output to `dist/`
**And** `src/index.ts` initializes Express server with CORS, basic health check route, and Socket.io connection handler
**And** `src/server.ts` exports configured HTTP server and Socket.io instance
**And** `.env.example` includes template environment variables (`PORT`, `NODE_ENV`)
**And** `nodemon.json` watches `src/**/*.ts` and restarts on changes
**And** `package.json` scripts include:
  - `dev`: runs `nodemon` with `ts-node-dev`
  - `build`: compiles TypeScript to `dist/`
  - `start`: runs compiled JavaScript from `dist/`
**And** running `pnpm dev` in `apps/api/` starts the server on port 3000
**And** accessing `http://localhost:3000/health` returns `{ "status": "ok" }`
**And** WebSocket connection test succeeds with Socket.io client

**Requirements Fulfilled:** ARCH-3, ARCH-12

---

### Story 1.4: Setup MongoDB Atlas Connection with Mongoose ODM

As a **developer**,
I want **MongoDB Atlas connection configured with Mongoose ODM**,
So that **I can persist trip and rider data with proper schemas and time-series collections**.

**Acceptance Criteria:**

**Given** the backend API exists from Story 1.3
**When** I configure MongoDB connection
**Then** `mongoose` is installed as a dependency in `apps/api/`
**And** `apps/api/src/db/` directory contains:
  - `connection.ts`: MongoDB connection logic with retry handling
  - `models/index.ts`: Central export for all models (placeholder for future schemas)
**And** `connection.ts` reads `MONGODB_URI` from environment variables
**And** connection includes error handling with retry logic (max 5 attempts with exponential backoff)
**And** connection options include proper timeouts and connection pooling
**And** successful connection logs to console with Pino logger
**And** `.env.example` includes `MONGODB_URI` template with Atlas connection string format
**And** `src/index.ts` imports and calls MongoDB connection function before starting server
**And** with valid `MONGODB_URI` in `.env`, server starts and connects to MongoDB successfully
**And** connection failure logs clear error message and exits gracefully

**Requirements Fulfilled:** ARCH-7

---

### Story 1.5: Setup Upstash Redis Connection with ioredis Client

As a **developer**,
I want **Upstash Redis connection configured with ioredis client**,
So that **I can cache active location data and implement TTL-based presence detection**.

**Acceptance Criteria:**

**Given** the backend API exists from Story 1.3
**When** I configure Redis connection
**Then** `ioredis` is installed as a dependency in `apps/api/`
**And** `apps/api/src/cache/` directory contains:
  - `redis.ts`: Redis client initialization and connection logic
  - `presence.ts`: TTL-based presence helper functions (placeholder)
**And** `redis.ts` reads `REDIS_URL` from environment variables
**And** Redis client is configured with proper connection options (lazyConnect: false, retryStrategy with exponential backoff)
**And** client emits 'connect', 'ready', 'error', and 'close' events with appropriate logging
**And** `.env.example` includes `REDIS_URL` template with Upstash connection string format
**And** `src/index.ts` imports and initializes Redis client before starting server
**And** with valid `REDIS_URL` in `.env`, server starts and connects to Redis successfully
**And** connection failure logs clear error message and exits gracefully
**And** basic Redis SET and GET operations work correctly

**Requirements Fulfilled:** ARCH-9

---

### Story 1.6: Create Shared TypeScript Types Package

As a **developer**,
I want **a shared TypeScript types package for location coordinates, trip sessions, and WebSocket events**,
So that **frontend and backend can use consistent type definitions without duplication**.

**Acceptance Criteria:**

**Given** the monorepo structure exists
**When** I create the shared types package in `packages/shared-types/`
**Then** the directory structure is created:
```
packages/shared-types/
├── src/
│   ├── index.ts           # Central export
│   ├── location.ts        # Location types
│   ├── trip.ts            # Trip session types
│   └── websocket.ts       # WebSocket event types
├── package.json
└── tsconfig.json
```

**And** `location.ts` includes types:
  - `Coordinates { latitude: number, longitude: number, accuracy: number, timestamp: Date }`
  - `MotionState = 'stationary' | 'predictable' | 'dynamic'`
  - `LocationUpdate { riderId: string, coordinates: Coordinates, motionState: MotionState, heading?: number, speed?: number }`
**And** `trip.ts` includes types:
  - `TripCode = string` (6-character alphanumeric)
  - `TripStatus = 'active' | 'ended'`
  - `Trip { tripCode: TripCode, hostId: string, createdAt: Date, status: TripStatus, riders: string[] }`
  - `Rider { riderId: string, displayName: string, joinedAt: Date, isHost: boolean }`
**And** `websocket.ts` includes types:
  - `SocketEvent = 'trip:join' | 'trip:leave' | 'location:update' | 'sos:broadcast'`
  - `TripJoinPayload { tripCode: string, displayName: string }`
  - `LocationUpdatePayload { coordinates: Coordinates, motionState: MotionState }`
**And** all types are exported from `index.ts`
**And** `package.json` includes `main`, `module`, and `types` fields pointing to compiled output
**And** `tsconfig.json` is configured for library build with declaration files
**And** running `pnpm build` in `packages/shared-types/` compiles types successfully
**And** both `apps/web/` and `apps/api/` can import types from `@syncride/shared-types`

**Requirements Fulfilled:** ARCH-4

---

### Story 1.7: Configure Tailwind Design Tokens and Custom Theme

As a **developer**,
I want **Tailwind CSS configured with SyncRide-specific design tokens (colors, spacing, typography)**,
So that **I can build glove-friendly UI with consistent high-contrast styling and motion-state responsive design**.

**Acceptance Criteria:**

**Given** the frontend app with Tailwind exists from Story 1.2
**When** I configure the custom Tailwind theme in `apps/web/tailwind.config.js`
**Then** custom color palette is defined:
  - Glance mode colors: `glance-bg: '#000000'`, `glance-text: '#FFFFFF'`, `glance-primary: '#00FF00'`, `glance-warning: '#FFFF00'`, `glance-danger: '#FF0000'`
  - Standard mode colors: `map-bg: '#1A1A1A'`, `map-overlay: '#2A2A2A'`, `primary: '#3B82F6'`, `secondary: '#6B7280'`
**And** custom spacing scale includes glove-friendly sizes:
  - `touch-min: '80px'` (minimum touch target)
  - `touch-lg: '120px'` (large button)
  - `touch-xl: '160px'` (extra large, SOS button)
**And** custom fontSize includes glance mode sizes:
  - `glance-sm: ['2rem', { lineHeight: '2.5rem' }]`
  - `glance-base: ['3rem', { lineHeight: '3.5rem' }]`
  - `glance-lg: ['4rem', { lineHeight: '4.5rem' }]`
**And** custom breakpoints are configured:
  - `sm: '640px'`, `md: '768px'`, `lg: '1024px'`, `xl: '1280px'`, `2xl: '1440px'`
**And** content paths include all source files: `['./src/**/*.{js,jsx,ts,tsx}']`
**And** running `pnpm dev` shows custom classes are available (e.g., `bg-glance-bg`, `h-touch-min`, `text-glance-base`)
**And** all custom tokens are documented in `apps/web/README.md` with usage examples

**Requirements Fulfilled:** UX-DR2, UX-DR5, UX-DR8, UX-DR11

---

### Story 1.8: Setup Vite PWA Plugin for Service Worker and Offline Support

As a **developer**,
I want **Vite PWA plugin configured with service worker for offline capability**,
So that **users can add the app to their home screen and use basic functionality offline**.

**Acceptance Criteria:**

**Given** the frontend app exists from Story 1.2
**When** I configure the PWA plugin
**Then** `vite-plugin-pwa` and `workbox-window` are installed in `apps/web/`
**And** `vite.config.ts` includes PWA plugin configuration:
  - `registerType: 'autoUpdate'`
  - `includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png']`
  - Manifest configuration with app name "SyncRide", short_name, theme_color, icons
  - `workbox` configuration with runtime caching for Mapbox tiles and API requests
**And** `public/manifest.json` includes PWA manifest with proper icons (192x192, 512x512)
**And** service worker is generated during build with proper caching strategies
**And** running `pnpm build` generates service worker file in `dist/`
**And** built app can be added to home screen on mobile devices
**And** offline mode shows cached map tiles and queues location updates

**Requirements Fulfilled:** ARCH-17, FR65

---

### Story 1.9: Setup Environment Variables with Zod Validation

As a **developer**,
I want **environment variables validated with Zod schema for type safety**,
So that **configuration errors are caught at startup with clear error messages**.

**Acceptance Criteria:**

**Given** both frontend and backend apps exist
**When** I setup environment validation
**Then** `zod` is installed in `packages/config/` as a shared dependency
**And** `packages/config/src/env.ts` defines Zod schemas:
  - Frontend schema: `VITE_MAPBOX_TOKEN`, `VITE_API_URL`, `VITE_WS_URL`, `VITE_SENTRY_DSN`
  - Backend schema: `NODE_ENV`, `PORT`, `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `MAPBOX_TOKEN`, `SENTRY_DSN`
**And** schemas include proper validation (URLs, string length minimums, enums)
**And** validation function throws descriptive error if environment variables are missing or invalid
**And** `apps/api/src/index.ts` validates environment on startup before connecting to services
**And** `apps/web/src/main.tsx` validates environment before rendering React app
**And** `.env.example` files in both apps include all required variables with descriptive comments
**And** startup with invalid `.env` shows clear error message indicating which variables are invalid
**And** startup with valid `.env` passes validation without errors

**Requirements Fulfilled:** ARCH-24

---

### Story 1.10: Setup Pino Structured Logging for Backend

As a **developer**,
I want **Pino structured logging configured for the backend**,
So that **I can debug issues with JSON-formatted logs in production and pretty-printed logs in development**.

**Acceptance Criteria:**

**Given** the backend API exists from Story 1.3
**When** I configure Pino logging
**Then** `pino` and `pino-pretty` are installed in `apps/api/`
**And** `apps/api/src/utils/logger.ts` exports configured Pino logger:
  - Production: JSON output to stdout with log level 'info'
  - Development: pretty-printed output with colorization, log level 'debug'
**And** logger includes child logger factory for contextual logging
**And** all console.log calls in backend code are replaced with logger methods:
  - `logger.info()` for informational messages
  - `logger.error()` for errors with error objects
  - `logger.debug()` for debugging information
**And** logs include timestamps, hostname, and pid automatically
**And** running backend in development shows pretty-printed colored logs
**And** running backend in production outputs structured JSON logs
**And** error logs include full stack traces

**Requirements Fulfilled:** ARCH-26

---

### Story 1.11: Integrate Sentry Error Tracking for Frontend and Backend

As a **developer**,
I want **Sentry error tracking integrated in both frontend and backend**,
So that **production errors are captured with full context for debugging**.

**Acceptance Criteria:**

**Given** both frontend and backend apps exist
**When** I integrate Sentry
**Then** `@sentry/react` is installed in `apps/web/` and `@sentry/node` in `apps/api/`
**And** `apps/web/src/main.tsx` initializes Sentry:
  - DSN from `VITE_SENTRY_DSN` environment variable
  - Environment from `import.meta.env.MODE`
  - `tracesSampleRate: 0.1` for performance monitoring
  - `beforeSend` hook strips sensitive data (cookies, tokens)
**And** `apps/web/src/App.tsx` is wrapped in `<Sentry.ErrorBoundary>` with fallback UI
**And** `apps/api/src/index.ts` initializes Sentry:
  - DSN from `SENTRY_DSN` environment variable
  - Integrations for HTTP and Express tracing
  - `tracesSampleRate: 0.1`
**And** backend errors are automatically captured by Sentry Express middleware
**And** frontend React errors are captured by Error Boundary
**And** unhandled promise rejections are captured in both frontend and backend
**And** `.env.example` includes `SENTRY_DSN` template with instructions
**And** throwing a test error in development triggers Sentry capture (when DSN is configured)

**Requirements Fulfilled:** ARCH-27, NFR-M7

---

### Story 1.12: Setup GitHub Actions CI Pipeline

As a **developer**,
I want **GitHub Actions CI pipeline configured for automated testing and deployment**,
So that **code quality is enforced and deployments happen automatically on merge to main**.

**Acceptance Criteria:**

**Given** the monorepo exists with all foundational code
**When** I create `.github/workflows/ci.yml`
**Then** the CI workflow includes jobs:
  - **Lint**: Runs ESLint on all packages
  - **Type Check**: Runs TypeScript compiler in check mode
  - **Test**: Runs unit tests with coverage reports
  - **Build**: Builds all packages and apps
  - **Lighthouse CI**: Runs Lighthouse on built frontend app
**And** workflow triggers on push to `main` and pull request events
**And** uses pnpm for package management (setup-node with pnpm cache)
**And** Lighthouse job fails if LCP > 2.5s or FCP > 1.5s
**And** all jobs run in parallel where possible (lint, type-check, test)
**And** build job depends on successful completion of lint, type-check, and test
**And** workflow includes environment variable setup from GitHub secrets
**And** pushing code to new branch and creating PR triggers CI run
**And** CI passes when all checks succeed

**Requirements Fulfilled:** ARCH-29, ARCH-30, NFR-M5

---

### Story 1.13: Configure Vercel Deployment for Frontend PWA

As a **developer**,
I want **Vercel deployment configured for the React PWA frontend**,
So that **the app deploys automatically on push to main with preview deployments for PRs**.

**Acceptance Criteria:**

**Given** the frontend app is built and CI pipeline exists
**When** I configure Vercel deployment
**Then** `vercel.json` is created in project root with configuration:
  - `buildCommand: "cd apps/web && pnpm build"`
  - `outputDirectory: "apps/web/dist"`
  - Environment variables mapping for `VITE_*` prefixed vars
**And** Vercel project is linked to GitHub repository
**And** main branch auto-deploys to production on push
**And** pull requests create preview deployments with unique URLs
**And** environment variables are configured in Vercel dashboard:
  - `VITE_API_URL` (production API URL)
  - `VITE_WS_URL` (production WebSocket URL)
  - `VITE_MAPBOX_TOKEN`
  - `VITE_SENTRY_DSN`
**And** deployment includes automatic PWA optimization (manifest, service worker)
**And** production URL is accessible and app loads correctly
**And** PWA manifest is served correctly and app can be added to home screen

**Requirements Fulfilled:** ARCH-22

---

### Story 1.14: Configure Railway Deployment for Backend API

As a **developer**,
I want **Railway deployment configured for the Node.js backend API**,
So that **the backend deploys automatically with proper environment configuration and WebSocket support**.

**Acceptance Criteria:**

**Given** the backend API is built and CI pipeline exists
**When** I configure Railway deployment
**Then** Railway project is created and linked to GitHub repository
**And** Railway environment variables are configured:
  - `NODE_ENV: "production"`
  - `PORT: "3000"`
  - `MONGODB_URI` (MongoDB Atlas connection string)
  - `REDIS_URL` (Upstash Redis connection string)
  - `JWT_SECRET` (generated secure random string)
  - `SENTRY_DSN`
**And** Railway build configuration:
  - `buildCommand: "cd apps/api && pnpm build"`
  - `startCommand: "cd apps/api && pnpm start"`
**And** Railway domain is configured with custom domain or provided Railway URL
**And** WebSocket connections are enabled in Railway settings
**And** deployment triggers automatically on push to main branch
**And** health check endpoint `/health` returns 200 OK
**And** WebSocket test connection succeeds on Railway URL

**Requirements Fulfilled:** ARCH-23

---

## Epic 1 Summary

**Stories Created:** 14
**Requirements Covered:**
- Architecture: ARCH-1 to ARCH-31 (all 31 requirements)
- UX Design: UX-DR1, UX-DR2, UX-DR5, UX-DR8, UX-DR11 (design system foundation)
- NFRs: NFR-M1 to NFR-M14 (maintainability)

**Epic 1 Status:** ✅ Complete
