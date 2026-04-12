---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - 'prd.md (2,163 lines)'
  - 'product-brief-syncride.md (268 lines)'
  - 'ux-design-specification.md (4,848 lines)'
  - 'project_context.md (51 lines)'
  - 'prd-validation-report.md (1,121 lines)'
workflowType: 'architecture'
project_name: 'RouteBuddies (SyncRide)'
user_name: 'jay'
date: '2026-04-10'
workflowStatus: 'complete'
completedAt: '2026-04-10'
lastStep: 8
---

# Architecture Decision Document: SyncRide

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

SyncRide is a real-time geospatial coordination platform for motorcycle touring groups (5-20 riders) that enables passive spatial awareness through map-first visualization. Core functional capabilities include:

- **Ephemeral Session Management**: Trip hosts generate 6-digit codes creating device-bound sessions with optional display names (no permanent accounts, no signup friction)
- **Real-Time Location Broadcasting**: WebSocket-driven coordinate streaming with sub-500ms P95 latency target across all connected riders
- **Group Awareness Features**: Auto-zoom Group View, nearest rider distance calculation, group spread indicators, color-coded proximity rings
- **Voice-First Communication**: Tap-to-speak status updates with STT (English + Hindi), predefined intents ("Need gas", "Taking break"), audio confirmation feedback
- **Emergency Coordination**: One-tap SOS from lock screen broadcasting exact coordinates with automatic call initiation to nearest rider
- **Dead Zone Resilience**: Client-side buffering during connectivity loss, trail replay on reconnect, last-known position visualization with expanding uncertainty radius
- **Privacy-Forward Data Lifecycle**: Auto-deletion of live coordinates on trip end, opt-in 7-day replay with explicit consent, data deletion confirmation UI

**Architecturally Significant Functional Requirements:**
- Adaptive GPS polling with motion-state detection (stationary = GPS off, highway = 10-15s, city = 2-3s)
- Redis TTL-based presence detection (30s expiration, automatic ghost cleanup)
- Differential broadcasting for 80% bandwidth reduction (delta payloads vs full coordinates)
- Geographic partitioning for distance-based update frequency optimization
- CRDT-style conflict resolution for offline buffering and eventual consistency
- Platform capability testing (iOS/Android background GPS, lock-screen access, push notifications)

**Non-Functional Requirements:**

**Performance:**
- P95 location broadcast latency <500ms (measured per network class: 4G/LTE/5G)
- <20% battery drain per 2-hour active trip on reference devices (iPhone 14, Samsung Galaxy S23)
- Map load with all rider positions <2 seconds (core value proposition dependency)
- Smooth 60fps map rendering with 20+ simultaneous animated markers
- Redis geospatial queries (GEORADIUS) <10ms for groups up to 50 riders

**Reliability:**
- >99.5% WebSocket message delivery (measured via client acknowledgments)
- >95% of disconnects recover within 10 seconds of network restoration
- >80% trip completion rate (all original participants stay connected)
- Median reconnection time <5 seconds after tunnel/dead zone exit

**Scalability:**
- Single Socket.io server handles 100 concurrent trips (2,000 riders @ 20 per trip)
- MongoDB time-series writes sustain 10,000 location points/second with compression
- Horizontal scaling strategy for Socket.io with Redis pub/sub adapter

**Security & Privacy:**
- JWT-based authentication for trip sessions
- Device-bound ephemeral sessions (no password storage)
- Trip code validation with host controls (kick, ban, expire/rotate code)
- Location data auto-deletion on trip end (India DPDP Act, GDPR compliance)
- ToS with SOS liability disclaimers and distraction warnings

**Accessibility:**
- WCAG 2.1 Level AA compliance (19.6:1 minimum contrast, screen reader support)
- Glove-friendly UX: 80mm minimum touch targets (6mm for critical actions), works with 12mm neoprene gloves
- >90% success rate completing core flows wearing motorcycle gloves
- Voice-first as primary input (not accessibility add-on)
- Triple feedback system: Visual + Haptic + Audio confirmation

**Platform Constraints:**
- PWA-first with iOS/Android background GPS testing Week 1
- Native shell fallback (Capacitor.js) if PWA fundamentally blocked
- Lock-screen SOS access validation on both platforms before public launch

### Scale & Complexity

**Project Scale Assessment:**

- **Primary Domain:** Real-time Geospatial / Transportation-Mobility
- **Complexity Level:** **HIGH** 
  - Distributed real-time systems with WebSocket concurrency at scale
  - Battery optimization as system-wide constraint (adaptive polling, differential broadcasting)
  - Offline-first architecture with eventual consistency (CRDT-style merge)
  - Geospatial indexing and proximity calculations
  - Dead zone resilience requiring sophisticated client-side buffering
  - Multi-platform constraints (iOS PWA limitations, Android background GPS)
  
- **Estimated Architectural Components:** 15-20 major components
  - Frontend: 10 custom UI components (RiderMarker, VoiceInputFAB, SOSButton, BottomStatusBar, TripCodeDisplay, ConnectionStatusBanner, CountdownTimer, SOSAlertDialog, MemberListItem, MotionStateProvider)
  - Backend: Trip session manager, WebSocket event handlers, location broadcast engine, presence detection system, Redis cache layer
  - Infrastructure: Adaptive GPS polling service, reconnection manager, buffering system, geospatial query engine

- **User Interaction Complexity:** HIGH
  - Motion-adaptive UI (Detail Mode vs Glance Mode based on GPS velocity and accelerometer)
  - Context-aware interactions (stationary vs moving, day vs night, online vs offline)
  - Voice-first input with helmet/wind noise optimization
  - Haptic feedback vocabulary (2 short = approaching rider, 3 long = falling behind, continuous = SOS)
  - Triple feedback system for critical actions

- **Data Complexity:** MEDIUM-HIGH
  - High-frequency location streams (2-15 second intervals, 10,000 points/second at scale)
  - Time-series data with geospatial indexing
  - Ephemeral data lifecycle with explicit opt-in persistence
  - Multi-device state synchronization with eventual consistency

### Technical Constraints & Dependencies

**Platform Dependencies:**
- **iOS PWA limitations:** Background GPS may be blocked → Week 1 testing determines native shell necessity
- **Lock-screen access:** SOS button accessibility uncertain in PWA → native fallback triggers if blocked
- **Speech-to-text API:** English + Hindi support for voice status updates (>85% accuracy target in helmet/wind noise)
- **Mapbox GL JS:** Map rendering, tile management, marker clustering, viewport calculations
- **Push notifications:** Real-time alerts when app backgrounded (SOS broadcasts, reconnection events)

**Infrastructure Requirements:**
- **WebSocket infrastructure:** Socket.io with Redis pub/sub adapter for horizontal scaling
- **Redis with geospatial capabilities:** GEORADIUS queries for proximity calculations, TTL-based presence detection
- **MongoDB time-series:** Location history storage with compression, 7-day TTL for opt-in replay
- **IndexedDB:** Client-side buffering for offline breadcrumb trail (replays on reconnect)

**External Integrations:**
- **System share sheets:** Trip code distribution via WhatsApp, SMS, clipboard
- **Bluetooth helmet audio:** Future enhancement for audio narration (not MVP)
- **Route planner deep links:** Komoot, RideWithGPS, REVER integration as "plan elsewhere, coordinate here" companions

**Regulatory Constraints:**
- **India DPDP Act compliance:** Consent flows, data subject rights, retention documentation for Phase 1 launch
- **GDPR readiness:** For future EU expansion (not MVP)
- **ToS limitations:** Explicit SOS reliability disclaimers, distraction warnings, no liability for navigation failures

**Development Constraints:**
- **Single codebase requirement:** React PWA with potential native shell wrapper (avoid separate iOS/Android codebases)
- **Zero-install friction:** Share trip code → tap link → instant join (no App Store download, no signup)
- **Session-based architecture:** No user accounts, no passwords, device-bound ephemeral identity only

### Cross-Cutting Concerns Identified

**1. Real-Time State Synchronization**
- All components must handle WebSocket events: location updates, rider join/leave, status changes, SOS broadcasts
- Eventual consistency model for offline buffering and conflict resolution
- Optimistic UI updates with rollback on acknowledgment failure
- State management strategy needed (Zustand recommended in PRD)

**2. Battery Optimization as System-Wide Constraint**
- Adaptive GPS polling affects frontend (motion detection), backend (update frequency expectations), infrastructure (Redis TTL tuning)
- Differential broadcasting reduces network usage (impacts WebSocket payload design, client state reconstruction)
- Map tile caching strategy to reduce network calls
- Background GPS permission management and battery level monitoring

**3. Offline-First Architecture**
- IndexedDB buffering during network loss affects frontend state, backend reconciliation, and UI feedback
- Trail replay on reconnect requires client-side breadcrumb storage and server-side merge logic
- Last-known position visualization with expanding uncertainty radius
- Service Worker strategy for offline map tile access (future enhancement)

**4. Security & Privacy**
- Ephemeral session architecture affects authentication (JWT with device ID), authorization (trip code validation), and data lifecycle (auto-deletion)
- No persistent user accounts means no password reset, no profile management, no social features
- Data deletion confirmation UI required for privacy transparency
- GPS spoofing detection and mitigation strategies

**5. Observability & Performance Monitoring**
- Latency tracing across GPS → Client → WebSocket → Server → Redis → Broadcast pipeline (OpenTelemetry spans recommended)
- Battery drain telemetry per device model and riding context (highway vs city vs mixed)
- Reconnection success monitoring (disconnect events, recovery time, data loss percentage)
- WebSocket message delivery acknowledgments for >99.5% reliability target

**6. Accessibility & Inclusive Design**
- WCAG 2.1 Level AA compliance affects color choices, contrast ratios, semantic HTML, ARIA labels
- Glove-friendly design affects touch target sizing (80mm minimum), button placement, swipe gesture avoidance
- Voice-first input affects STT implementation, audio feedback design, Bluetooth helmet integration
- Screen reader support affects map marker announcements, status change notifications, error handling

**7. Error Handling & Graceful Degradation**
- Network failures: Client-side buffering, retry with exponential backoff, user feedback on reconnection status
- Dead zones: Last-known position visualization, trail replay, uncertainty radius expansion
- Concurrent updates: CRDT-style conflict resolution, vector clock ordering, last-write-wins with timestamps
- GPS unavailable: Fallback to network-based location, clear error messaging, graceful feature disablement

**8. Performance as User Experience**
- Sub-500ms latency creates "real-time feel" (impacts WebSocket optimization, Redis caching, differential broadcasting)
- <2 second map load affects initial render strategy, tile loading priority, marker clustering
- 60fps map rendering affects animation frame optimization, marker update batching, viewport calculations
- Battery efficiency becomes UX feature ("ride all day without recharging")

**9. Platform-Specific Adaptations**
- iOS PWA background GPS limitations may force native shell
- Android background location permissions require different UX flow
- Lock-screen SOS access differs between platforms (native notification actions vs PWA constraints)
- Haptic feedback API differences (iOS Taptic Engine vs Android Vibration API)

**10. Scalability & Cost Management**
- Socket.io horizontal scaling with Redis pub/sub adapter for multi-server deployments
- Geographic partitioning reduces unnecessary updates (riders 50km apart don't need sub-second broadcasts)
- Redis memory optimization (TTL-based cleanup, compressed payloads)
- Mapbox tile request optimization (caching strategy, viewport-based loading)

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-Stack Web Application (Progressive Web App)** based on project requirements analysis. Real-time geospatial coordination platform with WebSocket infrastructure, requiring both robust frontend (React PWA) and scalable backend (Node.js + Socket.io).

### Technical Preferences Summary

Based on project context and PRD analysis:

- **Frontend:** React.js + TypeScript, Tailwind CSS, Mapbox GL JS
- **State Management:** Zustand (real-time state), TanStack Query (server state)
- **Backend:** Node.js, Express.js, Socket.io (WebSocket infrastructure)
- **Databases:** MongoDB (trip/user data), Redis (active location cache + TTL presence)
- **Platform:** PWA-first (service workers, offline capabilities) with native shell fallback (Capacitor.js) if iOS restricts background GPS
- **Security:** JWT (trip sessions), Bcrypt.js (if user auth added)

### Architectural Strategy

**Monorepo with Workspaces** is recommended for this project given:
- Separate frontend (React PWA) and backend (Node.js API + Socket.io server)
- Shared TypeScript types (location coordinates, trip session state, WebSocket events)
- Unified development workflow and deployment orchestration
- Consistent linting, testing, and build tooling across packages

**Recommended Tooling:** pnpm workspaces + Turborepo for task orchestration and caching

### Starter Options Considered

#### Frontend Options

**Option 1: Vite + React + TypeScript (Official)**
- **Command:** `npm create vite@latest -- --template react-swc-ts`
- **Pros:** Official Vite starter, fast HMR with SWC compiler, TypeScript configured, minimal dependencies
- **Cons:** No Tailwind CSS preconfigured, no PWA setup, requires manual additions
- **Status:** Current as of 2026, requires Node.js 20.19+ or 22.12+

**Option 2: Community Vite + React + TypeScript + Tailwind**
- **Repo:** RoyRao2333/template-vite-react-ts-tailwind (85 stars, last updated Feb 2026)
- **Pros:** Tailwind CSS preconfigured, Prettier + ESLint included, Vite 7.0+
- **Cons:** Community-maintained (not official), still requires PWA setup
- **Status:** Well-maintained, active updates

#### Backend Options

**Option 3: Custom Node.js + Express + Socket.io Setup**
- **Approach:** Manual scaffolding (no perfect starter found)
- **Rationale:** Specific requirements (Redis TTL presence, adaptive polling coordination, geospatial queries) not covered by generic boilerplates
- **Reference Patterns:** 
  - DVNghiem/Socket.io-Boilerplate (TypeScript, Redis adapter, 500k concurrent clients capability)
  - SriramDivi1/real-time-chat-app (Socket.io + MongoDB + Redis + JWT patterns)
- **Status:** Custom implementation following 2026 production patterns

### Selected Approach: Monorepo with Custom Starters

**Rationale:** Given the unique architecture (adaptive GPS, TTL presence, differential broadcasting), a monorepo with customized starters provides the best balance of modern tooling and architectural flexibility.

**Project Structure:**

```
syncride-monorepo/
├── apps/
│   ├── web/                    # React PWA (Vite + TypeScript + Tailwind)
│   └── api/                    # Node.js backend (Express + Socket.io + Redis + MongoDB)
├── packages/
│   ├── shared-types/           # TypeScript definitions (location, trip session, events)
│   ├── config/                 # Shared tsconfig, ESLint, Prettier configs
│   └── utils/                  # Shared utilities (coordinate math, validation)
├── turbo.json                  # Turborepo task orchestration
├── pnpm-workspace.yaml         # Workspace definition
└── package.json                # Root package with scripts
```

### Initialization Commands

**Step 1: Create Monorepo with Turborepo + pnpm**

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Create monorepo structure with Turborepo
npx create-turbo@latest syncride-monorepo --package-manager pnpm

# Navigate into project
cd syncride-monorepo
```

**Step 2: Initialize Frontend (React PWA)**

```bash
# Create Vite React TypeScript app in apps/web
cd apps
pnpm create vite web --template react-swc-ts

# Navigate to web and install dependencies
cd web
pnpm install

# Add Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Add PWA plugin
pnpm add -D vite-plugin-pwa workbox-window

# Add core dependencies
pnpm add zustand @tanstack/react-query mapbox-gl
pnpm add -D @types/mapbox-gl

# Return to root
cd ../..
```

**Step 3: Initialize Backend (Node.js + Express + Socket.io)**

```bash
# Create backend structure
mkdir -p apps/api/src
cd apps/api

# Initialize package.json
pnpm init

# Add backend dependencies
pnpm add express socket.io mongoose ioredis jsonwebtoken bcryptjs dotenv cors
pnpm add -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken ts-node-dev nodemon

# Initialize TypeScript
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --lib es6 --module commonjs --allowJs true --noImplicitAny true

# Return to root
cd ../..
```

**Step 4: Setup Shared Packages**

```bash
# Create shared types package
mkdir -p packages/shared-types/src
cd packages/shared-types
pnpm init
pnpm add -D typescript

# Create shared utils package  
cd ..
mkdir -p utils/src
cd utils
pnpm init
pnpm add -D typescript

# Return to root
cd ../..
```

**Step 5: Configure Workspaces**

Create `pnpm-workspace.yaml` at root:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Architectural Decisions Provided by Selected Approach

#### Language & Runtime

**TypeScript throughout monorepo:**
- **Frontend:** TypeScript 5.x with React JSX support, strict mode enabled
- **Backend:** TypeScript 5.x with Node.js 20+ target, ES modules
- **Shared:** Strict type checking, common tsconfig base in `packages/config`

**Node.js Requirements:** 20.19+ or 22.12+ (Vite 7+ requirement)

#### Styling Solution

**Tailwind CSS 3.x+ for frontend:**
- Utility-first CSS framework
- Custom configuration for glove-friendly design system (80mm touch targets)
- JIT compiler for fast builds
- PostCSS integration for autoprefixing

**Tailwind Config Strategy:**
```javascript
// apps/web/tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom glove-friendly tokens from UX spec
      spacing: {
        'touch-min': '80px',  // Minimum glove-friendly touch target
        'touch-critical': '6mm', // Critical action minimum
      },
      fontSize: {
        'glance': '2rem',  // Glance mode (riding >20 km/h)
        'detail': '1rem',  // Detail mode (stationary)
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
```

#### Build Tooling

**Frontend (Vite 7+):**
- **Fast HMR:** Sub-50ms hot module replacement with SWC compiler
- **Optimized Production Builds:** Rollup-based bundling with tree-shaking
- **PWA Plugin:** vite-plugin-pwa with Workbox for service worker generation
- **Asset Optimization:** Image compression, lazy loading, code splitting

**Backend (TypeScript Compiler + ts-node-dev):**
- **Development:** ts-node-dev for hot reloading on file changes
- **Production:** Compiled to `dist/` with tsc, run with `node dist/index.js`
- **Source Maps:** Enabled for debugging production issues

**Monorepo Orchestration (Turborepo):**
- **Task Caching:** Remote and local caching for 80%+ faster CI runs
- **Task Pipeline:** `dev`, `build`, `test`, `lint` orchestrated across packages
- **Dependency Awareness:** Builds shared packages before apps automatically

#### PWA Configuration

**vite-plugin-pwa setup in `apps/web/vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'SyncRide - Group Ride Coordination',
        short_name: 'SyncRide',
        description: 'Real-time location tracking for motorcycle groups',
        theme_color: '#3B82F6',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 3 }
          },
          // Mapbox tiles caching strategy
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapbox-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 }
            }
          }
        ]
      }
    })
  ]
})
```

**Platform Capability Testing (Week 1 - Phase 1):**
- iOS Safari: Test background GPS permission persistence
- Android Chrome: Test lock-screen notification actions for SOS button
- Test service worker activation and push notifications

**If PWA Blocked:**
- **Fallback:** Add Capacitor.js native shell wrapper
- **Command:** `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
- **Strategy:** Minimal native code, maximum web code reuse
- **Timeline:** Week 2-3 implementation if needed

#### Testing Framework

**Frontend (Vitest + Testing Library):**
```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Backend (Jest + Supertest):**
```bash
# Install testing dependencies  
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**E2E Testing (Playwright - Optional):**
```bash
# Install E2E testing
pnpm add -D @playwright/test
```

#### Code Organization

**Frontend Structure (`apps/web/src/`):**
```
src/
├── components/          # React components
│   ├── map/            # RiderMarker, MapView, GroupView
│   ├── trip/           # TripCodeDisplay, MemberListItem
│   ├── ui/             # BottomStatusBar, FABs, Buttons (Shadcn/UI style)
│   └── feedback/       # ConnectionStatusBanner, Toast, SOSAlert
├── features/           # Feature-based modules
│   ├── trip-session/   # Trip join/create logic, state management
│   ├── location/       # Adaptive GPS polling, buffering, broadcasting
│   └── voice-status/   # Voice input, STT integration
├── hooks/              # Custom React hooks
│   ├── useAdaptiveGPS.ts
│   ├── useWebSocket.ts
│   └── useMotionDetection.ts
├── stores/             # Zustand stores
│   ├── tripStore.ts    # Active trip state (riders, positions)
│   ├── locationStore.ts # Local GPS data, buffering
│   └── uiStore.ts      # UI state (glance mode, theme)
├── services/           # External service integrations
│   ├── websocket.ts    # Socket.io client setup
│   ├── geolocation.ts  # Browser Geolocation API wrapper
│   └── mapbox.ts       # Mapbox GL JS initialization
├── utils/              # Utility functions
│   ├── coordinates.ts  # Distance calculations, bounding box
│   ├── polling.ts      # Adaptive polling algorithm
│   └── validation.ts   # Trip code validation, input sanitization
├── types/              # TypeScript type definitions (imports from @syncride/shared-types)
├── App.tsx             # Root component with routing
├── main.tsx            # Entry point
└── vite-env.d.ts       # Vite type declarations
```

**Backend Structure (`apps/api/src/`):**
```
src/
├── controllers/        # Request handlers
│   ├── tripController.ts
│   └── authController.ts (if needed)
├── services/           # Business logic
│   ├── tripService.ts
│   ├── locationService.ts
│   └── presenceService.ts (Redis TTL presence detection)
├── models/             # Mongoose schemas
│   ├── Trip.ts
│   ├── Rider.ts
│   └── LocationHistory.ts (time-series)
├── sockets/            # Socket.io event handlers
│   ├── tripEvents.ts   # JOIN_TRIP, LEAVE_TRIP
│   ├── locationEvents.ts # LOCATION_UPDATE, BROADCAST
│   └── sosEvents.ts    # SOS_BROADCAST, SOS_ACK
├── middleware/         # Express middleware
│   ├── auth.ts         # JWT validation
│   ├── errorHandler.ts
│   └── rateLimiter.ts
├── config/             # Configuration
│   ├── database.ts     # MongoDB connection
│   ├── redis.ts        # Redis client setup
│   └── socket.ts       # Socket.io server initialization
├── utils/              # Utility functions
│   ├── geospatial.ts   # GEORADIUS queries, distance calculations
│   ├── ttl.ts          # Redis TTL presence helper
│   └── jwt.ts          # JWT token generation/validation
├── types/              # TypeScript type definitions (imports from @syncride/shared-types)
├── app.ts              # Express app setup
└── server.ts           # HTTP server + Socket.io initialization
```

**Shared Types Structure (`packages/shared-types/src/`):**
```
src/
├── trip.ts             # Trip, TripCode, TripStatus types
├── rider.ts            # Rider, RiderStatus, RiderPosition types
├── location.ts         # Coordinates, LocationUpdate, GPSState types
├── websocket.ts        # WebSocket event types (JOIN_TRIP, LOCATION_UPDATE, etc.)
├── sos.ts              # SOS event types
└── index.ts            # Barrel exports
```

#### Development Experience

**Hot Reloading:**
- **Frontend:** Vite HMR with React Fast Refresh (<50ms updates)
- **Backend:** ts-node-dev restarts on file changes (~2-3s restart time)
- **Monorepo:** Turborepo watches all packages, rebuilds only changed dependencies

**Unified Scripts (Root `package.json`):**
```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

**TypeScript Configuration:**
- Shared base `tsconfig.json` in `packages/config`
- Per-package extensions for specific needs (React JSX, Node.js target)
- Strict mode enabled across monorepo for type safety

**Debugging Setup:**
- VS Code launch configurations for frontend (Chrome) and backend (Node.js)
- Source maps enabled for both development and production
- React DevTools and Redux DevTools (if needed) browser extensions

**Environment Variables:**
- `.env.development` and `.env.production` per app
- Shared secrets via `.env` at root (never committed)
- Type-safe env validation using Zod or similar

### iOS PWA Background GPS Contingency Plan

**Week 1 Testing Protocol:**
1. Deploy test build to iOS Safari (iOS 15+)
2. Test background location permission behavior
3. Test lock-screen notification actions (SOS button)
4. Test service worker activation and push notifications

**If PWA Blocked:**
- **Fallback:** Add Capacitor.js native shell wrapper
- **Command:** `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
- **Strategy:** Minimal native code, maximum web code reuse
- **Timeline:** Week 2-3 implementation if needed

### Note on Implementation

**Project initialization using these commands should be the first implementation story.** This establishes the architectural foundation and ensures all subsequent development follows the defined patterns and structure.

**Estimated Setup Time:** 2-4 hours for complete monorepo initialization and configuration.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. ✅ MongoDB schema design approach
2. ✅ WebSocket + REST API architecture
3. ✅ JWT session management strategy
4. ✅ State management approach (Zustand + TanStack Query)
5. ✅ Hosting and deployment infrastructure
6. ✅ Environment configuration and validation

**Important Decisions (Shape Architecture):**
1. ✅ Mapbox GL JS configuration and styling
2. ✅ Monitoring and observability stack
3. ✅ Trip code generation and security
4. ✅ Error tracking and logging

**Deferred Decisions (Post-MVP):**
1. ⏸️ Horizontal scaling strategy (defer until 1,000+ concurrent trips)
2. ⏸️ Advanced caching layers (defer until performance bottlenecks identified)
3. ⏸️ Multi-region deployment (defer until international expansion)
4. ⏸️ Custom analytics dashboard (defer until data volume justifies)

### Data Architecture

#### MongoDB Schema Design

**Decision:** Hybrid approach with separate collections and time-series optimization

**Schema Structure:**

```typescript
// Trip Collection
interface Trip {
  _id: ObjectId
  tripCode: string          // 6-digit alphanumeric (indexed, unique)
  hostDeviceId: string      // Device ID of trip creator
  createdAt: Date           // Trip start timestamp
  expiresAt: Date           // Auto-deletion timestamp (24h default)
  status: 'active' | 'ended'
  riderIds: string[]        // References to Rider documents
  settings: {
    autoZoom: boolean       // Group View auto-zoom enabled
    privacyMode: boolean    // Hide exact coordinates in UI
  }
}

// Rider Collection (Current State)
interface Rider {
  _id: ObjectId
  tripId: ObjectId          // Reference to Trip
  deviceId: string          // Unique device identifier
  displayName: string       // Optional user-provided name
  joinedAt: Date
  lastSeen: Date            // Updated on each location ping
  status: 'connected' | 'stale' | 'disconnected'
  currentLocation: {
    lat: number
    lon: number
    speed: number           // km/h
    heading: number         // degrees (0-360)
    accuracy: number        // meters
    timestamp: Date
  }
  voiceStatus?: {
    status: 'need_gas' | 'break' | 'mechanical' | 'medical'
    timestamp: Date
  }
  isHost: boolean
}

// LocationHistory Collection (Time-Series)
// MongoDB 5.0+ time-series collection with 80% compression
interface LocationHistory {
  riderId: ObjectId         // Reference to Rider (timeField metadata)
  timestamp: Date           // timeField for time-series
  location: {
    lat: number
    lon: number
  }
  metadata: {
    speed: number
    heading: number
    accuracy: number
    batteryLevel?: number   // Optional telemetry
  }
}
```

**Time-Series Configuration:**
```javascript
db.createCollection('locationHistories', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'riderId',
    granularity: 'seconds'
  },
  expireAfterSeconds: 604800  // 7 days (opt-in replay window)
})
```

**Rationale:**
- **Trip:** Lightweight metadata, fast queries for active trips
- **Rider:** Current state cached for real-time queries (<10ms read latency)
- **LocationHistory:** Compressed time-series for replay feature (80% storage savings)
- **Indexes:** 
  - `Trip.tripCode` (unique, for join operations)
  - `Rider.tripId + lastSeen` (for presence detection)
  - `LocationHistory.riderId + timestamp` (for replay queries)

**TTL (Time-To-Live) Indexes:**
```javascript
// Auto-delete expired trips
db.trips.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Auto-delete location history after 7 days (if opt-in replay not selected)
db.locationHistories.createIndex({ timestamp: 1 }, { expireAfterSeconds: 604800 })
```

**Affects:** All data layer services, WebSocket event handlers, trip management endpoints

#### Redis Caching Strategy

**Decision:** Redis for active trip state with TTL-based presence detection

**Cache Structure:**

```typescript
// Active trip cache (30-second TTL per rider)
Key: `trip:{tripCode}:rider:{deviceId}`
Value: JSON {
  lat: number,
  lon: number,
  speed: number,
  heading: number,
  timestamp: ISO string,
  status: 'connected' | 'stale'
}
TTL: 30 seconds (reset on each location update)

// Trip metadata cache
Key: `trip:{tripCode}:meta`
Value: JSON {
  hostDeviceId: string,
  riderCount: number,
  createdAt: ISO string
}
TTL: 86400 seconds (24 hours)

// Geospatial index for proximity calculations
Key: `trip:{tripCode}:geo`
Type: GEOHASH
Commands: GEOADD, GEORADIUS, GEODIST
TTL: None (cleaned up on trip end)
```

**Presence Detection Logic:**
- Location update resets 30s TTL → "connected"
- TTL expires but key exists in last 60s → "stale" (yellow indicator)
- TTL expired >60s ago → "disconnected" (red indicator, removed from active list)

**Rationale:**
- Eliminates separate heartbeat protocol (location updates ARE heartbeats)
- Sub-10ms read latency for real-time broadcasts
- Automatic ghost cleanup (no manual disconnect handling)
- GEORADIUS queries for "nearest rider" calculations

**Affects:** Location broadcast service, presence detection, WebSocket event handlers

#### Data Validation Strategy

**Decision:** Zod schemas for runtime validation at API boundaries

**Validation Layers:**

```typescript
// Shared validation schemas in packages/shared-types
import { z } from 'zod'

// Location update validation
const locationUpdateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  speed: z.number().min(0).max(300),  // km/h, max 300
  heading: z.number().min(0).max(360),
  accuracy: z.number().min(0),
  timestamp: z.string().datetime()
})

// Trip code validation
const tripCodeSchema = z.string()
  .length(6)
  .regex(/^[A-Z0-9]{6}$/, 'Trip code must be 6 uppercase alphanumeric characters')

// Display name validation
const displayNameSchema = z.string()
  .min(1)
  .max(20)
  .regex(/^[a-zA-Z0-9\s]+$/, 'Name can only contain letters, numbers, and spaces')
```

**Validation Points:**
- WebSocket events (validate before processing)
- REST API endpoints (validate request bodies)
- Frontend forms (validate before submission)

**Error Handling:**
- Invalid data → Return 400 with Zod error details
- Schema mismatch → Log warning, use safe defaults
- Type coercion → Automatic for compatible types

**Affects:** All API endpoints, WebSocket handlers, frontend forms

### Authentication & Security

#### JWT Session Management

**Decision:** JWT tokens for ephemeral trip sessions with device-bound identity

**Token Structure:**

```typescript
interface JWTPayload {
  deviceId: string        // Unique device identifier (UUID v4)
  tripCode: string        // Trip the token is valid for
  role: 'host' | 'rider'  // Permission level
  displayName: string     // User-provided name
  iat: number            // Issued at (timestamp)
  exp: number            // Expires at (24h or trip end)
}
```

**Token Generation:**

```typescript
// Backend token creation
const token = jwt.sign(
  {
    deviceId: generateDeviceId(),
    tripCode,
    role: isHost ? 'host' : 'rider',
    displayName
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)
```

**Token Storage:**
- **Web (PWA):** localStorage (accessible across tabs)
- **Native (if needed):** Capacitor SecureStorage plugin
- **Key:** `syncride_session_{tripCode}`

**Token Validation:**
- Middleware validates JWT on protected routes
- WebSocket handshake validates token on connect
- Expired tokens → 401, redirect to trip join screen

**Security Considerations:**
- No password storage (device-bound only)
- Token rotation on trip end
- XSS protection via HTTP-only cookies (if native shell)
- CSRF not needed (device-bound identity, no session cookies)

**Affects:** Authentication middleware, WebSocket connection, trip join flow

#### Trip Code Security

**Decision:** 6-digit alphanumeric codes with collision detection and rate limiting

**Code Generation Algorithm:**

```typescript
function generateTripCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude ambiguous: 0, O, 1, I
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function createUniqueTripCode(): Promise<string> {
  let attempts = 0
  while (attempts < 10) {
    const code = generateTripCode()
    const exists = await Trip.findOne({ tripCode: code, status: 'active' })
    if (!exists) return code
    attempts++
  }
  throw new Error('Failed to generate unique trip code')
}
```

**Rate Limiting:**
- 5 trip creations per device per hour
- Implemented via Redis: `ratelimit:create_trip:{deviceId}`
- Counter expires after 1 hour

**Code Expiration:**
- Active trips expire after 24 hours (auto-delete via MongoDB TTL)
- Codes can be manually expired by host (immediate trip end)
- Expired codes can be reused after cleanup

**Validation:**
- Check format: 6 uppercase alphanumeric
- Check existence in active trips
- Check expiration timestamp

**Affects:** Trip creation endpoint, trip join validation, rate limiting middleware

#### API Security Strategy

**Decision:** CORS configuration, rate limiting, and input sanitization

**CORS Configuration:**

```typescript
// Backend CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://syncride.app', 'https://www.syncride.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

**Rate Limiting (per endpoint):**
- Trip creation: 5 per hour per device
- Trip join: 10 per hour per device
- Location updates: No limit (real-time requirement)
- SOS broadcast: 3 per minute per device (prevent spam)

**Input Sanitization:**
- Zod validation for all inputs
- DOMPurify for display names (XSS prevention)
- Parameterized queries for MongoDB (injection prevention)

**Affects:** All API endpoints, WebSocket event handlers, middleware stack

### API & Communication Patterns

#### WebSocket (Socket.io) Event Architecture

**Decision:** Socket.io for real-time location updates, REST for trip management

**WebSocket Events (Client → Server):**

```typescript
// Trip session events
socket.emit('join_trip', { 
  tripCode: string, 
  deviceId: string, 
  displayName: string,
  token: string 
})

socket.emit('leave_trip', { tripCode: string, deviceId: string })

// Location streaming
socket.emit('location_update', {
  tripCode: string,
  deviceId: string,
  lat: number,
  lon: number,
  speed: number,
  heading: number,
  accuracy: number,
  timestamp: string
})

// Status updates
socket.emit('voice_status', {
  tripCode: string,
  deviceId: string,
  status: 'need_gas' | 'break' | 'mechanical' | 'medical',
  timestamp: string
})

// Emergency broadcast
socket.emit('sos_broadcast', {
  tripCode: string,
  deviceId: string,
  lat: number,
  lon: number,
  timestamp: string
})
```

**WebSocket Events (Server → Client):**

```typescript
// Trip lifecycle
socket.on('trip_joined', { rider: RiderData })
socket.on('rider_left', { riderId: string })
socket.on('trip_ended', { reason: string })

// Location broadcasts (to all riders in trip room)
socket.on('location_broadcast', {
  riderId: string,
  lat: number,
  lon: number,
  speed: number,
  heading: number,
  timestamp: string
})

// Presence updates
socket.on('connection_status', {
  riderId: string,
  status: 'connected' | 'stale' | 'disconnected',
  lastSeen: string
})

// Emergency alerts
socket.on('sos_alert', {
  riderId: string,
  riderName: string,
  lat: number,
  lon: number,
  timestamp: string
})
```

**Socket.io Configuration:**

```typescript
// Backend Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],  // Websocket preferred
  pingTimeout: 60000,
  pingInterval: 25000
})

// Redis adapter for horizontal scaling
io.adapter(createAdapter(pubClient, subClient))

// Room-based trip sessions
io.on('connection', (socket) => {
  socket.on('join_trip', async ({ tripCode, token }) => {
    // Validate JWT token
    const payload = verifyToken(token)
    
    // Join trip-specific room
    socket.join(`trip:${tripCode}`)
    
    // Broadcast to room
    io.to(`trip:${tripCode}`).emit('rider_joined', { rider: payload })
  })
})
```

**Rationale:**
- WebSocket for high-frequency location updates (sub-500ms latency)
- Room-based broadcasting (only riders in same trip receive updates)
- Automatic reconnection with exponential backoff
- Redis adapter enables horizontal scaling across multiple servers

**Affects:** Real-time location service, WebSocket handlers, client connection logic

#### REST API Endpoints

**Decision:** RESTful API for trip management and data retrieval

**Endpoint Specification:**

```typescript
// Trip Management
POST   /api/trips
  Body: { displayName?: string }
  Response: { tripCode: string, token: string, expiresAt: string }
  Auth: None (creates new session)

GET    /api/trips/:code
  Response: { trip: Trip, riders: Rider[] }
  Auth: JWT (must be in trip)

DELETE /api/trips/:code
  Response: { message: 'Trip ended' }
  Auth: JWT (host only)

POST   /api/trips/:code/join
  Body: { displayName?: string }
  Response: { token: string, trip: Trip }
  Auth: None (validates code)

// Replay (Optional Feature)
GET    /api/trips/:code/replay
  Query: { startTime?: ISO, endTime?: ISO }
  Response: { locations: LocationHistory[] }
  Auth: JWT (must have opted in)

// Health Check
GET    /api/health
  Response: { status: 'ok', uptime: number }
  Auth: None
```

**Error Response Format:**

```typescript
{
  error: {
    code: 'TRIP_NOT_FOUND' | 'INVALID_CODE' | 'UNAUTHORIZED',
    message: 'Human-readable error message',
    details?: any  // Optional Zod validation errors
  }
}
```

**Affects:** Frontend API client, backend controllers, trip service layer

#### Error Handling Standards

**Decision:** Consistent error handling with structured logging

**Error Categories:**

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message)
  }
}

// Usage examples
throw new AppError(404, 'TRIP_NOT_FOUND', 'Trip code does not exist')
throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token')
throw new AppError(400, 'INVALID_INPUT', 'Invalid location data', zodError)
throw new AppError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests')
```

**Global Error Middleware:**

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn({ err, req: req.body }, err.message)
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    })
  }
  
  // Unexpected errors
  logger.error({ err, req: req.body }, 'Unhandled error')
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  })
})
```

**Affects:** All error handling, logging, frontend error display

### Frontend Architecture

#### State Management Strategy

**Decision:** Zustand for real-time trip state, TanStack Query for server state

**Zustand Store Structure:**

```typescript
// stores/tripStore.ts
interface TripState {
  tripCode: string | null
  riders: Map<string, RiderPosition>
  localPosition: Coordinates | null
  isHost: boolean
  connectionStatus: 'connected' | 'reconnecting' | 'offline'
  
  // Actions
  setTripCode: (code: string) => void
  updateRiderPosition: (riderId: string, position: RiderPosition) => void
  removeRider: (riderId: string) => void
  updateLocalPosition: (position: Coordinates) => void
  clearTrip: () => void
}

export const useTripStore = create<TripState>((set) => ({
  tripCode: null,
  riders: new Map(),
  localPosition: null,
  isHost: false,
  connectionStatus: 'offline',
  
  setTripCode: (code) => set({ tripCode: code }),
  updateRiderPosition: (riderId, position) => set((state) => {
    const newRiders = new Map(state.riders)
    newRiders.set(riderId, position)
    return { riders: newRiders }
  }),
  removeRider: (riderId) => set((state) => {
    const newRiders = new Map(state.riders)
    newRiders.delete(riderId)
    return { riders: newRiders }
  }),
  updateLocalPosition: (position) => set({ localPosition: position }),
  clearTrip: () => set({ 
    tripCode: null, 
    riders: new Map(), 
    localPosition: null,
    isHost: false
  })
}))

// stores/locationStore.ts
interface LocationState {
  isTracking: boolean
  buffer: LocationPoint[]
  motionState: 'stationary' | 'predictable' | 'dynamic'
  pollingInterval: number
  batteryLevel: number | null
  
  // Actions
  startTracking: () => void
  stopTracking: () => void
  bufferLocation: (point: LocationPoint) => void
  flushBuffer: () => LocationPoint[]
  setMotionState: (state: MotionState) => void
  updatePollingInterval: (interval: number) => void
}

// stores/uiStore.ts
interface UIState {
  glanceMode: boolean
  theme: 'light' | 'dark'
  showMemberList: boolean
  mapZoom: number
  
  // Actions
  toggleGlanceMode: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleMemberList: () => void
  setMapZoom: (zoom: number) => void
}
```

**TanStack Query Configuration:**

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3
    }
  }
})

// Usage for trip replay
const { data: replayData, isLoading } = useQuery({
  queryKey: ['trip-replay', tripCode],
  queryFn: () => fetchTripReplay(tripCode),
  enabled: !!tripCode && hasOptedIn
})
```

**Rationale:**
- Zustand: Lightweight, performant for high-frequency updates (location broadcasts)
- TanStack Query: Automatic caching, refetching, and error handling for server data
- Separation of concerns: Real-time state vs server-fetched data

**Affects:** All React components, hooks, data fetching logic

#### Component Architecture

**Decision:** Feature-based organization with atomic design principles

**Component Structure:**

```
src/components/
├── ui/                      # Shadcn/UI style primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Dialog.tsx
│   └── Toast.tsx
├── map/                     # Map-specific components
│   ├── MapView.tsx         # Mapbox GL JS wrapper
│   ├── RiderMarker.tsx     # Rider position marker with status ring
│   ├── GroupBounds.tsx     # Bounding box visualization
│   └── LocationAccuracy.tsx # Accuracy radius indicator
├── trip/                    # Trip management UI
│   ├── TripCodeDisplay.tsx
│   ├── TripCodeEntry.tsx
│   ├── MemberListItem.tsx
│   └── MemberList.tsx
├── feedback/                # User feedback components
│   ├── ConnectionStatusBanner.tsx
│   ├── Toast.tsx
│   ├── SOSAlertDialog.tsx
│   └── CountdownTimer.tsx
└── layout/                  # Layout components
    ├── BottomStatusBar.tsx
    ├── VoiceInputFAB.tsx
    └── SOSButton.tsx
```

**Component Conventions:**
- Props interface defined at top of file
- React.memo for expensive renders
- Custom hooks for logic extraction
- TypeScript strict mode

**Affects:** Frontend component development, code organization

#### Routing Strategy

**Decision:** React Router v6 with protected routes

**Route Structure:**

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join" element={<JoinTripPage />} />
        <Route path="/create" element={<CreateTripPage />} />
        <Route 
          path="/trip/:code" 
          element={
            <ProtectedRoute>
              <ActiveTripPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/replay/:code" element={<ReplayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('syncride_session')
  if (!token) return <Navigate to="/join" replace />
  return <>{children}</>
}
```

**Affects:** Navigation, route protection, deep linking

### Infrastructure & Deployment

#### Hosting Strategy

**Decision:** Vercel (frontend) + Railway (backend) + MongoDB Atlas + Upstash Redis

**Frontend (Vercel):**
- **Automatic PWA optimization**
- **Edge CDN** (global latency <100ms)
- **Preview deployments** for PRs
- **Environment variables** per branch
- **Free tier:** 100GB bandwidth/month

**Backend (Railway):**
- **WebSocket support** (Socket.io compatible)
- **Auto-scaling** (0-10 instances)
- **Metrics dashboard** (CPU, memory, requests)
- **One-click MongoDB/Redis** add-ons
- **Free tier:** $5 credit/month

**MongoDB Atlas:**
- **Free tier:** 512MB storage, shared cluster
- **Auto-scaling** to dedicated clusters
- **Time-series collections** (80% compression)
- **Automated backups**

**Upstash Redis:**
- **Serverless** (pay per request)
- **Global replication** (multi-region)
- **REST API** (fallback if Redis protocol blocked)
- **Free tier:** 10,000 commands/day

**Deployment Flow:**
```
git push origin main
  → GitHub Actions CI (lint, test, build)
  → Vercel deploy (frontend)
  → Railway deploy (backend)
  → Run migrations (MongoDB)
  → Smoke tests
  → Rollback on failure
```

**Affects:** Deployment process, CI/CD configuration, infrastructure costs

#### Environment Configuration

**Decision:** Environment-based config with Zod validation and type safety

**Environment Variables:**

```typescript
// packages/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().default('3000'),
  
  // Database
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  
  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('24h'),
  
  // External Services
  MAPBOX_TOKEN: z.string(),
  SENTRY_DSN: z.string().optional(),
  
  // WebSocket
  SOCKET_IO_PATH: z.string().default('/socket.io'),
  ALLOWED_ORIGINS: z.string(),  // Comma-separated
  
  // Feature Flags
  ENABLE_REPLAY: z.string().default('true'),
  ENABLE_VOICE_STATUS: z.string().default('true')
})

export const env = envSchema.parse(process.env)
```

**Configuration Files:**
- `.env.development` (local development, not committed)
- `.env.production` (Railway secrets, set via dashboard)
- `.env.example` (template, committed to repo)

**Affects:** All environment-dependent configuration, deployment setup

#### Monitoring & Observability

**Decision:** Pino logging + Sentry errors + Custom metrics

**Logging (Pino):**

```typescript
// Backend logging setup
import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined
})

// Usage
logger.info({ tripCode, riderId }, 'Rider joined trip')
logger.error({ err, tripCode }, 'Failed to broadcast location')
logger.debug({ latency: 234 }, 'WebSocket message latency')
```

**Error Tracking (Sentry):**

```typescript
// Frontend Sentry setup
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,  // 10% performance monitoring
  beforeSend(event) {
    // Strip sensitive data
    if (event.request) {
      delete event.request.cookies
    }
    return event
  }
})

// Backend Sentry setup
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ]
})
```

**Custom Metrics:**

```typescript
// Key metrics to track
interface Metrics {
  // Performance
  websocketLatencyP95: number    // Target: <500ms
  locationBroadcastRate: number  // Broadcasts per second per trip
  redisCacheHitRate: number      // Target: >90%
  
  // Business
  activeTrips: number
  totalRiders: number
  avgRidersPerTrip: number
  
  // Errors
  websocketDisconnects: number
  gpsFailed: number
  tripCreationFailed: number
}
```

**Dashboards:**
- **Railway:** CPU, memory, request rate
- **Sentry:** Error rate, performance traces
- **Custom:** Grafana or Railway metrics (defer to post-MVP)

**Affects:** Debugging, performance monitoring, alerting

### Decision Impact Analysis

#### Implementation Sequence

**Phase 1: Foundation (Week 1-2)**
1. Initialize monorepo (Turborepo + pnpm workspaces)
2. Setup MongoDB + Redis connections
3. Implement JWT session management
4. Create shared TypeScript types

**Phase 2: Core Backend (Week 3-4)**
1. Implement MongoDB schemas with time-series
2. Setup Socket.io with Redis adapter
3. Build WebSocket event handlers (join, location_update, leave)
4. Implement Redis TTL presence detection

**Phase 3: Core Frontend (Week 5-6)**
1. Setup Vite + React + Tailwind + PWA plugin
2. Integrate Mapbox GL JS
3. Build Zustand stores (trip, location, UI)
4. Implement WebSocket client connection

**Phase 4: Real-Time Features (Week 7-8)**
1. Location broadcasting with differential updates
2. Adaptive GPS polling implementation
3. Client-side buffering for offline resilience
4. Group View auto-zoom and proximity calculations

**Phase 5: Polish & Deploy (Week 9-10)**
1. Voice status updates (STT integration)
2. SOS emergency broadcast
3. Data deletion countdown and opt-in replay
4. Deploy to Vercel + Railway
5. iOS/Android PWA testing (background GPS validation)

#### Cross-Component Dependencies

**Critical Path:**
```
Monorepo Setup
  → Shared Types
    → MongoDB Schemas
      → REST API (trip CRUD)
        → JWT Authentication
          → WebSocket Connection
            → Location Broadcasting
              → Frontend Map View
```

**Parallel Tracks:**
- **Track A:** Frontend UI components (can develop against mock data)
- **Track B:** Adaptive GPS polling (can test independently)
- **Track C:** PWA configuration (can configure early)

**Dependency Map:**
- **Socket.io** depends on: Redis adapter, JWT validation
- **Location broadcasting** depends on: Redis cache, presence detection
- **Frontend map** depends on: Mapbox token, Zustand stores, WebSocket client
- **Adaptive polling** depends on: Motion detection, battery telemetry

**Blocker Resolution:**
- iOS PWA background GPS failure → Pivot to Capacitor.js (Week 2)
- Redis connection issues → Use in-memory Map for development
- Mapbox rate limits → Implement tile caching early

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 15 areas where AI agents could make different implementation choices that would cause integration failures.

**Pattern Categories:**
1. WebSocket event naming
2. MongoDB collection and field naming
3. API endpoint structure
4. TypeScript interface naming
5. File and directory naming
6. Error response formats
7. Date/time handling across system
8. State update patterns in Zustand
9. Redis key naming conventions
10. Location coordinate precision
11. Trip code format validation
12. Component prop patterns
13. Environment variable naming
14. Logging structure and levels
15. Test file organization

### Naming Patterns

#### Database Naming Conventions

**MongoDB Collections:** lowercase, plural, no underscores
```typescript
✅ CORRECT:
  - trips
  - riders
  - locationhistories

❌ INCORRECT:
  - Trips (capitalized)
  - trip (singular)
  - location_histories (underscores)
```

**MongoDB Fields:** camelCase (matches TypeScript conventions)
```typescript
✅ CORRECT:
  - tripCode
  - deviceId
  - displayName
  - lastSeen
  - createdAt

❌ INCORRECT:
  - trip_code (snake_case)
  - TripCode (PascalCase)
  - trip-code (kebab-case)
```

**MongoDB Indexes:**
```typescript
✅ CORRECT:
  - idx_tripCode (idx_ prefix for indexes)
  - idx_riderId_timestamp (compound index)

❌ INCORRECT:
  - tripCode_index
  - tripCodeIdx
```

#### API Naming Conventions

**REST Endpoints:** lowercase, plural resources, kebab-case for multi-word
```typescript
✅ CORRECT:
  POST   /api/trips
  GET    /api/trips/:code
  POST   /api/trips/:code/join
  GET    /api/trips/:code/replay
  DELETE /api/trips/:code

❌ INCORRECT:
  POST   /api/trip (singular)
  POST   /api/trips/join/:code (code not in path)
  POST   /api/createTrip (verb in URL)
```

**Route Parameters:** colon prefix, camelCase
```typescript
✅ CORRECT:
  /api/trips/:code
  /api/riders/:deviceId

❌ INCORRECT:
  /api/trips/{code} (curly braces)
  /api/trips/:trip-code (kebab-case)
```

**Query Parameters:** camelCase
```typescript
✅ CORRECT:
  ?startTime=2026-04-10T10:00:00Z
  ?endTime=2026-04-10T12:00:00Z

❌ INCORRECT:
  ?start_time (snake_case)
  ?StartTime (PascalCase)
```

#### WebSocket Event Naming

**Event Names:** snake_case, verb_noun pattern
```typescript
✅ CORRECT:
  'join_trip'
  'leave_trip'
  'location_update'
  'sos_broadcast'
  'voice_status'
  'rider_joined'
  'rider_left'
  'location_broadcast'
  'sos_alert'
  'connection_status'

❌ INCORRECT:
  'joinTrip' (camelCase)
  'JOIN_TRIP' (all caps)
  'trip_join' (noun_verb)
  'JoinTrip' (PascalCase)
```

**Rationale:** snake_case for events distinguishes them from function names (camelCase) and makes WebSocket logs easily grep-able.

#### Code Naming Conventions

**TypeScript Interfaces:** PascalCase
```typescript
✅ CORRECT:
  interface Trip { }
  interface Rider { }
  interface LocationUpdate { }
  interface TripCode { }

❌ INCORRECT:
  interface trip { } (lowercase)
  interface tripData { } (camelCase)
```

**React Components:** PascalCase for names, PascalCase.tsx for files
```typescript
✅ CORRECT:
  RiderMarker.tsx
  TripCodeDisplay.tsx
  VoiceInputFAB.tsx
  SOSButton.tsx

❌ INCORRECT:
  riderMarker.tsx (camelCase file)
  rider-marker.tsx (kebab-case)
  RiderMarker.jsx (wrong extension, use .tsx)
```

**Functions & Variables:** camelCase
```typescript
✅ CORRECT:
  function getUserPosition() { }
  const tripCode = 'ABC123'
  const calculateDistance = () => { }

❌ INCORRECT:
  function GetUserPosition() { } (PascalCase)
  const trip_code = 'ABC123' (snake_case)
```

**Constants:** SCREAMING_SNAKE_CASE (only for truly immutable values)
```typescript
✅ CORRECT:
  const MAX_RIDERS_PER_TRIP = 50
  const DEFAULT_POLLING_INTERVAL = 5000
  const REDIS_TTL_SECONDS = 30

❌ INCORRECT:
  const apiUrl = 'http://...' (not truly constant, use camelCase)
  const MaxRidersPerTrip = 50 (PascalCase)
```

**Files & Directories:** 
- Components: PascalCase.tsx
- Utilities: camelCase.ts
- Services: camelCase.ts
- Hooks: use + PascalCase.ts (e.g., useWebSocket.ts)
- Stores: camelCase + Store.ts (e.g., tripStore.ts)

#### Redis Key Naming

**Key Pattern:** colon-separated namespaces, lowercase
```typescript
✅ CORRECT:
  `trip:${tripCode}:rider:${deviceId}`
  `trip:${tripCode}:meta`
  `trip:${tripCode}:geo`
  `ratelimit:create_trip:${deviceId}`

❌ INCORRECT:
  `trip_${tripCode}_rider_${deviceId}` (underscores)
  `trip-${tripCode}-rider-${deviceId}` (hyphens)
  `Trip:${tripCode}` (capital T)
```

### Structure Patterns

#### Project Organization

**Monorepo Structure:** (Already defined in starter template)
```
syncride-monorepo/
├── apps/
│   ├── web/           # Frontend React PWA
│   └── api/           # Backend Node.js + Socket.io
├── packages/
│   ├── shared-types/  # TypeScript definitions
│   ├── config/        # Shared configs
│   └── utils/         # Shared utilities
```

**Frontend Structure (`apps/web/src/`):**
```
src/
├── components/
│   ├── ui/            # Primitives (Button, Input, Dialog)
│   ├── map/           # Map components (RiderMarker, MapView)
│   ├── trip/          # Trip UI (TripCodeDisplay, MemberList)
│   ├── feedback/      # Feedback (Toast, ConnectionBanner)
│   └── layout/        # Layout (BottomStatusBar, FABs)
├── features/          # Feature modules
│   ├── trip-session/
│   ├── location/
│   └── voice-status/
├── hooks/             # Custom hooks (useWebSocket.ts, useAdaptiveGPS.ts)
├── stores/            # Zustand stores (tripStore.ts, locationStore.ts)
├── services/          # External services (websocket.ts, geolocation.ts, mapbox.ts)
├── utils/             # Utilities (coordinates.ts, validation.ts)
├── types/             # Type imports from @syncride/shared-types
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

**Backend Structure (`apps/api/src/`):**
```
src/
├── controllers/       # Request handlers (tripController.ts)
├── services/          # Business logic (tripService.ts, presenceService.ts)
├── models/            # Mongoose schemas (Trip.ts, Rider.ts)
├── sockets/           # Socket.io handlers (tripEvents.ts, locationEvents.ts)
├── middleware/        # Express middleware (auth.ts, errorHandler.ts)
├── config/            # Configuration (database.ts, redis.ts, socket.ts)
├── utils/             # Utilities (geospatial.ts, ttl.ts, jwt.ts)
├── types/             # Type imports from @syncride/shared-types
├── app.ts             # Express app setup
└── server.ts          # HTTP + Socket.io initialization
```

#### Test File Organization

**Pattern:** Co-located test files with `.test.ts` suffix
```typescript
✅ CORRECT:
  coordinates.ts
  coordinates.test.ts
  
  RiderMarker.tsx
  RiderMarker.test.tsx

❌ INCORRECT:
  __tests__/coordinates.test.ts (separate directory)
  coordinates.spec.ts (wrong suffix)
  test-coordinates.ts (prefix instead of suffix)
```

**Test Naming Convention:**
```typescript
describe('calculateDistance', () => {
  it('should return distance in kilometers', () => { })
  it('should handle same coordinates (0 km)', () => { })
  it('should throw error for invalid coordinates', () => { })
})
```

### Format Patterns

#### API Response Formats

**Success Response:** Direct data, no wrapper
```typescript
✅ CORRECT:
  POST /api/trips
  Response: { tripCode: 'ABC123', token: 'jwt...', expiresAt: '2026-04-11T...' }
  
  GET /api/trips/ABC123
  Response: { trip: Trip, riders: Rider[] }

❌ INCORRECT:
  { data: { tripCode: 'ABC123' }, success: true } (unnecessary wrapper)
  { result: { trip: Trip } } (inconsistent wrapper)
```

**Error Response:** Consistent error object structure
```typescript
✅ CORRECT:
  {
    error: {
      code: 'TRIP_NOT_FOUND',
      message: 'Trip code does not exist',
      details?: any  // Optional Zod validation errors
    }
  }

❌ INCORRECT:
  { error: 'Trip not found' } (string instead of object)
  { message: 'Error', error_code: 'TRIP_NOT_FOUND' } (inconsistent keys)
```

**Error Codes:** SCREAMING_SNAKE_CASE
```typescript
✅ CORRECT:
  'TRIP_NOT_FOUND'
  'UNAUTHORIZED'
  'INVALID_TRIP_CODE'
  'RATE_LIMIT_EXCEEDED'
  'GPS_UNAVAILABLE'

❌ INCORRECT:
  'TripNotFound' (PascalCase)
  'trip-not-found' (kebab-case)
  404 (numeric code, use string codes)
```

#### Date/Time Formats

**All Timestamps:** ISO 8601 strings (NOT Unix timestamps)
```typescript
✅ CORRECT:
  createdAt: '2026-04-10T14:30:00.000Z'
  expiresAt: '2026-04-11T14:30:00.000Z'
  timestamp: '2026-04-10T14:30:15.123Z'

❌ INCORRECT:
  createdAt: 1744375800 (Unix timestamp)
  created_at: '2026-04-10 14:30:00' (SQL format)
  timestamp: new Date() (Date object, must serialize to string)
```

**Rationale:** ISO strings are timezone-aware, human-readable in logs, and directly parseable by JavaScript `new Date()`.

#### Location Coordinate Precision

**Lat/Lon Precision:** 6 decimal places (~11cm accuracy)
```typescript
✅ CORRECT:
  { lat: 19.075984, lon: 72.877426 }

❌ INCORRECT:
  { lat: 19.08, lon: 72.88 } (too imprecise)
  { lat: 19.0759843892, lon: 72.8774265123 } (too precise, wastes bandwidth)
```

**Speed Precision:** 1 decimal place (0.1 km/h)
```typescript
✅ CORRECT:
  speed: 85.3  // km/h

❌ INCORRECT:
  speed: 85 (integer loses precision)
  speed: 85.347 (excessive precision)
```

#### WebSocket Event Payloads

**Event Payload Structure:** Flat object, camelCase keys
```typescript
✅ CORRECT:
  socket.emit('location_update', {
    tripCode: 'ABC123',
    deviceId: 'uuid-here',
    lat: 19.075984,
    lon: 72.877426,
    speed: 85.3,
    heading: 270,
    accuracy: 15,
    timestamp: '2026-04-10T14:30:15.123Z'
  })

❌ INCORRECT:
  socket.emit('location_update', {
    trip: { code: 'ABC123' },  // Nested object (inefficient)
    location: { lat, lon },    // Nested object
    metadata: { speed, heading }
  })
```

**Rationale:** Flat payloads reduce serialization overhead and bandwidth for high-frequency events.

### Communication Patterns

#### WebSocket Event Patterns

**Event Emission (Client → Server):**
```typescript
✅ CORRECT:
  socket.emit('join_trip', payload, (acknowledgment) => {
    // Handle server response
  })

❌ INCORRECT:
  socket.emit('join_trip', payload)
  // No acknowledgment, can't confirm success
```

**Event Broadcast (Server → Room):**
```typescript
✅ CORRECT:
  io.to(`trip:${tripCode}`).emit('location_broadcast', payload)

❌ INCORRECT:
  io.emit('location_broadcast', payload)  // Broadcasts to ALL clients
  socket.broadcast.emit('location_broadcast', payload)  // Excludes sender
```

#### State Management Patterns (Zustand)

**State Updates:** Immutable patterns with immer (built into Zustand)
```typescript
✅ CORRECT:
  updateRiderPosition: (riderId, position) => set((state) => {
    const newRiders = new Map(state.riders)
    newRiders.set(riderId, position)
    return { riders: newRiders }
  })

❌ INCORRECT:
  updateRiderPosition: (riderId, position) => set((state) => {
    state.riders.set(riderId, position)  // Direct mutation
    return state
  })
```

**Store Organization:** One store per domain
```typescript
✅ CORRECT:
  tripStore.ts     // Trip session state
  locationStore.ts // GPS tracking state
  uiStore.ts       // UI state (glance mode, theme)

❌ INCORRECT:
  globalStore.ts  // Everything in one store (hard to debug)
```

#### Async Operation Patterns

**TanStack Query Keys:** Array format, hierarchical
```typescript
✅ CORRECT:
  ['trip-replay', tripCode]
  ['trip-details', tripCode]
  ['rider-history', riderId, startTime, endTime]

❌ INCORRECT:
  'tripReplay'  // String key (not hierarchical)
  ['trip', 'replay', tripCode]  // Too nested
```

### Process Patterns

#### Error Handling Patterns

**Backend Error Throwing:**
```typescript
✅ CORRECT:
  throw new AppError(404, 'TRIP_NOT_FOUND', 'Trip code does not exist')
  throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token')

❌ INCORRECT:
  throw new Error('Trip not found')  // Generic Error, no status code
  res.status(404).json({ error: 'Not found' })  // Inline error handling
```

**Frontend Error Handling:**
```typescript
✅ CORRECT:
  try {
    await joinTrip(code)
  } catch (err) {
    if (err.response?.data?.error?.code === 'TRIP_NOT_FOUND') {
      showToast('Trip code does not exist', 'error')
    } else {
      showToast('Failed to join trip', 'error')
      Sentry.captureException(err)
    }
  }

❌ INCORRECT:
  try {
    await joinTrip(code)
  } catch (err) {
    alert(err.message)  // Generic error display
  }
```

#### Loading State Patterns

**Component Loading States:**
```typescript
✅ CORRECT:
  const { data, isLoading, error } = useQuery(['trip', code], fetchTrip)
  
  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  return <TripView data={data} />

❌ INCORRECT:
  const [loading, setLoading] = useState(false)
  // Manual loading state management (use TanStack Query)
```

**Global Loading States:** Only for critical app-wide operations
```typescript
✅ CORRECT:
  // Initial app load, authentication check
  uiStore: { isAppReady: boolean }

❌ INCORRECT:
  // Every API call has global loading indicator (use component-level)
```

#### Reconnection Patterns

**WebSocket Reconnection:** Exponential backoff with jitter
```typescript
✅ CORRECT:
  const reconnectDelays = [1000, 2000, 4000, 8000, 16000]  // ms
  const jitter = Math.random() * 1000
  const delay = reconnectDelays[attempt] + jitter

❌ INCORRECT:
  const delay = 5000  // Fixed delay (thundering herd problem)
```

**Location Buffer Flush:** On reconnect, batch upload
```typescript
✅ CORRECT:
  socket.on('connect', () => {
    const buffered = locationStore.flushBuffer()
    socket.emit('location_batch', { locations: buffered })
  })

❌ INCORRECT:
  socket.on('connect', () => {
    buffered.forEach(loc => socket.emit('location_update', loc))
    // Individual emits (wastes bandwidth)
  })
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. ✅ Use exact naming conventions defined above (snake_case events, camelCase fields, PascalCase components)
2. ✅ Follow project structure patterns (co-located tests, feature-based organization)
3. ✅ Use consistent error format ({ error: { code, message, details } })
4. ✅ Emit ISO 8601 timestamps (never Unix timestamps)
5. ✅ Use 6 decimal places for lat/lon coordinates
6. ✅ Follow immutable state updates in Zustand
7. ✅ Use TanStack Query for server state (not manual loading states)
8. ✅ Implement exponential backoff for reconnections
9. ✅ Use flat WebSocket event payloads (no nesting)
10. ✅ Co-locate test files with source files (.test.ts suffix)

**Pattern Enforcement:**

- **Linting:** ESLint rules for naming conventions (eslint-plugin-naming-convention)
- **Type Checking:** TypeScript strict mode catches interface mismatches
- **Code Review:** Automated checks in CI/CD (lint, test, type-check)
- **Documentation:** This architecture document is source of truth

**Pattern Violations:**
- Log violations in GitHub Issues with `pattern-violation` label
- Update this document when patterns evolve (version control changes)
- Run `pnpm lint` before committing (pre-commit hook)

### Pattern Examples

**Good Example: Location Update Flow**
```typescript
// ✅ Backend Socket Handler
socket.on('location_update', async (payload) => {
  // Validate with Zod
  const validated = locationUpdateSchema.parse(payload)
  
  // Update Redis cache (camelCase keys)
  await redis.set(
    `trip:${validated.tripCode}:rider:${validated.deviceId}`,
    JSON.stringify({
      lat: validated.lat,
      lon: validated.lon,
      speed: validated.speed,
      heading: validated.heading,
      timestamp: validated.timestamp
    }),
    'EX', 30  // 30-second TTL
  )
  
  // Broadcast to room (snake_case event name)
  io.to(`trip:${validated.tripCode}`).emit('location_broadcast', {
    riderId: validated.deviceId,
    lat: validated.lat,
    lon: validated.lon,
    speed: validated.speed,
    heading: validated.heading,
    timestamp: validated.timestamp
  })
})

// ✅ Frontend WebSocket Client
socket.on('location_broadcast', (payload) => {
  // Update Zustand store (immutable)
  tripStore.updateRiderPosition(payload.riderId, {
    lat: payload.lat,
    lon: payload.lon,
    speed: payload.speed,
    heading: payload.heading,
    timestamp: payload.timestamp
  })
})
```

**Anti-Pattern: Inconsistent Naming**
```typescript
// ❌ Mixed naming conventions
socket.on('LocationUpdate', (payload) => {  // PascalCase event (wrong)
  await redis.set(
    `Trip_${payload.trip_code}_Rider_${payload.device_id}`,  // Mixed case (wrong)
    JSON.stringify(payload)
  )
  
  io.emit('location-broadcast', {  // kebab-case (wrong)
    rider_id: payload.device_id,  // snake_case (wrong for JSON)
    coordinates: {  // Nested object (inefficient)
      latitude: payload.lat,
      longitude: payload.lon
    }
  })
})
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
syncride-monorepo/
├── README.md
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml            # Workspace definition
├── turbo.json                     # Turborepo task orchestration
├── .gitignore
├── .env                           # Shared secrets (not committed)
├── .env.example                   # Environment template
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint, test, type-check
│       ├── deploy-frontend.yml    # Vercel deployment
│       └── deploy-backend.yml     # Railway deployment
│
├── apps/
│   ├── web/                       # React PWA Frontend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts        # Vite + PWA plugin config
│   │   ├── tailwind.config.js    # Tailwind with glove-friendly tokens
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   ├── .env.development
│   │   ├── .env.production
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   ├── robots.txt
│   │   │   ├── pwa-192x192.png
│   │   │   ├── pwa-512x512.png
│   │   │   └── pwa-maskable-512x512.png
│   │   └── src/
│   │       ├── main.tsx                      # Entry point
│   │       ├── App.tsx                       # Root component with routing
│   │       ├── vite-env.d.ts
│   │       ├── components/
│   │       │   ├── ui/                       # Shadcn/UI primitives
│   │       │   │   ├── Button.tsx
│   │       │   │   ├── Input.tsx
│   │       │   │   ├── Dialog.tsx
│   │       │   │   ├── Toast.tsx
│   │       │   │   └── Spinner.tsx
│   │       │   ├── map/                      # Map components
│   │       │   │   ├── MapView.tsx           # Mapbox GL JS wrapper
│   │       │   │   ├── MapView.test.tsx
│   │       │   │   ├── RiderMarker.tsx       # Rider position with status ring
│   │       │   │   ├── RiderMarker.test.tsx
│   │       │   │   ├── GroupBounds.tsx       # Bounding box visualization
│   │       │   │   └── LocationAccuracy.tsx  # Accuracy radius
│   │       │   ├── trip/                     # Trip management UI
│   │       │   │   ├── TripCodeDisplay.tsx
│   │       │   │   ├── TripCodeDisplay.test.tsx
│   │       │   │   ├── TripCodeEntry.tsx
│   │       │   │   ├── MemberListItem.tsx
│   │       │   │   └── MemberList.tsx
│   │       │   ├── feedback/                 # User feedback
│   │       │   │   ├── ConnectionStatusBanner.tsx
│   │       │   │   ├── ConnectionStatusBanner.test.tsx
│   │       │   │   ├── SOSAlertDialog.tsx
│   │       │   │   ├── CountdownTimer.tsx
│   │       │   │   └── Toast.tsx
│   │       │   └── layout/                   # Layout components
│   │       │       ├── BottomStatusBar.tsx
│   │       │       ├── BottomStatusBar.test.tsx
│   │       │       ├── VoiceInputFAB.tsx
│   │       │       └── SOSButton.tsx
│   │       ├── features/                     # Feature modules
│   │       │   ├── trip-session/
│   │       │   │   ├── TripJoinPage.tsx
│   │       │   │   ├── TripCreatePage.tsx
│   │       │   │   ├── ActiveTripPage.tsx
│   │       │   │   └── useTripSession.ts
│   │       │   ├── location/
│   │       │   │   ├── AdaptiveGPSService.ts
│   │       │   │   ├── LocationBuffering.ts
│   │       │   │   └── MotionDetection.ts
│   │       │   └── voice-status/
│   │       │       ├── VoiceInput.tsx
│   │       │       ├── SpeechToText.ts
│   │       │       └── StatusIntents.ts
│   │       ├── hooks/                        # Custom React hooks
│   │       │   ├── useWebSocket.ts
│   │       │   ├── useWebSocket.test.ts
│   │       │   ├── useAdaptiveGPS.ts
│   │       │   ├── useMotionDetection.ts
│   │       │   ├── useGeolocation.ts
│   │       │   └── useTripCode.ts
│   │       ├── stores/                       # Zustand stores
│   │       │   ├── tripStore.ts              # Trip session state
│   │       │   ├── tripStore.test.ts
│   │       │   ├── locationStore.ts          # GPS tracking state
│   │       │   ├── locationStore.test.ts
│   │       │   └── uiStore.ts                # UI state (glance mode, theme)
│   │       ├── services/                     # External services
│   │       │   ├── websocket.ts              # Socket.io client setup
│   │       │   ├── geolocation.ts            # Browser Geolocation API wrapper
│   │       │   ├── mapbox.ts                 # Mapbox GL JS initialization
│   │       │   └── api.ts                    # REST API client (axios/fetch)
│   │       ├── utils/                        # Utility functions
│   │       │   ├── coordinates.ts            # Distance, bounding box calculations
│   │       │   ├── coordinates.test.ts
│   │       │   ├── polling.ts                # Adaptive polling algorithm
│   │       │   ├── validation.ts             # Trip code, input validation
│   │       │   └── formatters.ts             # Date, distance formatters
│   │       └── types/                        # Type imports from shared-types
│   │           └── index.ts                  # Re-exports from @syncride/shared-types
│   │
│   └── api/                       # Backend Node.js + Socket.io
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.development
│       ├── .env.production
│       ├── .env.example
│       ├── nodemon.json
│       ├── jest.config.js
│       └── src/
│           ├── server.ts                     # HTTP + Socket.io initialization
│           ├── app.ts                        # Express app setup
│           ├── controllers/                  # Request handlers
│           │   ├── tripController.ts
│           │   ├── tripController.test.ts
│           │   └── healthController.ts
│           ├── services/                     # Business logic
│           │   ├── tripService.ts
│           │   ├── tripService.test.ts
│           │   ├── locationService.ts
│           │   ├── locationService.test.ts
│           │   └── presenceService.ts        # Redis TTL presence detection
│           ├── models/                       # Mongoose schemas
│           │   ├── Trip.ts
│           │   ├── Rider.ts
│           │   └── LocationHistory.ts        # Time-series collection
│           ├── sockets/                      # Socket.io event handlers
│           │   ├── index.ts                  # Socket.io initialization
│           │   ├── tripEvents.ts             # JOIN_TRIP, LEAVE_TRIP
│           │   ├── tripEvents.test.ts
│           │   ├── locationEvents.ts         # LOCATION_UPDATE, BROADCAST
│           │   └── sosEvents.ts              # SOS_BROADCAST, SOS_ACK
│           ├── middleware/                   # Express middleware
│           │   ├── auth.ts                   # JWT validation
│           │   ├── auth.test.ts
│           │   ├── errorHandler.ts           # Global error handling
│           │   ├── rateLimiter.ts            # Rate limiting (Redis-backed)
│           │   └── cors.ts                   # CORS configuration
│           ├── config/                       # Configuration
│           │   ├── database.ts               # MongoDB connection
│           │   ├── redis.ts                  # Redis client setup
│           │   ├── socket.ts                 # Socket.io configuration
│           │   ├── env.ts                    # Zod env validation
│           │   └── logger.ts                 # Pino logger setup
│           ├── utils/                        # Utility functions
│           │   ├── geospatial.ts             # GEORADIUS, distance calculations
│           │   ├── geospatial.test.ts
│           │   ├── ttl.ts                    # Redis TTL presence helpers
│           │   ├── jwt.ts                    # JWT generation/validation
│           │   ├── jwt.test.ts
│           │   ├── tripCode.ts               # Trip code generation
│           │   └── errors.ts                 # AppError class
│           └── types/                        # Type imports
│               └── index.ts                  # Re-exports from @syncride/shared-types
│
├── packages/
│   ├── shared-types/              # TypeScript definitions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                      # Barrel exports
│   │       ├── trip.ts                       # Trip, TripCode, TripStatus
│   │       ├── rider.ts                      # Rider, RiderStatus, RiderPosition
│   │       ├── location.ts                   # Coordinates, LocationUpdate, GPSState
│   │       ├── websocket.ts                  # WebSocket event types
│   │       ├── sos.ts                        # SOS event types
│   │       └── api.ts                        # API request/response types
│   │
│   ├── config/                    # Shared configurations
│   │   ├── package.json
│   │   ├── tsconfig.base.json               # Base TypeScript config
│   │   ├── eslint.config.js                 # Shared ESLint rules
│   │   └── prettier.config.js               # Shared Prettier config
│   │
│   └── utils/                     # Shared utilities
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── validation.ts                 # Zod schemas
│           ├── constants.ts                  # Shared constants
│           └── formatters.ts                 # Date/distance formatters
│
└── docs/                          # Documentation
    ├── architecture.md            # This document
    ├── api.md                     # API documentation
    ├── deployment.md              # Deployment guide
    └── development.md             # Development setup guide
```

### Architectural Boundaries

#### API Boundaries

**REST API Endpoints (apps/api/src/controllers/):**
```
POST   /api/trips                  # tripController.createTrip()
GET    /api/trips/:code            # tripController.getTripDetails()
DELETE /api/trips/:code            # tripController.endTrip() [Host only]
POST   /api/trips/:code/join       # tripController.joinTrip()
GET    /api/trips/:code/replay     # tripController.getReplay() [Opt-in only]
GET    /api/health                 # healthController.check()
```

**WebSocket Events (apps/api/src/sockets/):**
```
Client → Server:
  'join_trip'        → tripEvents.handleJoinTrip()
  'leave_trip'       → tripEvents.handleLeaveTrip()
  'location_update'  → locationEvents.handleLocationUpdate()
  'voice_status'     → locationEvents.handleVoiceStatus()
  'sos_broadcast'    → sosEvents.handleSOSBroadcast()

Server → Client:
  'trip_joined'      → Broadcast to room
  'rider_left'       → Broadcast to room
  'location_broadcast' → Broadcast to room
  'sos_alert'        → Broadcast to room
  'connection_status' → Broadcast to specific rider
```

**Authentication Boundary:**
- **Middleware:** `apps/api/src/middleware/auth.ts` validates JWT tokens
- **Applied to:** All protected REST endpoints and WebSocket handshake
- **Token format:** JWT with { deviceId, tripCode, role, exp }

#### Component Boundaries

**Frontend Component Communication:**
```
MapView (apps/web/src/components/map/)
  ↓ subscribes to
tripStore (apps/web/src/stores/tripStore.ts)
  ↑ updated by
useWebSocket hook (apps/web/src/hooks/useWebSocket.ts)
  ↑ receives
Socket.io events (apps/web/src/services/websocket.ts)
```

**State Management Boundaries:**
- **Trip State** (tripStore.ts): Current trip session, riders, positions
- **Location State** (locationStore.ts): Local GPS tracking, buffering, motion state
- **UI State** (uiStore.ts): Glance mode, theme, UI toggles
- **Server State** (TanStack Query): Trip history, replay data (cached)

**No cross-store dependencies:** Each store is independent, updated via explicit actions.

#### Service Boundaries

**Backend Service Layer:**
```
Controller (tripController.ts)
  ↓ calls
Service (tripService.ts)
  ↓ uses
Model (Trip.ts, Rider.ts) + Redis Cache (presenceService.ts)
```

**Service Responsibilities:**
- **tripService.ts**: Trip CRUD operations, trip code generation, validation
- **locationService.ts**: Location update processing, geospatial queries
- **presenceService.ts**: Redis TTL-based presence detection, ghost cleanup

**Services do NOT call controllers:** Unidirectional dependency (controller → service → model).

#### Data Boundaries

**MongoDB Collections (apps/api/src/models/):**
- **trips**: Trip metadata (tripCode, host, riders[], status)
- **riders**: Current rider state (location, status, lastSeen)
- **locationhistories**: Time-series location history (opt-in replay)

**Redis Cache (apps/api/src/config/redis.ts):**
```
Keys:
  trip:{tripCode}:rider:{deviceId}  → Current position (30s TTL)
  trip:{tripCode}:meta              → Trip metadata (24h TTL)
  trip:{tripCode}:geo               → GEOHASH for proximity (no TTL)
  ratelimit:create_trip:{deviceId} → Rate limit counter (1h TTL)
```

**Data Access Pattern:**
1. **Write:** Controller → Service → Model + Redis (dual write)
2. **Read:** Controller → Service → Redis (cache-first), fallback to MongoDB

**Cache Invalidation:**
- TTL-based expiration (automatic)
- Manual invalidation on trip end (delete all keys with `trip:{code}:*` pattern)

### Requirements to Structure Mapping

#### Feature/Epic Mapping

**Trip Session Management (Phase 1):**
- Frontend:
  - `apps/web/src/features/trip-session/TripJoinPage.tsx`
  - `apps/web/src/features/trip-session/TripCreatePage.tsx`
  - `apps/web/src/components/trip/TripCodeDisplay.tsx`
  - `apps/web/src/components/trip/TripCodeEntry.tsx`
- Backend:
  - `apps/api/src/controllers/tripController.ts`
  - `apps/api/src/services/tripService.ts`
  - `apps/api/src/models/Trip.ts`
  - `apps/api/src/models/Rider.ts`
  - `apps/api/src/middleware/auth.ts`

**Real-Time Location Broadcasting (Phase 2):**
- Frontend:
  - `apps/web/src/features/location/AdaptiveGPSService.ts`
  - `apps/web/src/hooks/useAdaptiveGPS.ts`
  - `apps/web/src/hooks/useWebSocket.ts`
  - `apps/web/src/stores/locationStore.ts`
- Backend:
  - `apps/api/src/sockets/locationEvents.ts`
  - `apps/api/src/services/locationService.ts`
  - `apps/api/src/services/presenceService.ts`
  - `apps/api/src/models/LocationHistory.ts`

**Map Visualization (Phase 2):**
- Frontend:
  - `apps/web/src/components/map/MapView.tsx`
  - `apps/web/src/components/map/RiderMarker.tsx`
  - `apps/web/src/components/map/GroupBounds.tsx`
  - `apps/web/src/services/mapbox.ts`
  - `apps/web/src/utils/coordinates.ts`

**SOS Emergency Broadcast (Phase 3):**
- Frontend:
  - `apps/web/src/components/layout/SOSButton.tsx`
  - `apps/web/src/components/feedback/SOSAlertDialog.tsx`
- Backend:
  - `apps/api/src/sockets/sosEvents.ts`

**Voice Status Updates (Phase 3):**
- Frontend:
  - `apps/web/src/components/layout/VoiceInputFAB.tsx`
  - `apps/web/src/features/voice-status/VoiceInput.tsx`
  - `apps/web/src/features/voice-status/SpeechToText.ts`
  - `apps/web/src/features/voice-status/StatusIntents.ts`

#### Cross-Cutting Concerns

**Authentication & Security:**
- JWT Token Generation: `apps/api/src/utils/jwt.ts`
- JWT Middleware: `apps/api/src/middleware/auth.ts`
- Rate Limiting: `apps/api/src/middleware/rateLimiter.ts`
- Input Validation: `packages/utils/src/validation.ts` (Zod schemas)

**Error Handling:**
- Backend Global Handler: `apps/api/src/middleware/errorHandler.ts`
- Custom Error Class: `apps/api/src/utils/errors.ts` (AppError)
- Frontend Error Tracking: Sentry integration in `apps/web/src/main.tsx`

**Logging & Monitoring:**
- Backend Logger: `apps/api/src/config/logger.ts` (Pino)
- Frontend Error Tracking: `apps/web/src/main.tsx` (Sentry)
- Custom Metrics: `apps/api/src/utils/metrics.ts` (future)

**Shared Types:**
- All type definitions: `packages/shared-types/src/`
- Frontend imports: `apps/web/src/types/index.ts` (re-exports)
- Backend imports: `apps/api/src/types/index.ts` (re-exports)

**Configuration:**
- Environment validation: `packages/config/` (Zod schemas)
- Frontend env: `apps/web/.env.development`, `.env.production`
- Backend env: `apps/api/.env.development`, `.env.production`

### Integration Points

#### Internal Communication

**Frontend ↔ Backend (REST API):**
```
apps/web/src/services/api.ts (axios client)
  → HTTP/HTTPS
    → apps/api/src/app.ts (Express server)
      → apps/api/src/controllers/tripController.ts
```

**Frontend ↔ Backend (WebSocket):**
```
apps/web/src/services/websocket.ts (Socket.io client)
  → WebSocket
    → apps/api/src/sockets/index.ts (Socket.io server)
      → apps/api/src/sockets/locationEvents.ts
```

**Frontend State Flow:**
```
Browser Geolocation API
  → apps/web/src/hooks/useAdaptiveGPS.ts
    → apps/web/src/stores/locationStore.ts
      → apps/web/src/services/websocket.ts (emit 'location_update')
```

**Backend Data Flow:**
```
Socket.io event handler
  → apps/api/src/sockets/locationEvents.ts
    → apps/api/src/services/locationService.ts
      → Redis cache (presenceService.ts)
      → MongoDB (LocationHistory model)
      → Broadcast to room (io.to().emit())
```

#### External Integrations

**Mapbox GL JS:**
- Integration point: `apps/web/src/services/mapbox.ts`
- Used by: `apps/web/src/components/map/MapView.tsx`
- API token: `VITE_MAPBOX_TOKEN` env variable
- Tile caching: Vite PWA plugin workbox config

**MongoDB Atlas:**
- Connection: `apps/api/src/config/database.ts`
- Models: `apps/api/src/models/` (Mongoose schemas)
- Connection string: `MONGODB_URI` env variable

**Upstash Redis:**
- Connection: `apps/api/src/config/redis.ts`
- Services: `apps/api/src/services/presenceService.ts`
- Connection URL: `REDIS_URL` env variable

**Sentry (Error Tracking):**
- Frontend: `apps/web/src/main.tsx` (Sentry.init)
- Backend: `apps/api/src/server.ts` (Sentry.init)
- DSN: `VITE_SENTRY_DSN` / `SENTRY_DSN` env variables

#### Data Flow

**Location Update Flow (High-Frequency):**
```
1. Browser Geolocation API (2-15s interval)
   ↓
2. apps/web/src/hooks/useAdaptiveGPS.ts (motion-based polling)
   ↓
3. apps/web/src/stores/locationStore.ts (local state + buffering)
   ↓
4. apps/web/src/services/websocket.ts → emit('location_update')
   ↓
5. apps/api/src/sockets/locationEvents.ts (validate with Zod)
   ↓
6. apps/api/src/services/presenceService.ts → Redis cache (30s TTL)
   ↓
7. apps/api/src/sockets/locationEvents.ts → io.to(room).emit('location_broadcast')
   ↓
8. apps/web/src/services/websocket.ts ← on('location_broadcast')
   ↓
9. apps/web/src/stores/tripStore.ts (update riders Map)
   ↓
10. apps/web/src/components/map/RiderMarker.tsx (re-render)
```

**Trip Creation Flow:**
```
1. apps/web/src/features/trip-session/TripCreatePage.tsx (form submit)
   ↓
2. apps/web/src/services/api.ts → POST /api/trips
   ↓
3. apps/api/src/controllers/tripController.ts (createTrip)
   ↓
4. apps/api/src/services/tripService.ts (generate code, create JWT)
   ↓
5. apps/api/src/models/Trip.ts (MongoDB insert)
   ↓
6. apps/api/src/config/redis.ts (cache trip metadata)
   ↓
7. Response: { tripCode, token, expiresAt }
   ↓
8. apps/web/src/stores/tripStore.ts (set tripCode, save token to localStorage)
   ↓
9. apps/web/src/features/trip-session/TripCreatePage.tsx (navigate to /trip/:code)
```

### File Organization Patterns

#### Configuration Files

**Root-Level Configs:**
- `package.json`: Workspace scripts (dev, build, test, lint)
- `pnpm-workspace.yaml`: Workspace package definitions
- `turbo.json`: Task orchestration and caching
- `.github/workflows/`: CI/CD pipelines (GitHub Actions)

**App-Level Configs:**
- **Frontend:** `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`
- **Backend:** `tsconfig.json`, `nodemon.json`, `jest.config.js`

**Shared Configs:**
- `packages/config/tsconfig.base.json`: Base TypeScript config (extended by apps)
- `packages/config/eslint.config.js`: Shared linting rules
- `packages/config/prettier.config.js`: Shared code formatting

#### Source Organization

**Feature-Based (Frontend):**
- Features: `apps/web/src/features/{feature-name}/` (TripSession, Location, VoiceStatus)
- Components: `apps/web/src/components/{category}/` (ui, map, trip, feedback, layout)
- Hooks: `apps/web/src/hooks/` (custom React hooks)
- Stores: `apps/web/src/stores/` (Zustand state management)
- Services: `apps/web/src/services/` (external integrations)
- Utils: `apps/web/src/utils/` (pure functions, calculations)

**Layer-Based (Backend):**
- Controllers: `apps/api/src/controllers/` (HTTP request handlers)
- Services: `apps/api/src/services/` (business logic)
- Models: `apps/api/src/models/` (Mongoose schemas)
- Sockets: `apps/api/src/sockets/` (WebSocket event handlers)
- Middleware: `apps/api/src/middleware/` (Express middleware)
- Config: `apps/api/src/config/` (database, redis, logger)
- Utils: `apps/api/src/utils/` (pure functions, helpers)

#### Test Organization

**Co-Located Tests:** Tests live next to source files with `.test.ts` suffix
```
apps/web/src/utils/coordinates.ts
apps/web/src/utils/coordinates.test.ts

apps/api/src/services/tripService.ts
apps/api/src/services/tripService.test.ts
```

**Test Commands (Root):**
```bash
pnpm test              # Run all tests across monorepo
pnpm test:web          # Run frontend tests only
pnpm test:api          # Run backend tests only
pnpm test:watch        # Watch mode for development
```

#### Asset Organization

**Frontend Static Assets:**
- `apps/web/public/`: Static files served at root
  - `favicon.svg`, `robots.txt`
  - PWA icons: `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`

**Build Outputs:**
- Frontend: `apps/web/dist/` (Vite build output, deployed to Vercel)
- Backend: `apps/api/dist/` (TypeScript compiled output, deployed to Railway)

**Documentation:**
- `docs/`: Project-wide documentation
- `README.md`: Root-level project overview
- App-specific: `apps/web/README.md`, `apps/api/README.md`

### Development Workflow Integration

#### Development Server Structure

**Start Development (Root):**
```bash
pnpm dev
  → Turborepo runs dev scripts in parallel:
    → apps/web: Vite dev server (http://localhost:5173)
    → apps/api: ts-node-dev (http://localhost:3000)
```

**Environment Setup:**
1. Copy `.env.example` to `.env.development`
2. Set required variables (MongoDB URI, Redis URL, Mapbox token, JWT secret)
3. Run `pnpm install` (installs all workspace dependencies)
4. Run `pnpm dev` (starts both frontend and backend)

#### Build Process Structure

**Production Build (Root):**
```bash
pnpm build
  → Turborepo builds in dependency order:
    1. packages/shared-types (TypeScript compile)
    2. packages/utils (TypeScript compile)
    3. apps/web (Vite build → dist/)
    4. apps/api (TypeScript compile → dist/)
```

**Build Outputs:**
- `apps/web/dist/`: Static files (HTML, JS, CSS, assets) for Vercel
- `apps/api/dist/`: Compiled Node.js server for Railway

#### Deployment Structure

**Frontend Deployment (Vercel):**
```
GitHub push to main
  → GitHub Actions CI (lint, test, type-check)
  → Vercel webhook triggered
  → Vercel builds apps/web
  → Deploy to https://syncride.app
```

**Backend Deployment (Railway):**
```
GitHub push to main
  → GitHub Actions CI (lint, test, type-check)
  → Railway webhook triggered
  → Railway builds apps/api
  → Deploy to https://api.syncride.app
  → Run MongoDB migrations if needed
```

**Environment Variables (Per Environment):**
- Vercel: Set in dashboard (VITE_* variables)
- Railway: Set in dashboard (NODE_ENV, DATABASE_URL, etc.)

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All architectural decisions are compatible and work together seamlessly:
- ✅ React + TypeScript + Tailwind + Vite: All compatible, Vite 7 supports React Fast Refresh with SWC
- ✅ Node.js 20+ requirement: Compatible with all chosen backend libraries (Express, Socket.io, Mongoose)
- ✅ Socket.io + Redis adapter: Production-proven pattern for horizontal scaling (500k concurrent clients tested)
- ✅ MongoDB + Redis: Complementary usage (MongoDB for persistence, Redis for speed)
- ✅ Zustand + TanStack Query: Non-overlapping state management domains (real-time vs server state)
- ✅ Vercel + Railway: Both support the respective app types (static PWA + WebSocket server)

**Pattern Consistency:**
Implementation patterns fully align with architectural decisions:
- ✅ Naming conventions align with TypeScript/JavaScript ecosystem standards
- ✅ WebSocket snake_case events distinguishable from camelCase functions (grep-able in logs)
- ✅ MongoDB camelCase fields match TypeScript interfaces directly (zero mapping needed)
- ✅ Project structure supports monorepo tooling (Turborepo task orchestration + pnpm workspaces)
- ✅ Test co-location pattern works with both Vitest (frontend) and Jest (backend)

**Structure Alignment:**
Project structure fully supports all architectural decisions:
- ✅ Feature-based frontend structure supports parallel development (trip-session, location, voice-status)
- ✅ Layer-based backend structure enables clear separation of concerns (controllers → services → models)
- ✅ Shared packages eliminate type duplication (shared-types used by both apps)
- ✅ Component boundaries respect unidirectional data flow (no circular dependencies)
- ✅ Integration points clearly defined (REST for CRUD, WebSocket for real-time)

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

**Phase 1 Requirements (Foundation):**
- ✅ Ephemeral sessions: JWT + device-bound identity architecture (`apps/api/src/utils/jwt.ts`, `apps/api/src/middleware/auth.ts`)
- ✅ Trip code generation: 6-digit alphanumeric with collision detection (`apps/api/src/utils/tripCode.ts`)
- ✅ PWA platform: vite-plugin-pwa with Workbox configured (`apps/web/vite.config.ts`)
- ✅ Data lifecycle: MongoDB TTL indexes for auto-deletion, countdown UI (`CountdownTimer.tsx`)

**Phase 2 Requirements (Real-Time Engine):**
- ✅ WebSocket infrastructure: Socket.io with Redis adapter for scaling (`apps/api/src/sockets/index.ts`)
- ✅ Real-time broadcasting: Location events with room-based emit (`apps/api/src/sockets/locationEvents.ts`)
- ✅ State management: Zustand stores + TanStack Query configured (`apps/web/src/stores/`)
- ✅ Adaptive GPS polling: Motion-state detection architecture (`apps/web/src/features/location/AdaptiveGPSService.ts`)

**Phase 3 Requirements (Core Trip UX):**
- ✅ Group View: Bounding box component + coordinate utilities (`apps/web/src/components/map/GroupBounds.tsx`, `apps/web/src/utils/coordinates.ts`)
- ✅ SOS system: Lock-screen button + full-screen alert + broadcast events (`apps/web/src/components/layout/SOSButton.tsx`, `apps/api/src/sockets/sosEvents.ts`)
- ✅ Voice status: Voice input FAB + STT integration + predefined intents (`apps/web/src/features/voice-status/`)
- ✅ Trip replay: LocationHistory time-series collection + opt-in consent flow (`apps/api/src/models/LocationHistory.ts`)

**Non-Functional Requirements Coverage:**

**Performance (Sub-500ms P95 latency):**
- ✅ Redis cache-first reads (<10ms latency for active positions)
- ✅ Differential broadcasting architecture (delta payloads for 80% bandwidth reduction)
- ✅ Geographic partitioning capability (Redis GEORADIUS for proximity-based updates)
- ✅ Optimized WebSocket events (flat payloads, no nesting, 6 decimal coordinate precision)

**Reliability (>99.5% message delivery, >95% reconnect in 10s):**
- ✅ Socket.io acknowledgments in event pattern (confirm delivery)
- ✅ Exponential backoff reconnection with jitter (prevents thundering herd)
- ✅ Client-side buffering architecture (`apps/web/src/features/location/LocationBuffering.ts`)
- ✅ TTL-based presence detection (automatic ghost cleanup, no manual disconnect handling)

**Battery Efficiency (<20% drain per 2h trip):**
- ✅ Adaptive GPS polling based on motion state (stationary = GPS off, highway = 10-15s, city = 2-3s)
- ✅ Differential broadcasting for 80% bandwidth reduction (less radio usage)
- ✅ Mapbox tile caching via PWA workbox config (reduces network calls)
- ✅ Background GPS optimization strategy with battery level monitoring

**Security & Privacy:**
- ✅ JWT ephemeral sessions (24h expiration, device-bound)
- ✅ Rate limiting middleware (Redis-backed counters, per-endpoint limits)
- ✅ Zod validation at all boundaries (REST endpoints, WebSocket events, frontend forms)
- ✅ MongoDB TTL auto-deletion (ephemeral data lifecycle, DPDP Act compliance)
- ✅ CORS configuration (allowed origins per environment)

**Accessibility (WCAG 2.1 AA):**
- ✅ Tailwind glove-friendly tokens (80mm touch-min, 6mm touch-critical)
- ✅ Semantic HTML + ARIA patterns (component structure supports screen readers)
- ✅ Keyboard navigation (component focus management defined)
- ✅ Screen reader support (component accessibility requirements documented in UX spec)

**Scalability (100 concurrent trips, 2,000 riders):**
- ✅ Redis adapter for Socket.io horizontal scaling (multi-server pub/sub)
- ✅ MongoDB time-series compression (80% storage savings for location history)
- ✅ Geographic partitioning architecture (distance-based update frequency)
- ✅ Monorepo supports independent app scaling (frontend scales separately from backend)

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ All critical decisions documented with specific versions (Vite 7+, Node.js 20.19+, MongoDB 5.0+)
- ✅ Technology choices verified via 2026 web research (create-vite, Turborepo, vite-plugin-pwa)
- ✅ Hosting strategy defined with free tier options (Vercel + Railway + Atlas + Upstash)
- ✅ Fallback strategies documented (Capacitor.js if iOS PWA blocks background GPS)

**Structure Completeness:**
- ✅ Complete monorepo directory tree (134 specific files/directories explicitly listed)
- ✅ All component locations explicitly mapped (no ambiguous "feature goes somewhere" statements)
- ✅ Feature-to-file mapping for all phases (Phase 1-3 requirements mapped to specific file paths)
- ✅ Integration points fully specified with 2 complete data flow diagrams (location update, trip creation)

**Pattern Completeness:**
- ✅ 15 conflict points addressed with concrete examples (naming, structure, format, communication, process)
- ✅ Naming conventions for all layers (DB collections, API endpoints, code, Redis keys, WebSocket events)
- ✅ Format patterns with good/bad examples (errors, dates, coordinates, payloads)
- ✅ Process patterns for critical flows (error handling, loading states, reconnection with exponential backoff)
- ✅ Good examples vs anti-patterns documented for high-risk areas (WebSocket events, state updates)

### Gap Analysis Results

**✅ No Critical Gaps Found**

All blocking architectural decisions are complete and documented. AI agents can begin implementation immediately with zero architectural ambiguity.

**Minor Enhancement Opportunities (Post-MVP):**

1. **Performance Monitoring Dashboard** - Custom Grafana setup for real-time metrics visualization (defer until scale justifies, Railway provides basic metrics)
2. **Advanced Caching Strategy** - Multi-tier caching with service workers for offline map tiles (defer to Phase 4, basic PWA caching configured)
3. **CI/CD Pipeline Details** - Specific GitHub Actions workflows with test coverage, security scanning (define during first implementation story)
4. **Security Audit Checklist** - Comprehensive security review process including penetration testing (schedule before public launch)
5. **Load Testing Protocol** - Artillery or k6 scripts for 2,000 concurrent rider simulation (defer until backend implementation complete)

**Validation Issues Addressed:**

✅ **Issue:** iOS PWA background GPS uncertainty (could block core functionality)  
**Resolution:** Week 1 testing protocol defined with specific validation criteria; Capacitor.js fallback strategy documented with installation commands and timeline (Week 2-3)

✅ **Issue:** MongoDB schema for high-frequency writes (10,000 location points/second at scale)  
**Resolution:** Hybrid approach with time-series collection provides 80% compression and efficient time-range queries; current state cached in separate Rider collection for <10ms reads

✅ **Issue:** WebSocket horizontal scaling (single server bottleneck at 2,000+ riders)  
**Resolution:** Redis pub/sub adapter configured in Socket.io setup enables multi-server broadcasting; deferred until load testing proves single-server bottleneck

✅ **Issue:** State management complexity (real-time updates + server data + UI state)  
**Resolution:** Clear separation with Zustand (real-time trip state), TanStack Query (server-fetched data), and independent UI store; no cross-store dependencies

✅ **Issue:** Coordinate precision vs bandwidth trade-off  
**Resolution:** Standardized 6 decimal places (~11cm accuracy) balances precision with payload size; differential broadcasting further reduces bandwidth by 80%

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed (2,163-line PRD, 4,848-line UX spec, 268-line product brief)
- [x] Scale and complexity assessed (HIGH complexity, 15-20 major components, real-time distributed systems)
- [x] Technical constraints identified (iOS PWA limits, battery optimization, sub-500ms latency, WCAG AA)
- [x] Cross-cutting concerns mapped (10 concerns: real-time sync, battery optimization, offline-first, security, observability, accessibility, error handling, performance, platform adaptation, scalability)

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions (MongoDB 5.0+, Redis 7+, React 18+, Node.js 20.19+, TypeScript 5.x)
- [x] Technology stack fully specified (Vite 7+ with SWC, Socket.io, Mapbox GL JS v3, pnpm + Turborepo, Mongoose, ioredis)
- [x] Integration patterns defined (REST for CRUD, WebSocket for real-time, Redis adapter for scaling)
- [x] Performance considerations addressed (Redis caching, differential broadcasting, adaptive polling, time-series compression)

**✅ Implementation Patterns**

- [x] Naming conventions established (15 conflict points addressed with examples)
- [x] Structure patterns defined (feature-based frontend, layer-based backend, monorepo workspaces)
- [x] Communication patterns specified (flat payloads, snake_case events, immutable state updates, acknowledgments)
- [x] Process patterns documented (AppError class, exponential backoff, TanStack Query for loading states, batch buffer flush)

**✅ Project Structure**

- [x] Complete directory structure defined (134+ files/directories explicitly listed with full paths)
- [x] Component boundaries established (Controller → Service → Model unidirectional, store independence)
- [x] Integration points mapped (2 complete data flow diagrams: location update flow, trip creation flow)
- [x] Requirements to structure mapping complete (all 5 phases mapped to specific file paths)

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH** based on:
- Complete requirements coverage (all FRs and NFRs architecturally supported with specific implementations)
- Zero critical gaps (all blocking decisions documented with versions and commands)
- Comprehensive patterns (15 conflict points addressed with good/bad examples)
- Production-grade foundations (Redis TTL, time-series, adaptive polling, monitoring, logging built into architecture)

**Key Strengths:**

1. **Real-Time Architecture Foundation**: WebSocket + Redis TTL presence + differential broadcasting creates defensible technical moat over competitors (chat apps with location tacked on)
2. **Monorepo Organization**: Shared types eliminate interface mismatches between frontend/backend, Turborepo enables parallel development with caching
3. **Comprehensive Patterns**: 15 conflict points addressed means AI agents won't make incompatible choices (naming, structure, format, communication, process)
4. **Production-Grade from Day 1**: Monitoring (Pino + Sentry), logging (structured JSON), error tracking, and observability built into foundation (not retrofitted)
5. **Privacy-Forward Design**: Ephemeral architecture (JWT sessions, TTL auto-deletion, opt-in replay) aligns with regulatory compliance (DPDP Act, GDPR)
6. **Platform Flexibility**: PWA-first with documented Capacitor.js fallback prevents iOS restrictions from blocking launch (Week 1 testing determines path)
7. **Complete Mapping**: Every phase requirement mapped to specific files (no ambiguity for implementation)
8. **Battery Optimization as Feature**: Adaptive polling architecture (motion-state detection, velocity-based intervals) enables all-day riding without recharge

**Areas for Future Enhancement:**

1. **Horizontal Scaling Strategy**: Redis adapter configured, but load balancer and multi-server orchestration deferred until 1,000+ concurrent trips (single server handles 100 trips per performance targets)
2. **Advanced Observability**: Custom metrics dashboard and OpenTelemetry traces deferred until performance profiling needed (basic Pino + Sentry sufficient for MVP)
3. **Offline Map Tiles**: Service worker caching configured, but pre-cached corridor tiles (50MB per region) deferred to Phase 4 (network-first adequate for MVP)
4. **P2P Mesh Networking**: Bluetooth mesh fallback for dead zones (<100m proximity) deferred to Year 2+ (adds complexity, needs proof of baseline value first)
5. **Multi-Region Deployment**: Single region (India/Thailand) for MVP, geographic expansion strategy deferred until international launch justifies CDN costs

### Implementation Handoff

**AI Agent Guidelines:**

1. ✅ **Follow architectural decisions exactly** - All technology versions, hosting choices, and patterns are prescriptive (not recommendations)
2. ✅ **Use implementation patterns consistently** - Naming conventions, file organization, and code patterns are non-negotiable for system coherence
3. ✅ **Respect component boundaries** - Controller → Service → Model unidirectional flow, store independence (no cross-store dependencies)
4. ✅ **Refer to this document** - Architecture document is source of truth for all structural questions (not Stack Overflow, not personal preference)
5. ✅ **Run validation before commit** - `pnpm lint && pnpm test && pnpm type-check` enforces patterns via CI

**First Implementation Priority:**

```bash
# Step 1: Initialize monorepo
npx create-turbo@latest syncride-monorepo --package-manager pnpm
cd syncride-monorepo

# Step 2: Setup frontend (apps/web)
cd apps
pnpm create vite web --template react-swc-ts
cd web
pnpm install
pnpm add -D tailwindcss postcss autoprefixer vite-plugin-pwa workbox-window
pnpm add zustand @tanstack/react-query mapbox-gl react-router-dom
npx tailwindcss init -p

# Step 3: Setup backend (apps/api)
cd ../..
mkdir -p apps/api/src
cd apps/api
pnpm init
pnpm add express socket.io mongoose ioredis jsonwebtoken bcryptjs dotenv cors pino
pnpm add -D typescript @types/node @types/express @types/cors ts-node-dev

# Step 4: Setup shared packages
cd ../..
mkdir -p packages/shared-types/src packages/config packages/utils/src

# Step 5: Configure workspace
# Create pnpm-workspace.yaml and turbo.json

# Ready for feature development!
```

**Implementation Story Priority (Sequential):**
1. ✅ **Story 0.1**: Monorepo initialization (creates foundation, enables parallel work)
2. ✅ **Story 0.2**: Shared types package (Trip, Rider, LocationUpdate interfaces enable type-safe development)
3. ✅ **Story 1.1**: MongoDB schemas + Redis config (data layer foundation)
4. ✅ **Story 1.2**: REST API endpoints (POST /api/trips, POST /api/trips/:code/join)
5. ✅ **Story 1.3**: JWT authentication middleware (enables protected routes)
6. ✅ **Story 2.1**: WebSocket connection + basic events (join_trip, leave_trip)
7. ✅ **Story 2.2**: Frontend stores + hooks (tripStore, useWebSocket)
8. ✅ **Story 2.3**: Map components (MapView, RiderMarker with Mapbox GL JS)
9. ✅ **Story 2.4**: Real-time location updates (location_update event, Redis caching, broadcast)
10. ✅ **Story 3.1**: Adaptive GPS polling (motion detection, velocity-based intervals)
11. ✅ **Story 3.2**: SOS emergency broadcast (SOSButton, sosEvents, full-screen alert)
12. ✅ **Story 3.3**: Voice status updates (VoiceInputFAB, STT integration, predefined intents)

---
