---
stepsCompleted: [1, 2, 3, 4]
workflowStatus: 'complete'
completedAt: '2026-04-10'
inputDocuments:
  - 'c:\Users\jaykumar.sankpal\Desktop\RouteBuddies\_bmad-output\prd.md'
  - 'c:\Users\jaykumar.sankpal\Desktop\RouteBuddies\_bmad-output\planning-artifacts\architecture.md'
  - 'c:\Users\jaykumar.sankpal\Desktop\RouteBuddies\_bmad-output\planning-artifacts\ux-design-specification.md'
  - 'c:\Users\jaykumar.sankpal\Desktop\RouteBuddies\_bmad-output\prd-validation-report.md'
  - 'c:\Users\jaykumar.sankpal\Desktop\RouteBuddies\project_context.md'
  - 'c:\Users\jaykumar.sankpal\Desktop\RouteBuddies\_bmad-output\planning-artifacts\ux-design-mockup.html'
---

# RouteBuddies (SyncRide) - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SyncRide, decomposing the requirements from the PRD, UX Design Specification, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Trip Management (10 FRs):**
- FR1: Trip hosts can create ephemeral trip sessions with auto-generated 6-digit alphanumeric codes
- FR2: Trip hosts can share trip codes via system share sheet (WhatsApp, SMS, clipboard)
- FR3: Riders can join trips by entering trip code with optional display name (no signup required)
- FR4: Trip hosts can view list of all joined riders with display names and join timestamps
- FR5: Trip hosts can kick riders from active trips
- FR6: Trip hosts can expire and rotate trip codes to prevent new joins
- FR7: Trip hosts can ban device IDs from rejoining trips
- FR8: Trip hosts can end trips manually, triggering data deletion
- FR9: The system can auto-end trips after 12 hours or at 10% battery level
- FR10: Riders can leave trips voluntarily before trip end

**Real-Time Location Coordination (9 FRs):**
- FR11: Riders can share their GPS location in real-time with all trip participants
- FR12: Riders can view live location of all trip participants on synchronized map
- FR13: The system can broadcast location updates to trip participants with sub-second latency
- FR14: Riders can see visual indicators differentiating stopped vs moving riders
- FR15: The system can detect and display rider motion state (stationary, predictable, dynamic)
- FR16: The system can optimize GPS polling frequency based on rider motion state (adaptive polling)
- FR17: Riders can see last-seen timestamps for each trip participant
- FR18: The system can detect disconnected riders using location update expiration
- FR19: Riders can see visual decay indicators showing staleness of location data

**Group Awareness & Navigation (8 FRs):**
- FR20: Riders can view Group View that auto-zooms map to fit all riders in viewport
- FR21: Riders can see nearest rider distance calculated continuously and displayed with color-coding
- FR22: Riders can see group spread indicator showing maximum distance between any two riders
- FR23: Riders can access member list showing online/offline status for all participants
- FR24: Riders can tap individual riders in member list to center map on their location
- FR25: Riders can see rider avatars on map with color-coding and display name labels
- FR26: Riders can see status icons on rider avatars indicating current state (fuel, break, mechanical, emergency)
- FR27: The system can calculate and display ETA for separated riders to rejoin group

**Safety & Emergency Communication (9 FRs):**
- FR28: Riders can broadcast one-tap SOS emergency alerts to all trip participants
- FR29: Riders can access SOS button from lock screen (if platform permits)
- FR30: Riders can send voice status updates using tap-to-speak interface
- FR31: The system can transcribe voice to text using speech-to-text recognition (English + Hindi)
- FR32: Riders can send predefined status messages via large button interface ("Need gas", "Taking break", "Mechanical issue", "Medical emergency")
- FR33: Riders can receive haptic proximity alerts with distinct vibration patterns (rider ahead, falling behind, SOS received)
- FR34: Riders can share exact coordinates with support vehicles or emergency contacts
- FR35: Riders can receive push notifications for critical events when app is backgrounded (SOS, trip end)
- FR36: The system can display distraction warnings on first launch and before SOS use

**Privacy & Data Lifecycle (9 FRs):**
- FR37: Users can opt-in to location data collection with explicit consent modal
- FR38: Users can view data retention policy before joining trips
- FR39: The system can delete live location data automatically on trip end
- FR40: Users can opt-in to 7-day trip replay storage with explicit consent prompt
- FR41: Users can view and accept Terms of Service including SOS limitations and distraction disclaimers
- FR42: The system can enforce 7-day hard delete for trip replay data using database-level TTL
- FR43: Users can receive data deletion confirmation after trip end
- FR44: Users can access data subject rights (access, correction, deletion, portability) per DPDP Act
- FR45: The system can log consent events for regulatory compliance auditing

**Dead Zone Resilience (8 FRs):**
- FR46: The system can buffer location updates client-side during network loss
- FR47: Riders can see "reconnecting" status indicators during network interruptions
- FR48: The system can replay buffered location trail with animation on reconnection
- FR49: Riders can see faint dotted lines showing rider paths through dead zones
- FR50: The system can automatically reconnect using exponential backoff after network restoration
- FR51: Riders can see "last known position" indicators when other riders are disconnected
- FR52: The system can batch upload buffered coordinates when connectivity restores
- FR53: Riders can continue using app in offline mode with degraded functionality (map remains functional, updates queued)

**Post-Trip Experience (7 FRs):**
- FR54: Riders can view trip summary screen showing route map, total distance, riding time, max speed, and group stats
- FR55: Riders can opt-in to save trip replay for 7 days with explicit consent
- FR56: Riders can share trip replay link via social media or messaging apps
- FR57: Riders can complete attribution survey identifying how they heard about SyncRide
- FR58: Riders can export trip summary for social media posting
- FR59: The system can display data deletion confirmation message after trip end
- FR60: Riders can view trip history if replay storage was enabled (within 7-day window)

**Platform & Device Integration (6 FRs):**
- FR61: The system can request and manage background GPS location permission on iOS and Android
- FR62: The system can request and manage lock-screen access permission for SOS button
- FR63: The system can request and manage push notification permission
- FR64: The system can display persistent foreground service notification on Android during active trips
- FR65: The system can function as Progressive Web App with Add to Home Screen capability
- FR66: The system can detect and handle platform capability constraints (graceful degradation if PWA features unavailable)

**Accessibility & Usability (6 FRs):**
- FR67: Riders can interact with core features while wearing motorcycle gloves (6mm minimum touch targets)
- FR68: Riders can access high-contrast glance mode for improved visibility at speed
- FR69: Riders can receive audio narration of group status for hands-free awareness
- FR70: Riders can navigate interface using keyboard (desktop observer mode)
- FR71: The system can respect user's reduced motion preferences (disable animations)
- FR72: The system can provide screen reader support for observer mode users

**Total Functional Requirements:** 72 across 8 capability areas

---

### Non-Functional Requirements

**Performance (19 NFRs):**
- NFR-P1: Location coordinate broadcasts shall achieve P95 latency <500ms measured from GPS capture to WebSocket delivery across 4G/LTE/5G network classes
- NFR-P2: Location coordinate broadcasts shall achieve P99 latency <1 second to account for network jitter and edge cases
- NFR-P3: Redis geospatial queries (GEORADIUS for nearest rider calculations) shall return results in <100ms at P95
- NFR-P4: Dead zone reconnection shall complete in <5 seconds (median target: 2-3 seconds) after network restoration
- NFR-P5: WebSocket message delivery rate shall exceed 99.5% measured via client acknowledgments
- NFR-P6: First Contentful Paint (FCP) shall occur within 1.5 seconds on 4G LTE connection
- NFR-P7: Largest Contentful Paint (LCP) shall occur within 2.5 seconds on 4G LTE connection (full map loaded with markers)
- NFR-P8: Time to Interactive (TTI) shall be <3.5 seconds on 4G LTE (app fully interactive, can create/join trip)
- NFR-P9: First Input Delay (FID) shall be <100ms (tap responsiveness during initial load)
- NFR-P10: Map rendering shall maintain 60fps with hardware acceleration (no dropped frames during pan/zoom)
- NFR-P11: Zustand state updates shall complete in <100ms (optimistic UI, no render blocking)
- NFR-P12: React render time shall be <16ms per frame to maintain 60fps target
- NFR-P13: Battery drain shall not exceed 20% per 2-hour active trip on reference devices (iPhone 14, Samsung Galaxy S23)
- NFR-P14: Adaptive GPS polling shall achieve 60-80% battery savings vs fixed 5s baseline polling
- NFR-P15: If adaptive polling achieves <50% battery savings, system shall fallback to fixed 10s polling (still 50% better than WhatsApp 5s baseline)
- NFR-P16: Battery level shall be monitored continuously; polling interval increases at <30% battery, non-critical features disabled at <15% battery
- NFR-P17: Data usage shall not exceed 5MB per 2-hour trip including map tiles and location broadcasts
- NFR-P18: Differential broadcasting (post-MVP) shall achieve 70%+ bandwidth reduction compared to full coordinate payloads
- NFR-P19: Map tile caching shall reduce redundant tile downloads by 80% for frequently-ridden corridors

**Security (22 NFRs):**
- NFR-S1: All WebSocket communication shall use WSS (TLS encryption) to prevent man-in-the-middle attacks
- NFR-S2: Location data shall be transmitted with end-to-end encryption where feasible (trip-scoped ephemeral keys for post-MVP)
- NFR-S3: Stored location data (7-day replay opt-in) shall be encrypted at rest using AES-256
- NFR-S4: Database credentials and API keys shall never be exposed in client-side code or version control
- NFR-S5: JWT tokens for trip authentication shall expire after trip end and shall not be reusable across trips
- NFR-S6: Trip codes shall be cryptographically random (6-digit alphanumeric = 2.1 billion combinations, collision rate <0.01%)
- NFR-S7: Host controls (kick, ban, expire code) shall be enforced server-side with authorization checks (prevent client-side tampering)
- NFR-S8: Device IDs banned by host shall be prevented from rejoining trip via any mechanism (code rotation, new session)
- NFR-S9: Observer links (post-MVP) shall be read-only with no ability to send location updates or control trip
- NFR-S10: Live location data shall be automatically deleted from Redis within 30 seconds of trip end (TTL enforcement)
- NFR-S11: Trip replay data shall be hard-deleted from MongoDB after 7 days using database-level TTL indexes (no manual cleanup required)
- NFR-S12: No persistent location graphs or behavioral profiling shall be stored beyond trip duration (ephemeral sessions only)
- NFR-S13: Device IDs shall rotate on trip end to prevent cross-trip tracking
- NFR-S14: Aggregate analytics shall not enable re-identification of individual riders (k-anonymity: minimum 5 riders per aggregated metric)
- NFR-S15: GPS spoofing shall be detected via velocity validation (flag teleportation: >200 km/h sudden jumps without gradual acceleration)
- NFR-S16: Rate limiting shall prevent DoS attacks (max 100 location updates per minute per client IP)
- NFR-S17: Input validation shall prevent injection attacks (SQL, NoSQL, XSS) on all user-provided data (trip codes, display names, status messages)
- NFR-S18: Security vulnerabilities shall be addressed within 72 hours of discovery for critical issues, 7 days for high-severity issues
- NFR-S19: System shall comply with India DPDP Act 2023 (consent flows, data subject rights, breach notification within 72 hours)
- NFR-S20: System shall comply with GDPR (if serving EU users): right to be forgotten, data minimization, lawful basis for processing
- NFR-S21: System shall comply with Thailand PDPA (consent mechanisms, cross-border data transfer restrictions)
- NFR-S22: Consent events shall be logged for regulatory compliance auditing (timestamped, immutable audit trail)

**Scalability (12 NFRs):**
- NFR-SC1: Single Socket.io server shall handle 100 concurrent trips (2,000 riders @ 20 per trip) with <500ms P95 latency
- NFR-SC2: Redis shall handle 10,000 geospatial queries per second (GEORADIUS) with <10ms response time
- NFR-SC3: MongoDB time-series writes shall sustain 10,000 location points per second with compression enabled
- NFR-SC4: System architecture shall support horizontal scaling to 10,000+ concurrent riders via Redis cluster and Socket.io federation
- NFR-SC5: Geographic partitioning shall enable distance-based broadcast throttling (riders 50km+ apart receive 10s updates, not sub-second)
- NFR-SC6: System shall handle 10x user growth with <10% performance degradation (linear scaling target)
- NFR-SC7: System shall handle weekend traffic spikes (5x weekday baseline) without degradation
- NFR-SC8: System shall support 50-rider trips during large rally events (stress testing with synthetic riders required)
- NFR-SC9: System shall recover gracefully from traffic surges (exponential backoff, queue depth monitoring, auto-scaling triggers)
- NFR-SC10: System shall accommodate 100,000+ trip sessions per month with data retention policy (7-day TTL prevents unbounded growth)
- NFR-SC11: MongoDB storage shall scale to 1TB+ trip replay data with time-series downsampling (1s resolution for first hour, 10s for first day, 1min thereafter)
- NFR-SC12: Redis cache shall remain within memory bounds via TTL enforcement (max 10GB cache size for 10,000 concurrent riders @ 1KB per rider)

**Reliability & Availability (16 NFRs):**
- NFR-R1: System shall maintain 99.5% uptime measured monthly (max 3.6 hours downtime per month)
- NFR-R2: Planned maintenance shall occur during low-traffic windows (weekday mornings, not weekend peak riding times)
- NFR-R3: System shall send 24-hour advance notification of planned maintenance to active trip hosts
- NFR-R4: WebSocket disconnections shall trigger automatic reconnection with exponential backoff (1s → 2s → 4s → 8s) and jitter
- NFR-R5: Redis failure shall trigger fallback to direct MongoDB queries (degraded performance acceptable: <2s latency vs <100ms)
- NFR-R6: Mapbox tile loading failures shall trigger retry with exponential backoff (3 attempts before error display)
- NFR-R7: Client-side location buffering shall queue up to 1000 coordinate updates during network loss (IndexedDB storage)
- NFR-R8: MongoDB shall use replica sets (minimum 3 nodes) to prevent data loss during node failure
- NFR-R9: Trip replay data (opt-in) shall be backed up daily to prevent accidental loss during 7-day window
- NFR-R10: Redis persistence shall be enabled (AOF or RDB snapshots) to recover active trip state after server restart
- NFR-R11: System shall support automated backups with 7-day retention for MongoDB trip data
- NFR-R12: System shall have documented disaster recovery procedures with RTO (Recovery Time Objective) <4 hours
- NFR-R13: System shall have RPO (Recovery Point Objective) <15 minutes (maximum acceptable data loss)
- NFR-R14: False positive disconnect rate shall be <2% (stationary riders not incorrectly flagged as disconnected)
- NFR-R15: Trail replay accuracy shall be >90% (buffered path matches actual route within 10m median error)
- NFR-R16: Client-side buffer shall preserve location history for up to 15 minutes of network loss (sufficient for longest tunnels)

**Accessibility (15 NFRs):**
- NFR-A1: System shall comply with WCAG 2.1 Level AA contrast requirements (4.5:1 ratio for text on backgrounds)
- NFR-A2: Rider avatars shall use colorblind-safe palette (avoid red/green only differentiation, use shapes/labels)
- NFR-A3: Map UI shall remain functional at 200% browser text zoom (Level AA requirement)
- NFR-A4: High-contrast glance mode shall provide 7:1 contrast ratio (Level AAA) for improved visibility at speed
- NFR-A5: All interactive elements shall have minimum 44x44px touch targets (WCAG requirement), SyncRide targets 57px (6mm) for glove usability
- NFR-A6: Critical actions (End Trip, SOS) shall have 80x80px touch targets for glove-covered thumb activation
- NFR-A7: Glove usability testing shall achieve >90% success rate with 12mm neoprene, leather gauntlets, and winter gloves
- NFR-A8: Keyboard navigation (desktop observer mode) shall support tab order, focus indicators, and escape/enter key actions
- NFR-A9: Audio narration (voice status, group updates) shall have visual text alternatives displayed on-screen
- NFR-A10: Haptic alerts (proximity, SOS) shall have visual and audio alternatives for users with impaired vibration perception
- NFR-A11: UI patterns shall be consistent (primary action always bottom-right, destructive actions require confirmation)
- NFR-A12: Error messages shall provide clear recovery instructions ("GPS unavailable. Enable location permissions in Settings.")
- NFR-A13: Loading states shall be visible (spinner, progress indicator, not blank screen) to reduce cognitive uncertainty
- NFR-A14: Observer mode shall be fully navigable via VoiceOver (iOS) and TalkBack (Android) screen readers
- NFR-A15: ARIA labels shall be provided for map controls, member list, and status icons

**Usability (13 NFRs - Motorcycle-Specific):**
- NFR-U1: Core user flows (create trip, join trip, send voice status, trigger SOS) shall achieve >90% success rate when performed with 12mm neoprene motorcycle gloves
- NFR-U2: Voice status recognition shall achieve >85% accuracy in helmet/wind noise conditions (100 km/h sustained speed)
- NFR-U3: If voice recognition accuracy falls below 75%, system shall provide Google Cloud STT fallback or graceful degradation to large-button text input
- NFR-U4: Tap-to-speak button shall occupy bottom 1/3 of screen (thumb-accessible zone for right-handed riders with phone mounted on tank bag)
- NFR-U5: Map shall be readable at-a-glance without sustained focus (1-2 second glance while riding at 100 km/h)
- NFR-U6: Critical information (group spread, nearest rider, SOS alerts) shall use high-contrast colors (red, yellow, green) visible in direct sunlight
- NFR-U7: Avatar movement interpolation shall be smooth (no teleportation jumps) to reduce cognitive load during glances
- NFR-U8: Haptic proximity alerts shall use distinct vibration patterns recognizable without looking at screen (2 short = rider ahead, 3 long = falling behind, continuous = SOS)
- NFR-U9: Haptic patterns shall be tested for recognizability: >80% of users correctly identify alert type without visual confirmation
- NFR-U10: Audio narration shall work with helmet Bluetooth systems (Sena, Cardo intercom devices) for hands-free status updates
- NFR-U11: Voice status commands shall support natural language ("I need gas", "Taking a break") without rigid command structure
- NFR-U12: Distraction warnings shall be displayed on first launch and before SOS button first use
- NFR-U13: Non-critical notifications shall be suppressed while rider is in motion (accelerometer detection: >20 km/h = suppress)

**Integration (14 NFRs):**
- NFR-I1: Mapbox GL JS integration shall render vector tiles with hardware acceleration (WebGL) for smooth pan/zoom
- NFR-I2: Map tile loading shall fallback to MapLibre (open-source alternative) if Mapbox costs exceed budget (cost control)
- NFR-I3: Map tiles shall cache aggressively (7-day TTL, store last 3 viewed areas) to reduce bandwidth and improve offline capability
- NFR-I4: Web Speech API (browser-native) shall be primary STT provider for cost efficiency and on-device privacy
- NFR-I5: Google Cloud STT API shall be available as fallback if accuracy <75% (paid service, enhanced noise suppression)
- NFR-I6: STT shall support English and Hindi languages for India pilot market
- NFR-I7: Background GPS permission shall be requested with clear justification ("Keep your group connected during rides")
- NFR-I8: Lock-screen SOS button shall work via platform APIs if available (PWA on iOS/Android), otherwise fallback to in-app emergency button
- NFR-I9: Push notifications shall use FCM (Android) and APNs (iOS) with Service Worker for reliable delivery when app is backgrounded
- NFR-I10: Razorpay (India) and Stripe (international) integrations shall handle PCI DSS compliance (SyncRide shall not store card data)
- NFR-I11: Payment webhooks shall have 99% reliability for trip unlock (Convoy Commander features enabled on successful payment)
- NFR-I12: Failed payments shall trigger graceful degradation (user continues with free tier, premium features disabled)
- NFR-I13: Redis/WebSocket architecture patterns shall be published as open-source whitepaper to build technical community trust
- NFR-I14: API versioning shall maintain backward compatibility for WebSocket protocol (v1.0 clients can connect to v1.1 server)

**Maintainability (14 NFRs):**
- NFR-M1: TypeScript shall be used for type-safe React components and Zustand state management
- NFR-M2: ESLint with React, TypeScript, and accessibility plugins shall enforce code quality and WCAG rules
- NFR-M3: Unit test coverage shall exceed 70% for critical path code (trip creation, location broadcasting, dead zone recovery)
- NFR-M4: End-to-end tests (Playwright) shall cover all core user journeys (Trip Host, Separated Rider, Ride Leader)
- NFR-M5: CI/CD pipeline shall run tests, Lighthouse CI, and build production bundle on every PR with automatic deployment blocks if LCP >3s
- NFR-M6: Blue-green deployment shall enable zero-downtime releases with instant rollback capability
- NFR-M7: Error tracking (Sentry) shall capture frontend errors with React error boundaries and unhandled promise rejections
- NFR-M8: Performance monitoring (Datadog RUM) shall track real user metrics (LCP, FID, CLS) in production
- NFR-M9: Semantic versioning shall be used (v1.0.0 for MVP, v1.1.0 for minor features, v2.0.0 for breaking changes)
- NFR-M10: Release notes shall be user-facing (new features, bug fixes, performance improvements) and published on every deployment
- NFR-M11: WebSocket protocol versioning shall maintain backward compatibility for 3 minor versions (e.g., v1.0 clients supported until v1.4 release)
- NFR-M12: API documentation shall be auto-generated from OpenAPI spec for WebSocket endpoints
- NFR-M13: Architecture decision records (ADRs) shall document major technical decisions (why Redis TTL, why adaptive polling, why PWA-first)
- NFR-M14: Onboarding documentation shall enable new engineers to run development environment within 30 minutes

**Total Non-Functional Requirements:** 119 across 8 quality attribute categories

---

### Additional Requirements (Architecture)

**Project Infrastructure & Setup:**
- ARCH-1: Initialize monorepo structure with pnpm workspaces and Turborepo for task orchestration
- ARCH-2: Create frontend app structure using Vite + React + TypeScript + Tailwind CSS with SWC compiler
- ARCH-3: Create backend API structure with Node.js + Express + Socket.io + TypeScript
- ARCH-4: Setup shared TypeScript types package for location coordinates, trip session state, WebSocket events
- ARCH-5: Setup shared utilities package for coordinate math, validation functions
- ARCH-6: Configure ESLint and Prettier with shared config for consistency across packages

**Database & Caching:**
- ARCH-7: Setup MongoDB Atlas connection with Mongoose ODM and time-series collection configuration
- ARCH-8: Implement MongoDB schemas for Trip, Rider, Location (time-series), TripReplay with TTL indexes
- ARCH-9: Setup Upstash Redis connection with ioredis client for location caching and presence detection
- ARCH-10: Implement Redis TTL-based presence system (30-second expiration for live location data)
- ARCH-11: Configure Redis geospatial indexing (GEOADD, GEORADIUS) for proximity calculations

**Backend Core Infrastructure:**
- ARCH-12: Setup WebSocket server with Socket.io and Redis adapter for horizontal scaling
- ARCH-13: Implement JWT-based trip session authentication with token generation and validation
- ARCH-14: Create WebSocket event handlers (trip:join, trip:leave, location:update, sos:broadcast)
- ARCH-15: Implement location broadcasting system with differential update support
- ARCH-16: Setup CORS configuration with allowed origins from environment variables

**Frontend Core Infrastructure:**
- ARCH-17: Configure Vite PWA plugin with service worker for offline capability and Add to Home Screen
- ARCH-18: Integrate Mapbox GL JS with token configuration and custom style setup
- ARCH-19: Setup Zustand stores for trip state, location state, UI state management
- ARCH-20: Setup TanStack Query for server state management and caching
- ARCH-21: Implement WebSocket client connection with auto-reconnection logic (exponential backoff with jitter)

**Deployment & Environment:**
- ARCH-22: Configure Vercel deployment for React PWA frontend with preview deployments per PR
- ARCH-23: Configure Railway deployment for Node.js backend with auto-scaling
- ARCH-24: Setup environment variables with Zod validation schema for type-safe configuration
- ARCH-25: Create .env.example template with all required environment variables documented

**Monitoring & Logging:**
- ARCH-26: Integrate Pino structured logging for backend with JSON output in production
- ARCH-27: Integrate Sentry error tracking for both frontend (React error boundaries) and backend
- ARCH-28: Setup custom metrics tracking (WebSocket latency P95, Redis cache hit rate, active trips, total riders)

**CI/CD:**
- ARCH-29: Setup GitHub Actions CI pipeline with lint, type-check, test, build steps
- ARCH-30: Configure Lighthouse CI for performance monitoring with LCP threshold enforcement (<2.5s)
- ARCH-31: Implement blue-green deployment strategy with zero-downtime releases

---

### UX Design Requirements

**Design System Foundation:**
- UX-DR1: Implement Tailwind CSS design system with custom configuration (colors, spacing, typography)
- UX-DR2: Define and implement design tokens in tailwind.config.js (glove-friendly spacing, glance mode typography, high-contrast color palette)
- UX-DR3: Integrate Shadcn/UI component library with copy-paste approach for customizable base components
- UX-DR4: Configure Radix UI primitives for accessible interaction patterns (focus management, ARIA attributes, keyboard navigation)

**Color System:**
- UX-DR5: Implement high-contrast color palette with glance mode colors (black/white base, green/yellow/red status indicators)
- UX-DR6: Implement colorblind-safe differentiation using shapes and labels in addition to colors
- UX-DR7: Ensure all text meets WCAG 2.1 Level AA contrast ratio (4.5:1 minimum, 7:1 for glance mode)

**Typography System:**
- UX-DR8: Implement responsive typography scale with glance mode sizes (2rem, 3rem, 4rem for progressive emphasis)
- UX-DR9: Configure rem-based sizing to support 200% browser zoom without layout breakage
- UX-DR10: Implement Inter font family for standard mode, system fonts for glance mode (performance optimization)

**Spacing & Layout:**
- UX-DR11: Implement glove-friendly spacing scale with custom tokens (touch-min: 80px, touch-lg: 120px, touch-xl: 160px)
- UX-DR12: Configure mobile-first layout with full-screen map and bottom overlay architecture
- UX-DR13: Implement responsive breakpoints (mobile <768px, tablet 768-1023px, desktop 1024px+)

**Custom Component Development:**
- UX-DR14: Develop RiderMarker component with status ring animation (live/stale/disconnected/SOS states)
- UX-DR15: Develop VoiceInputFAB component with tap-to-speak interface and recording states
- UX-DR16: Develop SOSButton component with long-press activation and expanded state (bottom-third takeover)
- UX-DR17: Develop BottomStatusBar component with nearest rider display and glance mode adaptive sizing
- UX-DR18: Develop TripCodeDisplay component with large monospace code, QR code, and share options
- UX-DR19: Develop ConnectionStatusBanner component with reconnection progress and retry indicators
- UX-DR20: Develop MemberListSheet component with swipeable bottom drawer and 80px touch targets per rider
- UX-DR21: Develop ConfirmationDialog component with giant buttons (120px primary, 80px secondary) and haptic feedback

**Shadcn Component Customization:**
- UX-DR22: Customize Sheet component for member list with adjusted backdrop opacity and increased touch target heights
- UX-DR23: Customize Dialog component for confirmations with giant buttons and haptic feedback on show
- UX-DR24: Customize Button component with glove-friendly default sizes and active:scale-95 feedback
- UX-DR25: Customize Toast component with increased font size (1.125rem) and haptic pulse on show
- UX-DR26: Customize Input component with 80px height, large text (1.5rem), and voice-to-text icon addon

**Responsive Design Implementation:**
- UX-DR27: Implement mobile rider view with full-screen map, bottom status bar (15vh standard / 25vh glance), and FABs in bottom corners
- UX-DR28: Implement tablet split-view with map (66% left) and persistent member list sidebar (34% right)
- UX-DR29: Implement desktop management view with map (60%) and enhanced sidebar (40%) including trip statistics and settings
- UX-DR30: Implement portrait/landscape orientation handling for mobile (status bar shrinks to 10vh in landscape)

**Accessibility Implementation:**
- UX-DR31: Implement keyboard navigation with logical tab order (map → bottom bar → FABs → sheets)
- UX-DR32: Implement visible focus indicators (2px solid blue ring with 2px offset) on all interactive elements
- UX-DR33: Implement ARIA labels for map controls, member list, status icons, and custom components
- UX-DR34: Implement screen reader support for observer mode with VoiceOver (iOS) and TalkBack (Android) compatibility
- UX-DR35: Implement focus trap management for modals with ESC key escape functionality

**Motion-State Adaptive UI (Glance Mode):**
- UX-DR36: Implement motion-state detection using accelerometer and GPS velocity data
- UX-DR37: Implement glance mode conditional styling (large text, minimal info, high contrast, giant touch targets)
- UX-DR38: Implement manual glance mode toggle override in settings for accessibility
- UX-DR39: Implement smooth transitions between detail mode and glance mode (300ms fade)

**Haptic Feedback System:**
- UX-DR40: Implement haptic feedback patterns for proximity alerts (2 short pulses = rider ahead, 3 long = falling behind, continuous = SOS)
- UX-DR41: Implement haptic confirmation feedback for button interactions (single pulse on tap, double pulse on success)
- UX-DR42: Implement visual alternatives for haptic patterns for users with impaired vibration perception

**Animation & Transitions:**
- UX-DR43: Implement rider marker animations (green pulse for live, yellow fade for stale, scale pulse for SOS)
- UX-DR44: Implement smooth avatar movement interpolation on map (no teleportation jumps)
- UX-DR45: Implement bottom sheet slide-up animation with swipe gesture support
- UX-DR46: Implement respect for prefers-reduced-motion user preference (disable animations when set)

**Interactive States & Feedback:**
- UX-DR47: Implement loading states with visible spinners/progress indicators for all async operations
- UX-DR48: Implement error states with clear recovery instructions and retry buttons
- UX-DR49: Implement empty states with actionable guidance (e.g., "No riders yet. Share your trip code.")
- UX-DR50: Implement success confirmation feedback (toasts, checkmarks, haptics) for completed actions

**Total UX Design Requirements:** 50 specific implementation requirements

---

## Epic 1: Foundation & Development Environment

**Goal:** Establish the complete technical foundation and design system that enables all future development, including monorepo structure, database infrastructure, WebSocket architecture, deployment pipeline, and design token system.

**User Outcome:** Development team can build and deploy SyncRide features with proper tooling, infrastructure, monitoring, and design system in place.

---

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

---

## Epic 2: Trip Creation & Joining

**Goal:** Enable users to create ephemeral trip sessions, share trip codes via multiple channels, and join existing trips with proper consent flows and platform permissions.

**User Outcome:** Users can create trips, share trip codes (WhatsApp/SMS/clipboard), and join groups within seconds with zero signup friction while understanding data collection and retention policies.

---

### Story 2.1: Create Trip Session with Auto-Generated 6-Digit Code

As a **trip host**,
I want **to create a new trip with an automatically generated 6-digit alphanumeric code**,
So that **I can quickly start a trip and share the code with my riding group**.

**Acceptance Criteria:**

**Given** I am on the SyncRide home screen
**When** I tap the "Create Trip" button
**Then** the backend generates a cryptographically random 6-digit alphanumeric code (uppercase A-Z, 0-9)
**And** the trip is saved to MongoDB with:
  - `tripCode`: generated code
  - `hostId`: my device ID
  - `createdAt`: current timestamp
  - `status`: 'active'
  - `riders`: array containing my rider object
**And** the trip code is added to Redis with TTL of 12 hours
**And** I am redirected to the trip screen showing the trip code prominently
**And** the trip code is displayed in large monospace font (3rem size) with letter-spacing
**And** a visual confirmation appears: "Trip created successfully"

**Requirements Fulfilled:** FR1, NFR-S6 (2.1 billion combinations, <0.01% collision rate)

---

### Story 2.2: Display Trip Code with Share Options

As a **trip host**,
I want **to see the trip code with easy sharing options (WhatsApp, SMS, copy to clipboard)**,
So that **I can quickly share the code with my group through their preferred channel**.

**Acceptance Criteria:**

**Given** I have created a trip (Story 2.1)
**When** I view the trip code screen
**Then** the TripCodeDisplay component renders with:
  - Trip code in large monospace text (3rem, letter-spacing 0.25em)
  - Three share buttons: WhatsApp, SMS, Copy (each 80x80px)
  - QR code below the trip code (scannable, 200x200px)
**And** tapping the trip code itself copies it to clipboard
**And** a "Copied!" toast appears for 1 second after copying
**And** tapping WhatsApp opens share sheet with pre-filled message: "Join my SyncRide trip: [CODE]"
**And** tapping SMS opens SMS composer with pre-filled message
**And** tapping Copy copies the code to clipboard with haptic feedback (single pulse)
**And** all share buttons have visible focus indicators for accessibility
**And** the component meets minimum touch target size (80x80px per button)

**Requirements Fulfilled:** FR2, UX-DR18, UX-DR24, NFR-A5

---

### Story 2.3: Join Trip by Entering Trip Code

As a **rider**,
I want **to join an existing trip by entering a 6-digit code**,
So that **I can connect to my group without creating an account**.

**Acceptance Criteria:**

**Given** I am on the SyncRide home screen
**When** I tap "Join Trip" button
**Then** a bottom sheet slides up with a trip code input form
**And** the input field is styled with:
  - Height: 80px (glove-friendly)
  - Font size: 1.5rem
  - Uppercase transformation (auto-converts to uppercase)
  - Max length: 6 characters
**And** I can enter the trip code using keyboard or voice-to-text icon
**When** I enter all 6 characters
**Then** the "Join" button becomes enabled (disabled until 6 characters entered)
**When** I tap "Join" with a valid trip code
**Then** the backend validates the trip code exists and is active
**And** I am added to the trip's riders array in MongoDB
**And** my rider object is saved with: `riderId`, `displayName` (default "Rider N"), `joinedAt`, `isHost: false`
**And** I am redirected to the live map screen showing all riders
**And** a success toast appears: "Joined trip successfully"
**When** I tap "Join" with an invalid trip code
**Then** an error message displays: "Trip code not found. Check code and try again."
**And** the input field shows red border with error state
**And** the input field is cleared and refocused for retry

**Requirements Fulfilled:** FR3, UX-DR26, NFR-A12 (clear error messages)

---

### Story 2.4: Display Optional Display Name Entry on Join

As a **rider**,
I want **to optionally provide a display name when joining a trip**,
So that **other riders can identify me instead of seeing "Rider N"**.

**Acceptance Criteria:**

**Given** I am on the trip join screen (Story 2.3)
**When** I enter a valid trip code
**Then** an optional display name input field appears below the code input
**And** the display name field shows placeholder text: "Your name (optional)"
**And** the display name field has the same glove-friendly styling (80px height, 1.5rem font)
**And** the display name has a max length of 30 characters
**When** I provide a display name and join
**Then** my rider object saves with the custom display name
**And** other riders see my custom name instead of "Rider N"
**When** I don't provide a display name
**Then** my rider object saves with auto-generated name "Rider N" (where N is join order number)
**And** input validation prevents empty whitespace-only names
**And** input validation sanitizes HTML/script tags from display name (XSS prevention)

**Requirements Fulfilled:** FR3, NFR-S17 (input validation for XSS prevention)

---

### Story 2.5: Display Terms of Service and Consent Modal on First Launch

As a **user**,
I want **to view and accept Terms of Service including SOS limitations and data collection consent**,
So that **I understand how my data is used and the app's safety disclaimers before using it**.

**Acceptance Criteria:**

**Given** I am launching SyncRide for the first time
**When** the app loads
**Then** a full-screen modal appears before showing the home screen
**And** the modal displays:
  - Header: "Welcome to SyncRide"
  - Terms of Service section with scrollable content
  - SOS limitations disclaimer highlighted in yellow
  - Distraction warning highlighted in red
  - Data collection policy with clear retention timelines
**And** the modal includes two checkboxes (both required):
  - "I agree to the Terms of Service and understand SOS limitations"
  - "I consent to location data collection for trip coordination"
**And** both checkboxes must be checked to enable "Continue" button
**And** "Continue" button is 120px tall with primary styling (glove-friendly)
**And** tapping "Continue" with accepted terms:
  - Saves consent timestamp to localStorage
  - Closes modal and shows home screen
**And** tapping "Learn More" links open detailed policy pages
**And** on subsequent launches, if consent is already saved, modal does not appear
**And** consent can be reviewed later in Settings

**Requirements Fulfilled:** FR41, FR37, FR38

---

### Story 2.6: Request Background GPS Location Permission

As a **user**,
I want **the app to request background GPS location permission with clear justification**,
So that **I understand why this permission is needed and can make an informed decision**.

**Acceptance Criteria:**

**Given** I have accepted Terms of Service (Story 2.5)
**When** I create or join my first trip
**Then** a permission request dialog appears with justification text:
  - "Keep your group connected during rides"
  - "SyncRide needs background location access to share your position even when the app is minimized"
**And** the dialog shows the browser/OS native permission prompt
**When** I grant the permission
**Then** the permission status is saved to app state
**And** background location tracking is enabled
**And** I proceed to the trip screen
**When** I deny the permission
**Then** a warning message displays: "Background location is required for real-time coordination"
**And** a "Settings" button appears to open device location settings
**And** the app shows limited functionality mode (can view but not share location)
**And** a persistent banner shows: "Enable location to share your position with your group"

**Requirements Fulfilled:** FR61, NFR-I7 (clear justification)

---

### Story 2.7: Request Lock-Screen Access Permission for SOS Button

As a **user**,
I want **the app to request lock-screen access permission**,
So that **I can trigger SOS from my lock screen during emergencies**.

**Acceptance Criteria:**

**Given** I have granted background GPS permission (Story 2.6)
**When** the app requests lock-screen access
**Then** a custom modal appears explaining the feature:
  - "Quick SOS Access from Lock Screen"
  - "Activate emergency alerts without unlocking your phone"
  - Note: "This feature may not be available on all devices"
**And** the modal includes "Enable" and "Skip" buttons (both 80px tall)
**When** I tap "Enable"
**Then** the app attempts to register lock-screen SOS via platform API
**And** if successful, shows confirmation: "Lock-screen SOS enabled"
**And** if platform doesn't support it, shows message: "Lock-screen access not available on this device. SOS will be available in-app."
**When** I tap "Skip"
**Then** the modal closes and SOS remains available as in-app button only
**And** the permission request doesn't appear again
**And** I can enable it later from Settings

**Requirements Fulfilled:** FR62, NFR-I8 (platform API fallback)

---

### Story 2.8: Request Push Notification Permission

As a **user**,
I want **the app to request push notification permission**,
So that **I receive critical alerts (SOS, trip end) even when the app is backgrounded**.

**Acceptance Criteria:**

**Given** I have completed previous permission requests
**When** the app requests push notification permission
**Then** a custom modal appears explaining:
  - "Stay Alert to Critical Events"
  - "Receive notifications for SOS alerts and trip updates"
  - "You can customize notification preferences in Settings"
**And** the modal includes "Enable" and "Not Now" buttons
**When** I tap "Enable"
**Then** the browser/OS native notification permission prompt appears
**And** if granted, FCM (Android) or APNs (iOS) registration occurs
**And** notification token is saved to backend for this device
**And** a confirmation message appears: "Notifications enabled"
**When** I tap "Not Now"
**Then** the modal closes without requesting permission
**And** a settings option remains available to enable later
**And** in-app alerts remain functional even without notification permission

**Requirements Fulfilled:** FR63, NFR-I9 (FCM/APNs integration)

---

### Story 2.9: Detect PWA Capability and Show Add to Home Screen Prompt

As a **user**,
I want **to add SyncRide to my home screen as a PWA**,
So that **it feels like a native app with quick access from my home screen**.

**Acceptance Criteria:**

**Given** I am using a browser that supports PWA
**When** I have used the app for 30 seconds or created/joined my first trip
**Then** a custom "Add to Home Screen" prompt appears as a bottom sheet
**And** the prompt shows:
  - App icon and name "SyncRide"
  - Benefits: "Quick access, works offline, no app store needed"
  - "Add to Home Screen" button (120px tall)
  - "Not Now" link
**When** I tap "Add to Home Screen"
**Then** the browser's native install prompt triggers
**And** after installation, the app launches in standalone mode (no browser chrome)
**And** the PWA manifest is correctly applied (theme color, icons, display mode)
**When** I tap "Not Now"
**Then** the prompt dismisses and doesn't reappear for 7 days
**When** my browser doesn't support PWA
**Then** no prompt appears, but app remains functional as web app
**And** a subtle banner shows: "For best experience, use Chrome/Safari"

**Requirements Fulfilled:** FR65, FR66 (graceful degradation)

---

### Story 2.10: Handle Platform Capability Detection and Graceful Degradation

As a **developer**,
I want **platform capability detection for PWA features (service worker, background sync, notifications)**,
So that **the app degrades gracefully on platforms with limited PWA support**.

**Acceptance Criteria:**

**Given** the app is running on any platform
**When** the app initializes
**Then** capability checks are performed:
  - Service Worker API availability
  - Background Sync API availability
  - Notification API availability
  - Geolocation API availability
  - Vibration API availability (for haptic feedback)
**And** capability results are stored in app state/context
**And** feature availability is displayed in Settings → About
**When** a feature is unavailable
**Then** UI for that feature shows "Not available on this device" message
**And** alternative functionality is provided where possible:
  - No service worker → no offline mode, but app still functions online
  - No background sync → manual retry for failed requests
  - No notifications → in-app alerts only
  - No vibration → visual-only feedback
**And** the app logs capability info to Sentry for analytics
**And** no JavaScript errors occur due to missing APIs

**Requirements Fulfilled:** FR66, NFR-I8 (graceful fallback)

---

### Story 2.11: Display Persistent Foreground Service Notification on Android

As an **Android user**,
I want **a persistent foreground service notification while a trip is active**,
So that **I know the app is tracking my location and Android doesn't kill the background process**.

**Acceptance Criteria:**

**Given** I am on Android and have joined/created a trip
**When** location tracking starts
**Then** a persistent notification appears in the notification shade
**And** the notification displays:
  - Icon: SyncRide logo
  - Title: "Trip Active"
  - Text: "Sharing location with your group"
  - Action buttons: "View Trip", "End Trip"
**And** the notification is non-dismissible while trip is active
**And** tapping the notification opens the app to the trip screen
**And** tapping "End Trip" button shows confirmation dialog
**When** I leave or end the trip
**Then** the persistent notification is removed
**And** a regular dismissible notification appears: "Trip ended. Data deleted."
**When** I am on iOS or desktop
**Then** no persistent notification appears (Android-specific)

**Requirements Fulfilled:** FR64

---

## Epic 2 Summary

**Stories Created:** 11
**Requirements Covered:**
- FRs: FR1, FR2, FR3, FR37, FR38, FR41, FR61, FR62, FR63, FR64, FR65, FR66 (12 FRs - includes FR64 which was in the epic)
- UX Design: UX-DR18, UX-DR24, UX-DR26, UX-DR27
- NFRs: NFR-A5, NFR-A12, NFR-I7, NFR-I8, NFR-I9, NFR-S6, NFR-S17

**Epic 2 Status:** ✅ Complete

---

## Epic 3: Real-Time Location Sharing & Map Visualization

**Goal:** Implement the core value proposition - real-time location broadcasting with sub-500ms P95 latency and synchronized map visualization with live rider positions.

**User Outcome:** Users can share GPS location in real-time and view all trip participants on a live map with smooth animations, motion state detection, and connection status indicators.

---

### Story 3.1: Capture GPS Location with Geolocation API

As a **rider**,
I want **my GPS location captured continuously during an active trip**,
So that **my position is shared with my group in real-time**.

**Acceptance Criteria:**

**Given** I have joined a trip and granted location permission
**When** the trip starts
**Then** the app initializes Geolocation API with watchPosition
**And** location options are configured:
  - `enableHighAccuracy: true` (use GPS instead of network)
  - `maximumAge: 0` (always fresh coordinates)
  - `timeout: 5000ms` (5-second timeout per reading)
**And** successful position callbacks capture:
  - `latitude`, `longitude` (6 decimal places precision)
  - `accuracy` (in meters)
  - `heading` (compass direction if available)
  - `speed` (in m/s if available)
  - `timestamp` (device time)
**When** location is successfully captured
**Then** the LocationUpdate object is created with coordinates, accuracy, heading, speed, timestamp
**And** the location is queued for broadcast to backend via WebSocket
**When** location capture fails (GPS unavailable, permission denied)
**Then** an error event is logged to Sentry
**And** a status indicator shows: "GPS unavailable"
**And** the app continues attempting to capture with exponential backoff (5s → 10s → 20s)

**Requirements Fulfilled:** FR11, FR61

---

### Story 3.2: Establish WebSocket Connection for Real-Time Communication

As a **rider**,
I want **a WebSocket connection established between my device and the backend**,
So that **location updates can be broadcast with sub-second latency**.

**Acceptance Criteria:**

**Given** I have joined a trip
**When** the trip screen loads
**Then** a WebSocket connection is initiated to the backend server
**And** connection URL uses WSS protocol (TLS encryption): `wss://api.syncride.com/socket.io`
**And** connection includes authentication with JWT token in handshake
**And** Socket.io client is configured with:
  - `reconnection: true` (auto-reconnect on disconnect)
  - `reconnectionDelay: 1000` (start at 1 second)
  - `reconnectionDelayMax: 8000` (max 8 seconds)
  - `reconnectionAttempts: 5` (try 5 times before giving up)
**When** connection is successful
**Then** `connected` event fires and connection status shows "Connected"
**And** client emits `trip:join` event with `{ tripCode, riderId, displayName }`
**And** server acknowledges join with current trip state (all riders)
**When** connection fails
**Then** `connect_error` event fires
**And** connection status shows "Connecting..."
**And** automatic reconnection attempts with exponential backoff
**When** connection is lost during trip
**Then** `disconnect` event fires
**And** status banner shows: "Reconnecting... attempt N/5"
**And** buffered location updates queue client-side (Story 7.1)

**Requirements Fulfilled:** FR13, NFR-S1 (WSS encryption), NFR-R4 (exponential backoff)

---

### Story 3.3: Broadcast Location Updates via WebSocket

As a **rider**,
I want **my location updates broadcast to all trip participants via WebSocket**,
So that **my group can see my position in near real-time**.

**Acceptance Criteria:**

**Given** I have an active WebSocket connection and GPS location
**When** a new location is captured (Story 3.1)
**Then** the LocationUpdate is emitted via Socket.io: `socket.emit('location:update', locationPayload)`
**And** the payload includes:
  - `tripCode`: current trip code
  - `riderId`: my device/rider ID
  - `coordinates`: { latitude, longitude, accuracy }
  - `motionState`: 'stationary' | 'predictable' | 'dynamic' (from Story 3.5)
  - `heading`: compass direction (if available)
  - `speed`: current speed in m/s (if available)
  - `timestamp`: ISO 8601 timestamp
**And** the emit includes a client acknowledgment callback
**When** server acknowledges receipt within 500ms
**Then** the update is considered delivered successfully
**And** no retry is needed
**When** server doesn't acknowledge within 500ms
**Then** the update is queued for retry
**And** retry occurs after 1 second with same payload
**And** after 3 failed attempts, the update is added to offline buffer (Story 7.1)
**And** latency is measured (timestamp diff) and logged for monitoring

**Requirements Fulfilled:** FR13, NFR-P1 (P95 latency <500ms), NFR-P5 (>99.5% delivery rate)

---

### Story 3.4: Receive and Process Location Updates from Other Riders

As a **rider**,
I want **to receive location updates from other trip participants**,
So that **I can see their current positions on the map**.

**Acceptance Criteria:**

**Given** I am connected to the trip WebSocket
**When** another rider broadcasts their location (Story 3.3)
**Then** my client receives `location:update` event from server
**And** the event payload includes the other rider's:
  - `riderId`
  - `coordinates` (latitude, longitude, accuracy)
  - `motionState`
  - `heading`
  - `speed`
  - `timestamp`
**And** the location is validated:
  - Coordinates are within valid ranges (lat: -90 to 90, lng: -180 to 180)
  - Accuracy is reasonable (<100m preferred, <500m acceptable)
  - Timestamp is recent (not older than 60 seconds)
**When** validation passes
**Then** the rider's location is updated in Zustand location store
**And** the rider's marker is updated on the Mapbox map
**And** the rider's last-seen timestamp is updated
**When** validation fails
**Then** the update is ignored and error is logged
**And** the rider's previous location remains displayed
**And** no map update occurs

**Requirements Fulfilled:** FR12, FR13

---

### Story 3.5: Implement Motion State Detection (Stationary, Predictable, Dynamic)

As a **rider**,
I want **my motion state automatically detected based on GPS speed and heading changes**,
So that **adaptive GPS polling can optimize battery life based on my riding pattern**.

**Acceptance Criteria:**

**Given** I have GPS location data with speed and heading
**When** the app analyzes my recent location history (last 5 readings)
**Then** motion state is calculated using these rules:
  - **Stationary**: speed < 2 m/s for last 30 seconds → GPS pauses
  - **Predictable**: speed constant (±5 km/h variance) and heading stable (±10° variance) → GPS polling every 10-15 seconds
  - **Dynamic**: speed varying >5 km/h or heading changing >10° → GPS polling every 2-3 seconds
**And** motion state transitions include debouncing (3 consecutive readings before state change)
**And** current motion state is included in every location broadcast
**When** I transition from stationary to moving
**Then** GPS resumes within 2 seconds
**And** first location after resume is broadcast immediately
**When** I transition from dynamic to predictable (highway riding)
**Then** GPS polling interval increases to 10-15 seconds after 30 seconds of stable speed
**And** battery savings are reflected in system usage stats

**Requirements Fulfilled:** FR15, FR16, NFR-P14 (60-80% battery savings), NFR-P15 (fallback if <50% savings)

---

### Story 3.6: Integrate Mapbox GL JS with Custom Style

As a **developer**,
I want **Mapbox GL JS integrated with a custom dark map style**,
So that **riders can view locations on a high-contrast map optimized for outdoor visibility**.

**Acceptance Criteria:**

**Given** the frontend app exists with design system (Epic 1)
**When** the trip screen loads
**Then** Mapbox GL JS is initialized with:
  - Access token from `VITE_MAPBOX_TOKEN` environment variable
  - Container: full-viewport div (`#map`)
  - Style: Mapbox Dark (`mapbox://styles/mapbox/dark-v11`)
  - Initial center: user's current location
  - Initial zoom: 13 (city-level view)
  - Pitch: 0 (flat view)
  - Bearing: 0 (north-up orientation)
**And** map controls are added:
  - NavigationControl (zoom +/-, compass) - positioned top-right
  - GeolocateControl (center on user) - positioned top-right
  - ScaleControl (distance scale) - positioned bottom-left
**And** map interactions are configured:
  - `touchZoomRotate: true` (pinch to zoom, two-finger rotate)
  - `dragPan: true` (single-finger drag)
  - `scrollZoom: false` (prevent accidental zoom while scrolling)
**And** map loads within 2 seconds on 4G connection
**And** WebGL hardware acceleration is enabled for smooth 60fps rendering

**Requirements Fulfilled:** ARCH-18, NFR-I1 (WebGL hardware acceleration), NFR-P7 (LCP <2.5s)

---

### Story 3.7: Render Rider Markers on Map with Status Rings

As a **rider**,
I want **to see all trip participants as markers on the map with color-coded status rings**,
So that **I can quickly identify who's live, stale, or disconnected at a glance**.

**Acceptance Criteria:**

**Given** the Mapbox map is initialized (Story 3.6) and I have received location updates (Story 3.4)
**When** rider locations are available
**Then** RiderMarker components are rendered for each rider on the map
**And** each marker displays:
  - Base circle: 60px diameter with rider initials (first 2 characters of display name)
  - Status ring: 4px stroke around circle edge
  - Heading indicator: small arrow/wedge showing direction (only if speed >5 km/h)
**And** status ring colors indicate connection health:
  - **Live (Green)**: Last update <10 seconds ago, animated pulse (scale 100% → 105% → 100%, 1s cycle)
  - **Stale (Yellow)**: Last update 10-30 seconds ago, fade animation (opacity 1.0 → 0.6 → 1.0, 2s cycle)
  - **Disconnected (Red)**: Last update >30 seconds ago, solid red, timestamp overlay "Last seen Xs ago"
**And** my own marker (self) is blue pulsing dot without status ring (always "live")
**And** marker tap target is 100px diameter (60px visual + 20px invisible padding)
**When** I tap a rider marker
**Then** the map centers on that rider with smooth animation (500ms)
**And** the marker scales to 110% for 300ms as visual feedback

**Requirements Fulfilled:** FR25, FR14, UX-DR14, UX-DR43

---

### Story 3.8: Implement Smooth Avatar Movement Interpolation

As a **rider**,
I want **rider markers to move smoothly between location updates**,
So that **I don't see teleportation jumps that are disorienting during quick glances**.

**Acceptance Criteria:**

**Given** rider markers are rendered on the map (Story 3.7)
**When** a new location update arrives for a rider
**Then** instead of instantly jumping to new position, marker animates smoothly:
  - Duration: calculated based on time between updates (typically 200-500ms)
  - Easing: linear for constant speed, ease-out for deceleration
  - Path: straight line between old and new coordinates
**And** heading indicator rotates smoothly to new direction
**And** if distance between updates >100m (potential GPS jump), marker teleports instantly to avoid slow animation
**And** animation is cancelled if a newer update arrives mid-animation
**And** animation maintains 60fps throughout the transition
**And** no visual jitter or stuttering occurs during map pan/zoom

**Requirements Fulfilled:** FR14, UX-DR44, NFR-U7 (smooth interpolation), NFR-P10 (60fps rendering)

---

### Story 3.9: Implement Group View Auto-Zoom

As a **rider**,
I want **to tap a "Group View" button that auto-zooms the map to fit all riders**,
So that **I can see my entire group's spatial distribution at a glance**.

**Acceptance Criteria:**

**Given** multiple riders are active on the trip
**When** I tap the "Group View" FAB button (positioned top-right, below navigation controls)
**Then** the map calculates bounding box containing all rider positions
**And** map animates to fit all riders in viewport with:
  - Padding: 80px on all sides (ensures markers aren't at edge)
  - Duration: 1 second smooth animation
  - Easing: ease-in-out curve
  - Max zoom: 18 (prevents excessive zoom if riders are very close)
  - Min zoom: 8 (prevents excessive zoom-out if riders are very far)
**And** after animation completes, map remains interactive (can pan/zoom manually)
**When** riders are moving and positions update
**Then** Group View doesn't auto-update (requires manual re-tap)
**And** a subtle indicator shows "Group View active - tap again to refresh"
**When** I am the only rider in the trip
**Then** "Group View" button is hidden (no need for group framing with 1 rider)

**Requirements Fulfilled:** FR20

---

### Story 3.10: Display Last-Seen Timestamps for Riders

As a **rider**,
I want **to see last-seen timestamps for each trip participant**,
So that **I know how current their location data is**.

**Acceptance Criteria:**

**Given** riders are displayed on the map with status rings (Story 3.7)
**When** a rider's last update is >30 seconds old (disconnected state)
**Then** a timestamp overlay appears near their marker:
  - Format: "Last seen Xs ago" or "Last seen Xm ago"
  - Style: small text (0.875rem), semi-transparent dark background, white text
  - Position: below the marker avatar
  - Updates every 5 seconds to reflect increasing time
**When** a rider reconnects and sends a new update
**Then** the timestamp overlay is removed
**And** status ring transitions from red (disconnected) to green (live) with animation
**And** marker scales briefly (110% for 300ms) to indicate reconnection
**When** hovering/tapping a marker (any state)
**Then** a tooltip shows detailed connection info:
  - Display name
  - Last update: "X seconds ago" or "Live"
  - Accuracy: "±Xm"
  - Speed: "X km/h" (if available)

**Requirements Fulfilled:** FR17, FR18

---

### Story 3.11: Implement Connection Status Detection with Visual Decay

As a **rider**,
I want **visual decay indicators showing staleness of location data**,
So that **I can differentiate between live, slightly delayed, and disconnected riders**.

**Acceptance Criteria:**

**Given** riders are displayed with status rings (Story 3.7)
**When** time since last update increases
**Then** visual decay progresses through stages:
  - **0-10s (Live)**: Green pulsing ring, full opacity marker
  - **10-30s (Stale)**: Yellow fading ring, 85% opacity marker
  - **30-60s (Very Stale)**: Orange solid ring, 70% opacity marker, "Last seen Xs ago" overlay
  - **>60s (Disconnected)**: Red solid ring, 50% opacity marker, "Last seen Xm ago" overlay
**And** transitions between stages are smooth (300ms fade)
**And** marker size remains constant (no shrinking) to maintain touch target
**When** a rider enters "Very Stale" or "Disconnected" state
**Then** an uncertainty radius is drawn around their marker:
  - Expanding circle showing potential position error
  - Radius increases by 50m every 10 seconds
  - Max radius: 500m
  - Style: dotted line, low opacity, same color as status ring
**When** a disconnected rider reconnects
**Then** uncertainty radius fades out over 500ms
**And** marker returns to full opacity with green pulsing ring

**Requirements Fulfilled:** FR18, FR19, NFR-R14 (<2% false positive disconnect rate)

---

### Story 3.12: Implement Responsive Layouts (Mobile, Tablet, Desktop)

As a **user**,
I want **the map interface to adapt responsively to mobile, tablet, and desktop screens**,
So that **I get optimized layouts for my device (full-screen on mobile, split-view on desktop)**.

**Acceptance Criteria:**

**Given** the app is running on any device size
**When** viewport width is <768px (mobile)
**Then** mobile rider view is rendered:
  - Map: 100% viewport height and width (full-screen)
  - Bottom status bar: fixed at bottom, 15vh height (25vh in glance mode)
  - FABs: Voice (bottom-right), SOS (bottom-left), 80px diameter
  - Navigation: bottom navigation bar (5 tabs, 60px height)
  - Member list: bottom sheet (slides up on tap, 70vh height)
**When** viewport width is 768-1023px (tablet)
**Then** tablet split-view is rendered:
  - Map: 66% width (left side)
  - Member list sidebar: 34% width (right side, persistent)
  - Bottom status bar: hidden (replaced by sidebar stats)
  - FABs: positioned within map area (not overlapping sidebar)
**When** viewport width is ≥1024px (desktop)
**Then** desktop management view is rendered:
  - Map: 60% width (left side)
  - Enhanced sidebar: 40% width (right side)
    - Trip statistics (top): duration, distance, avg speed
    - Member list (middle): scrollable, detailed info per rider
    - Settings panel (bottom): host controls, preferences
  - Container max-width: 1440px, centered on ultrawide screens
  - FABs: 64px diameter (smaller, mouse-friendly)
**And** layout transitions smoothly when resizing window (300ms)

**Requirements Fulfilled:** UX-DR27, UX-DR28, UX-DR29, NFR-A3 (functional at 200% zoom)

---

## Epic 3 Summary

**Stories Created:** 12
**Requirements Covered:**
- FRs: FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25, FR61 (12 FRs)
- UX Design: UX-DR14, UX-DR27, UX-DR28, UX-DR29, UX-DR43, UX-DR44
- Architecture: ARCH-18
- NFRs: NFR-P1, NFR-P5, NFR-P7, NFR-P10, NFR-P14, NFR-P15, NFR-I1, NFR-U7, NFR-R4, NFR-R14, NFR-S1, NFR-A3

**Epic 3 Status:** ✅ Complete

---

## Epic 4: Group Awareness & Coordination Tools

**Goal:** Provide riders with continuous group cohesion monitoring through nearest rider distance, group spread metrics, and interactive member list.

**User Outcome:** Users can instantly assess group status, see who's nearby or falling behind, tap members to center on their location, and monitor overall group spread.

---

### Story 4.1: Calculate and Display Nearest Rider Distance

As a **rider**,
I want **to see the distance to my nearest group member with color-coded indicator**,
So that **I know if I'm falling behind or pulling ahead**.

**Acceptance Criteria:**

**Given** there are multiple riders in the trip
**When** location updates are received
**Then** the app calculates distance to nearest rider using Haversine formula
**And** nearest rider distance is displayed in BottomStatusBar component:
  - Format: "X.X km" with 1 decimal place (or "Xm" if <1km)
  - Position: left section of bottom bar
  - Includes nearest rider's name and avatar
**And** distance is color-coded based on threshold:
  - **Green**: <500m (tight group)
  - **Yellow**: 500m-2km (moderate spread)
  - **Orange**: 2km-5km (wide spread)
  - **Red**: >5km (separated)
**And** distance updates every 3 seconds with smooth number transitions
**And** tapping the nearest rider section centers map on that rider
**When** I am the only rider or all other riders are disconnected
**Then** section shows "No other riders nearby"

**Requirements Fulfilled:** FR21, UX-DR17, NFR-P3 (<100ms Redis geospatial queries)

---

### Story 4.2: Calculate and Display Group Spread Indicator

As a **rider**,
I want **to see the maximum distance between any two riders in the group (group spread)**,
So that **I understand how scattered the group is overall**.

**Acceptance Criteria:**

**Given** there are multiple riders in the trip
**When** location updates are received
**Then** the backend calculates group spread:
  - Finds the two riders who are furthest apart
  - Calculates distance between them using Haversine formula
  - Caches result in Redis with 5-second TTL
**And** group spread is displayed in BottomStatusBar (center section):
  - Format: "Group: X.X km"
  - Icon: expand arrows (⟷) indicating spread
  - Updates every 5 seconds
**And** spread is color-coded:
  - **Green**: <1km (very tight)
  - **Yellow**: 1-3km (normal)
  - **Orange**: 3-10km (spread out)
  - **Red**: >10km (widely scattered)
**When** tapping the group spread indicator
**Then** Group View is triggered (auto-zoom to fit all riders, Story 3.9)
**When** only 2 riders are in trip
**Then** group spread equals distance between them
**When** in glance mode (moving)
**Then** group spread is hidden (minimizes information overload)

**Requirements Fulfilled:** FR22

---

### Story 4.3: Display Member List with Online/Offline Status

As a **rider**,
I want **to access a member list showing all trip participants with their online/offline status**,
So that **I can see who's actively sharing location and who's disconnected**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** I tap the BottomStatusBar or "Members" navigation button
**Then** MemberListSheet component slides up from bottom (70vh height on mobile)
**And** the member list displays all riders with:
  - Avatar with status ring (green/yellow/red based on connection)
  - Display name
  - Online/Offline badge
  - Last seen timestamp (if offline: "Last seen Xm ago")
  - Distance from me (e.g., "1.2 km away")
**And** riders are sorted by:
  - Host first (with crown icon)
  - Online riders (sorted by distance, nearest first)
  - Offline riders (sorted by last seen, most recent first)
**And** each member list item has 80px height (glove-friendly touch target)
**And** list is scrollable if more than 8 riders (viewport height limit)
**When** tapping a member list item
**Then** the map centers on that rider's location
**And** the member list sheet dismisses with slide-down animation
**When** swiping down on the sheet handle
**Then** the member list sheet dismisses

**Requirements Fulfilled:** FR23, UX-DR20, UX-DR22

---

### Story 4.4: Tap-to-Center-on-Rider from Member List

As a **rider**,
I want **to tap any rider in the member list and have the map center on their location**,
So that **I can quickly locate specific group members on the map**.

**Acceptance Criteria:**

**Given** the member list is open (Story 4.3)
**When** I tap a rider entry
**Then** the member list sheet dismisses with slide-down animation (300ms)
**And** the map animates to center on that rider's marker:
  - Duration: 800ms smooth animation
  - Target zoom: 15 (close enough to see local streets)
  - Easing: ease-in-out curve
**And** the centered rider's marker briefly scales to 120% for 400ms (visual feedback)
**And** if the rider is disconnected (red status), map centers on their last-known position
**And** after centering, map remains interactive (can pan/zoom manually)
**When** the centered rider is offline/disconnected
**Then** a toast appears: "Showing last known position (Xm ago)"

**Requirements Fulfilled:** FR24

---

### Story 4.5: Display Rider Status Icons on Avatars

As a **rider**,
I want **to see status icons on rider avatars indicating their current state (fuel, break, mechanical, emergency)**,
So that **I understand what's happening with each group member without needing to read messages**.

**Acceptance Criteria:**

**Given** riders can broadcast status messages (implemented in Epic 5)
**When** a rider sets a status
**Then** an icon overlay appears on their map marker avatar:
  - ⛽ Fuel (gas icon): yellow badge, top-right corner
  - ☕ Break (coffee icon): blue badge, top-right corner
  - 🔧 Mechanical (wrench icon): orange badge, top-right corner
  - 🚨 Emergency (SOS): red badge, full marker pulse (handled in Epic 5)
**And** the status icon is 20px diameter (1/3 of marker size)
**And** icon appears in member list as well (next to rider name)
**When** a rider clears their status or it expires (auto-clear after 15 minutes)
**Then** the icon overlay is removed with fade-out animation (300ms)
**And** multiple riders can have different statuses simultaneously
**And** only the most recent status per rider is displayed (one icon at a time)

**Requirements Fulfilled:** FR26

---

### Story 4.6: Calculate and Display ETA for Separated Riders

As a **rider**,
I want **to see ETA for separated riders to rejoin the group**,
So that **I know approximately when a fallen-behind rider will catch up**.

**Acceptance Criteria:**

**Given** a rider is >2km away from the group (separated)
**When** that rider is moving toward the group (closing distance)
**Then** an ETA is calculated based on:
  - Current distance between rider and nearest group member
  - Rider's current speed (from GPS)
  - Assumption: speed remains constant
  - Formula: ETA (minutes) = distance (km) / speed (km/h) × 60
**And** ETA is displayed:
  - In member list next to rider name: "ETA: Xm"
  - On map marker tooltip on hover/tap: "Rejoining in Xm"
  - Color: yellow (indicates temporary separation)
**And** ETA updates every 10 seconds as speed and distance change
**When** rider's speed is <5 km/h (stopped or very slow)
**Then** ETA shows "—" (no estimate, rider is stationary)
**When** rider is moving away from group (distance increasing)
**Then** ETA shows "Moving away" in red
**When** rider gets within 500m of group
**Then** ETA indicator is removed (rider has rejoined)

**Requirements Fulfilled:** FR27

---

## Epic 4 Summary

**Stories Created:** 6
**Requirements Covered:**
- FRs: FR21, FR22, FR23, FR24, FR26, FR27 (6 FRs)
- UX Design: UX-DR17, UX-DR20, UX-DR22
- NFRs: NFR-P3

**Epic 4 Status:** ✅ Complete

---

## Epic 5: Safety Communication (SOS & Voice Status)

**Goal:** Enable critical safety communication through one-tap SOS broadcasts, voice status updates with STT, and haptic proximity alerts.

**User Outcome:** Users can send emergency alerts, broadcast voice status messages (English + Hindi), use predefined status buttons, and receive haptic feedback for proximity and emergencies.

---

### Story 5.1: Display SOS Button with Long-Press Activation

As a **rider**,
I want **a persistent SOS button that activates via long-press to prevent accidental triggers**,
So that **I can broadcast emergencies to my group with confidence**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** the trip screen loads
**Then** the SOSButton component renders as a floating action button:
  - Position: fixed bottom-left, 16px margin
  - Size: 80px diameter (collapsed state)
  - Background: red (#FF0000)
  - Label: "SOS" in white, 2rem bold font
  - Z-index: 20 (above map, below modals)
**And** short tap (<500ms) does nothing (prevents accidental activation)
**When** I long-press the SOS button (hold >1 second)
**Then** the button expands to full width with animation:
  - Target height: 160px (bottom-third of screen)
  - Width: 100%
  - Label changes to "Hold to Activate SOS"
  - Progress bar appears showing hold duration (fills over 2 seconds)
**When** I hold for full 2 seconds
**Then** a confirmation dialog opens:
  - Title: "Send SOS Alert?"
  - Message: "This will notify all group members of your emergency and share your exact location."
  - Buttons: "Send SOS" (red, 120px), "Cancel" (gray, 80px)
  - Continuous strong haptic vibration while dialog is open
**When** I release before 2 seconds
**Then** the button collapses back to 80px circle with animation
**And** no SOS is sent

**Requirements Fulfilled:** FR28, UX-DR16, NFR-A6 (80x80px critical action target)

---

### Story 5.2: Broadcast SOS Alert to All Trip Participants

As a **rider**,
I want **my SOS alert broadcast to all group members immediately after confirmation**,
So that **everyone knows I need help and can see my exact location**.

**Acceptance Criteria:**

**Given** I have confirmed the SOS alert (Story 5.1)
**When** I tap "Send SOS" in the confirmation dialog
**Then** the backend broadcasts `sos:broadcast` event via WebSocket to all connected riders in the trip
**And** the SOS payload includes:
  - `riderId`: my device ID
  - `displayName`: my rider name
  - `coordinates`: my exact current location
  - `timestamp`: ISO 8601 timestamp of SOS trigger
  - `tripCode`: current trip code
**And** all riders receive the SOS event within 500ms (P95 latency target)
**And** my SOS button changes state:
  - Label: "Cancel SOS"
  - Pulsing animation continues
  - Background: solid red with white pulsing ring
**And** my map marker increases to 80px diameter with continuous red pulse
**And** a toast confirms: "SOS sent to all riders"
**When** other riders receive my SOS
**Then** their devices trigger:
  - Full-screen SOS alert modal with my name and distance
  - Continuous strong haptic vibration (3 seconds)
  - Push notification if app is backgrounded
  - Audio alert (if notifications enabled)
**And** a dashed line is drawn on their maps from their position to my SOS location

**Requirements Fulfilled:** FR28, FR34, NFR-P1 (P95 latency <500ms)

---

### Story 5.3: Display SOS Alert Received Modal for Other Riders

As a **rider**,
I want **to immediately see when another rider sends an SOS with their location and distance**,
So that **I can assess the situation and coordinate a response**.

**Acceptance Criteria:**

**Given** another rider has broadcast an SOS (Story 5.2)
**When** I receive the `sos:broadcast` event
**Then** a full-screen SOS alert modal appears over the map:
  - Red background (#FF0000)
  - Large SOS icon (warning triangle)
  - Rider name in 3rem bold white text
  - Distance: "X.X km away" in 2.5rem white text
  - Exact coordinates below (smaller text)
  - Action buttons (all 120px tall, white background, red text):
    - "View on Map" (primary)
    - "Call [if contact available]"
    - "Dismiss"
**And** continuous strong haptic vibration triggers for 3 seconds
**And** audio alert plays (loud beep, if device not muted)
**And** if app is backgrounded, a high-priority push notification appears:
  - Title: "SOS ALERT"
  - Body: "[Rider Name] needs help - X.X km away"
  - Action: "View" (opens app to SOS modal)
**When** I tap "View on Map"
**Then** the modal dismisses and map centers on SOS sender's location
**And** SOS sender's marker is highlighted (80px, pulsing red)
**And** a dashed line connects my position to theirs
**When** I tap "Dismiss"
**Then** the modal closes but SOS marker remains visible on map
**And** I can reopen SOS details from member list

**Requirements Fulfilled:** FR28, FR35, NFR-U8 (distinct haptic patterns)

---

### Story 5.4: Implement Voice Input FAB for Status Updates

As a **rider**,
I want **a voice input button to tap-and-speak my status updates hands-free**,
So that **I can communicate with my group without typing while riding**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** the trip screen loads
**Then** the VoiceInputFAB component renders:
  - Position: fixed bottom-right, 16px margin from edge, 80px above bottom nav bar
  - Size: 80px diameter circle
  - Background: primary blue (#3B82F6)
  - Icon: microphone (white, 32px)
  - Z-index: 20
**When** I tap the voice FAB
**Then** recording starts immediately:
  - Button background changes to red
  - Red pulsing ring animates around button (scale 100% → 110%, 500ms cycle)
  - Microphone icon turns red
  - Haptic pulse every 500ms while recording
  - Speech recognition starts (Web Speech API)
**And** a toast appears: "Speak your status..."
**When** I speak (e.g., "I need gas")
**Then** audio is captured and transcribed in real-time
**And** transcribed text appears below the FAB in a bubble (live preview)
**When** I tap the FAB again (or release after 10 seconds max)
**Then** recording stops
**And** transcribed text is sent as status message to all riders
**And** button returns to blue with microphone icon
**And** a green checkmark briefly appears (1 second) indicating success
**And** double haptic pulse confirms send

**Requirements Fulfilled:** FR30, UX-DR15, UX-DR41, NFR-U4 (tap-to-speak bottom 1/3 accessible)

---

### Story 5.5: Integrate Web Speech API for Voice Transcription

As a **developer**,
I want **Web Speech API integrated for voice-to-text transcription (English + Hindi)**,
So that **riders can send voice status updates with accurate transcription in noisy conditions**.

**Acceptance Criteria:**

**Given** the voice FAB is implemented (Story 5.4)
**When** recording starts
**Then** Web Speech API is initialized:
  - `lang: 'en-US'` (default) or `'hi-IN'` based on user preference
  - `continuous: false` (single utterance)
  - `interimResults: true` (show real-time preview)
  - `maxAlternatives: 1` (best guess only)
**And** speech recognition captures audio and returns transcription
**When** transcription accuracy is >75% confidence
**Then** the transcribed text is accepted and broadcast
**When** transcription accuracy is <75% or recognition fails
**Then** a fallback modal appears:
  - "Voice recognition unclear. Type your status instead?"
  - Large text input (80px height, 1.5rem font)
  - "Send" button (120px wide)
**And** if Web Speech API is unsupported (browser compatibility)
**Then** voice FAB shows disabled state with tooltip: "Voice input not supported on this device"
**And** fallback to text-only status input
**And** detection of helmet/wind noise environment logged for analytics

**Requirements Fulfilled:** FR31, NFR-I4, NFR-I5, NFR-I6, NFR-U2 (>85% accuracy target), NFR-U3 (fallback if <75%)

---

### Story 5.6: Display Predefined Status Message Buttons

As a **rider**,
I want **large predefined status buttons (Need gas, Taking break, Mechanical issue, Medical emergency)**,
So that **I can quickly send common messages with gloves on without typing or speaking**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** I tap the "Status" button in bottom navigation
**Then** a bottom sheet slides up with predefined status buttons:
  - "Need Gas" ⛽ (yellow, 120px tall, full width)
  - "Taking Break" ☕ (blue, 120px tall, full width)
  - "Mechanical Issue" 🔧 (orange, 120px tall, full width)
  - "Medical Emergency" 🚨 (red, 120px tall, full width)
**And** each button has:
  - Large icon (48px) on left
  - Status text (1.5rem) center-aligned
  - Minimum 16px vertical spacing between buttons
**When** I tap a status button
**Then** the status is broadcast to all riders via WebSocket
**And** my rider avatar displays the corresponding status icon (Story 4.5)
**And** the bottom sheet dismisses with slide-down animation
**And** a confirmation toast appears: "[Status] sent to group"
**And** haptic feedback (single pulse) confirms tap
**When** I tap "Medical Emergency"
**Then** an additional confirmation dialog appears:
  - "Send Medical Emergency Alert?"
  - "This will notify all riders immediately."
  - "Confirm" (red, 120px), "Cancel" (80px)
**And** if confirmed, all riders receive high-priority alert (similar to SOS)

**Requirements Fulfilled:** FR32, NFR-U1 (>90% glove success rate)

---

### Story 5.7: Implement Haptic Proximity Alerts

As a **rider**,
I want **distinct haptic vibration patterns when approaching riders or falling behind**,
So that **I can sense group cohesion changes without looking at my phone**.

**Acceptance Criteria:**

**Given** I am riding with active GPS and other riders are nearby
**When** I am approaching a rider ahead (closing distance <500m)
**Then** my device vibrates with 2 short pulses (200ms on, 100ms off, 200ms on)
**And** the proximity alert triggers once per rider per approach (not continuously)
**And** a 30-second cooldown prevents repeated alerts for same rider
**When** I am falling behind the group (distance increasing >2km)
**Then** my device vibrates with 3 long pulses (400ms on, 200ms off, repeating)
**And** this alert repeats every 2 minutes while falling behind
**When** another rider sends an SOS (Story 5.2)
**Then** continuous strong vibration triggers for 3 seconds
**And** haptic is accompanied by audio alert (if not muted)
**And** if Vibration API is unsupported
**Then** visual-only alternatives are shown:
  - Screen flash (white → red → white)
  - Prominent banner notification
**And** users can adjust haptic intensity in Settings (off, low, medium, high)

**Requirements Fulfilled:** FR33, UX-DR40, UX-DR42, NFR-U8, NFR-U9 (>80% recognizability), NFR-A10 (visual alternatives)

---

### Story 5.8: Share Exact Coordinates with Emergency Contacts

As a **rider**,
I want **to share my exact coordinates via SMS or messaging apps during an emergency**,
So that **support vehicles or emergency services can locate me precisely**.

**Acceptance Criteria:**

**Given** I am in an SOS situation or need to share my location
**When** I long-press my own rider marker or tap "Share Location" in Settings
**Then** a share options modal appears with:
  - My current coordinates (latitude, longitude, 6 decimal places)
  - Google Maps link: `https://maps.google.com/?q=lat,lng`
  - Share buttons: SMS, WhatsApp, Copy, More (system share sheet)
**When** I tap SMS
**Then** SMS composer opens with pre-filled message:
  - "I need help at this location: [Google Maps link]"
  - "SyncRide Trip Code: [CODE]"
**When** I tap WhatsApp
**Then** WhatsApp opens with same pre-filled message
**When** I tap Copy
**Then** coordinates and Google Maps link are copied to clipboard
**And** a toast confirms: "Location copied to clipboard"
**When** I tap More
**Then** the native system share sheet opens with the location text
**And** I can choose any available app (email, Telegram, etc.)

**Requirements Fulfilled:** FR34

---

### Story 5.9: Display Distraction Warnings on First Launch

As a **user**,
I want **to see distraction warnings before using SOS and on first app launch**,
So that **I understand the safety risks and limitations of using the app while riding**.

**Acceptance Criteria:**

**Given** I am launching SyncRide for the first time
**When** the app loads (after Terms of Service, Story 2.5)
**Then** a distraction warning modal appears:
  - Title: "Safety First"
  - Message: "SyncRide is designed for quick glances. Do not use this app while actively riding. Pull over safely before interacting."
  - Highlight: "Never text, tap, or navigate while in motion."
  - Checkbox: "I understand the risks" (required)
  - "Continue" button (disabled until checkbox checked)
**And** after confirmation, warning is saved to localStorage (don't show again)
**When** I long-press the SOS button for the first time (Story 5.1)
**Then** before the SOS confirmation dialog, a one-time warning appears:
  - Title: "SOS Limitations"
  - Message: "SOS is not a substitute for emergency services (911/112). Your group members are not trained responders."
  - Highlight: "Always call emergency services first in life-threatening situations."
  - "I Understand" button
**And** after acknowledgment, SOS confirmation dialog appears
**And** this SOS warning only shows once per device (saved to localStorage)

**Requirements Fulfilled:** FR36, NFR-U12 (distraction warnings), FR41 (SOS limitations in ToS)

---

### Story 5.10: Send Push Notifications for Critical Events

As a **rider**,
I want **to receive push notifications for SOS alerts and trip end events even when the app is backgrounded**,
So that **I don't miss critical safety information**.

**Acceptance Criteria:**

**Given** I have granted push notification permission (Story 2.8)
**When** another rider sends an SOS alert (Story 5.2)
**Then** a high-priority push notification is sent to my device:
  - Title: "🚨 SOS ALERT"
  - Body: "[Rider Name] needs help - X.X km away"
  - Priority: high (bypasses Do Not Disturb on some platforms)
  - Sound: loud alert sound
  - Action buttons: "View" (opens app), "Dismiss"
**When** the trip host ends the trip (Story 6.5)
**Then** a push notification is sent to all riders:
  - Title: "Trip Ended"
  - Body: "Your SyncRide trip has ended. Location data deleted."
  - Priority: default
  - Action: "View Summary" (opens post-trip screen, Epic 9)
**When** I am disconnected for >5 minutes
**Then** a push notification is sent to me:
  - Title: "Connection Lost"
  - Body: "Reconnect to share your location with the group."
  - Action: "Reconnect" (opens app)
**And** notifications include trip code in metadata for routing to correct trip screen
**And** if notification permission is denied, in-app alerts are shown instead (fallback)

**Requirements Fulfilled:** FR35, NFR-I9 (FCM/APNs with Service Worker)

---

## Epic 5 Summary

**Stories Created:** 10
**Requirements Covered:**
- FRs: FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36 (9 FRs)
- UX Design: UX-DR15, UX-DR16, UX-DR21, UX-DR23, UX-DR40, UX-DR41, UX-DR42
- NFRs: NFR-U1, NFR-U2, NFR-U3, NFR-U4, NFR-U8, NFR-U9, NFR-U12, NFR-A6, NFR-A10, NFR-I4, NFR-I5, NFR-I6, NFR-I9, NFR-P1

**Epic 5 Status:** ✅ Complete

---

## Epic 6: Trip Host Management Controls

**Goal:** Provide trip hosts with comprehensive management capabilities including participant oversight, access control, and trip lifecycle management.

**User Outcome:** Trip hosts can view all riders with join timestamps, kick misbehaving riders, ban device IDs, rotate trip codes, and end trips with proper data cleanup.

---

### Story 6.1: Display Rider List with Join Timestamps for Host

As a **trip host**,
I want **to view a list of all joined riders with their display names and join timestamps**,
So that **I can monitor who's in my trip and when they joined**.

**Acceptance Criteria:**

**Given** I am the trip host
**When** I open the member list (Story 4.3)
**Then** my view includes additional host-only information:
  - Crown icon next to my name indicating host status
  - Join timestamps for all riders: "Joined X minutes ago"
  - Device ID (masked, last 4 characters): "Device: ...AB12"
  - Host controls dropdown menu (3-dot icon) for each rider
**And** the list displays riders sorted by join order (oldest first)
**And** host-only UI elements are hidden for non-host riders
**When** I tap the 3-dot menu for a rider
**Then** a dropdown menu appears with options:
  - "View Details" (shows full rider info modal)
  - "Center on Map"
  - "Kick from Trip" (red text)
  - "Ban Device" (red text, requires kick first)

**Requirements Fulfilled:** FR4

---

### Story 6.2: Kick Rider from Active Trip

As a **trip host**,
I want **to kick a rider from the trip**,
So that **I can remove misbehaving participants or manage trip size**.

**Acceptance Criteria:**

**Given** I am the trip host viewing the member list (Story 6.1)
**When** I tap "Kick from Trip" in a rider's menu
**Then** a confirmation dialog appears:
  - Title: "Kick [Rider Name]?"
  - Message: "This will immediately remove them from the trip. They can rejoin with the trip code unless you ban their device."
  - Buttons: "Kick" (red, 120px), "Cancel" (gray, 80px)
**When** I confirm the kick
**Then** a `trip:kick` WebSocket event is sent to the backend with:
  - `tripCode`: current trip
  - `hostId`: my device ID (for authorization)
  - `targetRiderId`: rider being kicked
**And** the backend validates I am the host before processing
**And** the kicked rider is removed from the trip's riders array in MongoDB
**And** the kicked rider receives a `trip:kicked` event
**And** their app displays a modal: "You have been removed from this trip by the host."
**And** they are redirected to the home screen
**And** the kicked rider's marker disappears from all participants' maps
**And** all participants see a toast: "[Rider Name] was removed from the trip"
**And** if host authorization fails, an error is returned: "Only the host can kick riders"

**Requirements Fulfilled:** FR5, NFR-S7 (server-side authorization)

---

### Story 6.3: Ban Device ID from Rejoining Trip

As a **trip host**,
I want **to ban a device ID after kicking a rider**,
So that **they cannot rejoin the trip even with the trip code**.

**Acceptance Criteria:**

**Given** I have kicked a rider (Story 6.2)
**When** the kick confirmation succeeds
**Then** an additional prompt appears:
  - Title: "Ban this device?"
  - Message: "Prevent this rider from rejoining this trip. Ban lasts until trip ends."
  - Buttons: "Ban Device" (red, 120px), "No Thanks" (gray, 80px)
**When** I confirm the ban
**Then** a `trip:ban` WebSocket event is sent with:
  - `tripCode`, `hostId`, `targetDeviceId`
**And** the backend adds the device ID to the trip's `bannedDevices` array in MongoDB
**And** the ban is also cached in Redis with same TTL as trip (12 hours)
**When** the banned rider attempts to rejoin with the trip code
**Then** the join request is rejected with error: "You have been banned from this trip"
**And** no further join attempts are allowed from that device for this trip
**And** the ban is automatically cleared when the trip ends
**And** host can view banned devices list in trip settings

**Requirements Fulfilled:** FR7, NFR-S8 (ban enforcement across all mechanisms)

---

### Story 6.4: Expire and Rotate Trip Code

As a **trip host**,
I want **to expire the current trip code and generate a new one**,
So that **I can prevent new riders from joining after the trip has started or control access**.

**Acceptance Criteria:**

**Given** I am the trip host
**When** I access trip settings (3-dot menu in top-right)
**Then** a "Security" section includes "Rotate Trip Code" option
**When** I tap "Rotate Trip Code"
**Then** a confirmation dialog appears:
  - Title: "Rotate Trip Code?"
  - Message: "Current code will stop working. A new code will be generated. Existing riders stay connected."
  - Buttons: "Generate New Code" (orange, 120px), "Cancel" (80px)
**When** I confirm rotation
**Then** the backend generates a new 6-digit cryptographically random code
**And** the old trip code is removed from Redis (immediately invalid)
**And** the new trip code is added to Redis with 12-hour TTL
**And** the trip document in MongoDB is updated with new `tripCode` and `codeRotatedAt` timestamp
**And** existing riders remain connected (not affected)
**And** the new code is displayed to me in TripCodeDisplay component (Story 2.2)
**And** a toast confirms: "Trip code updated. Share the new code with riders."
**When** someone attempts to join with the old code after rotation
**Then** join fails with error: "Trip code expired or invalid"

**Requirements Fulfilled:** FR6

---

### Story 6.5: End Trip Manually with Data Deletion Trigger

As a **trip host**,
I want **to manually end the trip which triggers automatic data deletion**,
So that **I can conclude the ride and ensure location data is removed as promised**.

**Acceptance Criteria:**

**Given** I am the trip host with an active trip
**When** I tap "End Trip" button in trip settings or bottom nav
**Then** a confirmation dialog appears:
  - Title: "End Trip?"
  - Message: "This will end the trip for all riders. Location data will be deleted within 30 seconds."
  - Warning: "This action cannot be undone."
  - Buttons: "End Trip" (red, 120px), "Cancel" (80px)
**When** I confirm ending the trip
**Then** a `trip:end` WebSocket event is broadcast to all riders
**And** the backend updates trip status to 'ended' in MongoDB
**And** the trip code is removed from Redis immediately
**And** all riders' live location data is deleted from Redis (30-second TTL enforcement)
**And** all riders receive the `trip:ended` event and are redirected to post-trip summary (Epic 9)
**And** all riders see a confirmation modal: "Trip ended by host. Location data deleted."
**And** push notifications are sent to all riders (if permitted, Story 5.10)
**And** a data deletion confirmation is logged for compliance (Epic 8)

**Requirements Fulfilled:** FR8, FR39, NFR-S10 (Redis TTL 30s)

---

### Story 6.6: Auto-End Trip After 12 Hours

As a **system**,
I want **to automatically end trips after 12 hours of activity**,
So that **trips don't remain active indefinitely and data retention policies are enforced**.

**Acceptance Criteria:**

**Given** a trip has been active for 12 hours
**When** the backend cron job runs (every 10 minutes)
**Then** the job queries MongoDB for trips where:
  - `status: 'active'`
  - `createdAt < (now - 12 hours)`
**And** for each expired trip:
  - Trip status is updated to 'ended' in MongoDB
  - Trip code is removed from Redis
  - All riders' live location data is deleted from Redis
  - `trip:ended` WebSocket event is broadcast to all connected riders
  - Push notifications are sent: "Your trip has ended (12-hour limit)"
**And** disconnected riders (not connected to WebSocket) receive push notification when they next come online
**When** riders attempt to rejoin an auto-ended trip
**Then** they see error: "This trip has ended (12-hour time limit)"
**And** auto-end events are logged for analytics and monitoring

**Requirements Fulfilled:** FR9

---

### Story 6.7: Auto-End Trip at 10% Battery Level

As a **system**,
I want **to prompt trip end when device battery reaches 10%**,
So that **riders conserve remaining battery for essential communication**.

**Acceptance Criteria:**

**Given** I am in an active trip with GPS tracking enabled
**When** the Battery Status API detects battery level ≤10%
**Then** a warning modal appears:
  - Title: "Low Battery Warning"
  - Message: "Battery at 10%. Location tracking will stop soon to preserve battery."
  - Recommendation: "Consider ending trip or charging device."
  - Buttons: "End Trip Now" (orange, 120px), "Continue Trip" (gray, 80px)
**When** I tap "End Trip Now"
**Then** the trip ends with same flow as manual host end (Story 6.5)
**When** I tap "Continue Trip"
**Then** GPS polling interval increases to maximum (15 seconds) to conserve battery
**And** non-critical features are disabled (animations, haptic feedback reduced)
**And** a persistent banner shows: "Battery Saver Mode Active"
**When** battery reaches 5%
**Then** the trip automatically ends without further prompt
**And** GPS tracking stops immediately
**And** a final push notification is sent: "Trip ended to preserve battery"
**And** if Battery Status API is unsupported, low battery prompts are not shown

**Requirements Fulfilled:** FR9, NFR-P16 (battery monitoring, feature disabling <15%)

---

### Story 6.8: Allow Rider to Leave Trip Voluntarily

As a **rider** (non-host),
I want **to voluntarily leave a trip before it ends**,
So that **I can exit the group if I'm separating or no longer need tracking**.

**Acceptance Criteria:**

**Given** I am a rider (not host) in an active trip
**When** I tap "Leave Trip" button in trip settings
**Then** a confirmation dialog appears:
  - Title: "Leave Trip?"
  - Message: "You will stop sharing your location. You can rejoin with the trip code if needed."
  - Buttons: "Leave" (orange, 120px), "Cancel" (80px)
**When** I confirm leaving
**Then** a `trip:leave` WebSocket event is sent with my `riderId`
**And** I am removed from the trip's riders array in MongoDB
**And** my live location data is deleted from Redis
**And** my marker disappears from all participants' maps
**And** all participants see a toast: "[Rider Name] left the trip"
**And** I am redirected to the home screen with message: "You left the trip"
**When** I am the trip host and tap "Leave Trip"
**Then** a different confirmation appears:
  - "You are the host. Leaving will end the trip for all riders."
  - Options: "End Trip for All", "Cancel"
**And** if confirmed, the trip ends for everyone (Story 6.5)

**Requirements Fulfilled:** FR10

---

## Epic 6 Summary

**Stories Created:** 8
**Requirements Covered:**
- FRs: FR4, FR5, FR6, FR7, FR8, FR9, FR10 (7 FRs)
- NFRs: NFR-S7, NFR-S8, NFR-S10, NFR-P16

**Epic 6 Status:** ✅ Complete

---

## Epic 7: Dead Zone Resilience & Offline Handling

**Goal:** Maintain group coordination through network dead zones with client-side buffering, automatic reconnection, and visual trail replay.

**User Outcome:** Users stay connected through tunnels and remote areas with buffered location updates, transparent reconnection status, and animated trail replay on network restoration.

---

### Story 7.1: Implement Client-Side Location Buffering During Network Loss

As a **rider**,
I want **my location updates buffered client-side when network is unavailable**,
So that **my trail is preserved and can be replayed when connectivity returns**.

**Acceptance Criteria:**

**Given** I am in an active trip and the WebSocket connection drops
**When** GPS continues capturing my location (Story 3.1)
**Then** location updates are queued in IndexedDB instead of being sent:
  - Database: `syncride_offline_buffer`
  - Store: `location_updates`
  - Schema: `{ riderId, coordinates, timestamp, motionState, heading, speed }`
**And** updates are batched every 5 seconds to minimize IndexedDB writes
**And** buffer capacity is 1000 coordinate updates (approximately 15 minutes at 2s polling)
**When** buffer reaches 1000 updates
**Then** oldest updates are deleted (FIFO queue)
**And** a warning is logged: "Offline buffer full, dropping oldest location data"
**When** device storage is low (<10MB available)
**Then** buffering is paused and a toast warns: "Low storage, location buffering disabled"
**And** last-known position continues to display on map

**Requirements Fulfilled:** FR46, NFR-R7 (queue up to 1000 updates), NFR-R16 (preserve 15 minutes history)

---

### Story 7.2: Display Reconnecting Status Indicators

As a **rider**,
I want **to see clear status indicators when my connection is lost and reconnecting**,
So that **I understand the app is attempting to restore connectivity and not frozen**.

**Acceptance Criteria:**

**Given** my WebSocket connection has dropped (disconnect event)
**When** the disconnection is detected
**Then** the ConnectionStatusBanner component appears at top of screen:
  - Background: orange (#FF9500)
  - Icon: spinning loader icon
  - Text: "Reconnecting... attempt 1/5"
  - Height: 48px
  - Position: fixed top, full width
  - Z-index: 30 (above map, below modals)
**And** the banner animates slide-down from top (300ms)
**And** attempt counter increments with each retry: "attempt 2/5", "attempt 3/5"
**And** retry timing follows exponential backoff:
  - Attempt 1: immediate
  - Attempt 2: 1 second
  - Attempt 3: 2 seconds
  - Attempt 4: 4 seconds
  - Attempt 5: 8 seconds
**When** connection is restored
**Then** banner background changes to green (#00FF00)
**And** text changes to "Connected"
**And** banner auto-dismisses after 2 seconds with slide-up animation
**When** all 5 attempts fail
**Then** banner background changes to red (#FF0000)
**And** text changes to "Connection failed. Tap to retry."
**And** tapping banner manually triggers reconnection attempt

**Requirements Fulfilled:** FR47, UX-DR19, NFR-R4 (exponential backoff with jitter), NFR-P4 (<5s median reconnection)

---

### Story 7.3: Replay Buffered Location Trail with Animation on Reconnection

As a **rider**,
I want **my buffered location updates replayed with animation when I reconnect**,
So that **my group can see where I was during the disconnection period**.

**Acceptance Criteria:**

**Given** I have buffered location updates in IndexedDB (Story 7.1) and I reconnect
**When** the WebSocket connection is reestablished
**Then** the buffered updates are batch-uploaded to backend:
  - POST endpoint: `/api/trips/:tripCode/locations/batch`
  - Payload: array of LocationUpdate objects from buffer
  - Header: `Authorization: Bearer [JWT]`
  - Timeout: 10 seconds (fail if backend doesn't respond)
**And** the backend processes the batch:
  - Validates all updates (coordinates, timestamps)
  - Broadcasts `location:trail_replay` event to all riders with the buffered path
  - Stores updates in MongoDB time-series collection (if replay opt-in enabled, Epic 8)
**When** other riders receive the trail replay event
**Then** my marker animates along the buffered path:
  - Animation duration: 3 seconds total (regardless of buffer size)
  - Path: polyline connecting all buffered coordinates
  - Speed: constant (distance-independent timing)
  - Style: blue dotted line tracing my route
**And** after animation completes, my marker resumes live position
**And** a toast appears for other riders: "[Rider Name] reconnected"

**Requirements Fulfilled:** FR48, FR52, NFR-R15 (>90% trail replay accuracy)

---

### Story 7.4: Display Faint Dotted Lines for Dead Zone Paths

As a **rider**,
I want **to see dotted lines showing where riders traveled through dead zones**,
So that **I understand their path even when they were offline**.

**Acceptance Criteria:**

**Given** a rider's trail replay has completed (Story 7.3)
**When** the animation finishes
**Then** a persistent dotted line remains on the map showing the dead zone path:
  - Style: dashed line (4px dash, 8px gap)
  - Color: light gray (#CCCCCC), 50% opacity
  - Path: connects all buffered coordinates in sequence
  - Z-index: below rider markers, above map base
**And** the dotted line persists for 5 minutes after reconnection
**And** after 5 minutes, the line fades out over 2 seconds (opacity 0.5 → 0)
**When** multiple riders have dead zone paths
**Then** each rider's path uses a unique color (derived from their avatar color)
**And** tapping a dead zone path highlights that rider's marker
**When** map is panned/zoomed
**Then** dead zone paths remain visible and scale appropriately

**Requirements Fulfilled:** FR49

---

### Story 7.5: Implement Automatic Reconnection with Exponential Backoff and Jitter

As a **developer**,
I want **WebSocket reconnection logic with exponential backoff and jitter**,
So that **reconnection attempts don't overwhelm the server during network restoration**.

**Acceptance Criteria:**

**Given** the WebSocket client is configured (Story 3.2)
**When** a disconnect event occurs
**Then** the reconnection strategy executes:
  - Base delay: 1000ms
  - Exponential multiplier: 2
  - Max delay: 8000ms
  - Max attempts: 5
  - Jitter: random ±25% of calculated delay
**And** reconnection timing is:
  - Attempt 1: 0ms (immediate)
  - Attempt 2: 1000ms ± 250ms jitter
  - Attempt 3: 2000ms ± 500ms jitter
  - Attempt 4: 4000ms ± 1000ms jitter
  - Attempt 5: 8000ms ± 2000ms jitter
**When** reconnection succeeds before attempt 5
**Then** reconnection counter resets to 0
**And** connection status banner shows "Connected" (Story 7.2)
**When** all 5 attempts fail
**Then** reconnection stops and manual retry is required
**And** connection status shows "Connection failed. Tap to retry."
**And** tapping retry button resets counter and starts from attempt 1

**Requirements Fulfilled:** FR50, NFR-R4, NFR-P4 (median <5s reconnection)

---

### Story 7.6: Display Last-Known Position Indicators for Disconnected Riders

As a **rider**,
I want **to see "last known position" indicators when other riders are disconnected**,
So that **I have a reference point for where they were before losing connection**.

**Acceptance Criteria:**

**Given** another rider's connection has been lost >30 seconds (disconnected state, Story 3.11)
**When** they remain disconnected
**Then** their marker displays:
  - Red solid status ring (no animation)
  - 50% opacity on avatar
  - Timestamp overlay: "Last seen Xm ago" (updates every 10 seconds)
  - Expanding uncertainty radius (dotted circle, Story 3.11):
    - Initial radius: 50m
    - Grows by 50m every 10 seconds
    - Max radius: 500m
**And** marker remains at last-known coordinates (doesn't move)
**And** heading indicator is hidden (direction unknown while disconnected)
**When** tapping the disconnected rider's marker
**Then** a tooltip appears:
  - "Last seen: X minutes ago"
  - "Last position (may have moved)"
  - Accuracy: "±Xm (when last connected)"
**When** the disconnected rider reconnects
**Then** uncertainty radius fades out (500ms)
**And** marker returns to live state (green pulsing ring, full opacity)
**And** marker animates from last-known position to current position

**Requirements Fulfilled:** FR51

---

### Story 7.7: Continue App Use in Offline Mode with Degraded Functionality

As a **rider**,
I want **the app to remain functional in offline mode with degraded features**,
So that **I can still view the map and my cached location even without network**.

**Acceptance Criteria:**

**Given** my device has no network connectivity
**When** I open the app or connection is lost during trip
**Then** offline mode is automatically activated:
  - Banner shows: "Offline Mode - Limited Functionality"
  - Banner color: gray (#6B7280)
  - Banner persists (not auto-dismissing)
**And** available functionality in offline mode:
  - ✅ View map with cached map tiles (last viewed areas)
  - ✅ See my current GPS position (blue dot, updates locally)
  - ✅ View last-known positions of other riders (markers frozen)
  - ✅ Access cached trip code (can share offline)
  - ✅ Queue location updates for later upload (Story 7.1)
**And** unavailable functionality (gracefully disabled):
  - ❌ Real-time location updates from others (markers show "offline" badges)
  - ❌ Send status messages or SOS (buttons grayed out with tooltip: "Requires connection")
  - ❌ View updated group stats (nearest rider, group spread - shows "—")
  - ❌ Join or create new trips (requires backend)
**When** tapping disabled features
**Then** a toast explains: "This feature requires network connection"
**When** network is restored
**Then** offline banner transitions to "Reconnecting..." (Story 7.2)
**And** all queued updates are uploaded (Story 7.3)
**And** real-time functionality resumes

**Requirements Fulfilled:** FR53

---

## Epic 7 Summary

**Stories Created:** 7
**Requirements Covered:**
- FRs: FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53 (8 FRs)
- UX Design: UX-DR19, UX-DR47, UX-DR48
- NFRs: NFR-R1, NFR-R4, NFR-R7, NFR-R14, NFR-R15, NFR-R16, NFR-P4

**Epic 7 Status:** ✅ Complete

---

## Epic 8: Privacy, Data Lifecycle & Compliance

**Goal:** Implement transparent privacy controls with automatic data deletion, opt-in replay storage, and full DPDP/GDPR/PDPA compliance.

**User Outcome:** Users have full control over their location data with automatic deletion on trip end, explicit consent for 7-day replay, and accessible data subject rights.

---

### Story 8.1: Auto-Delete Live Location Data on Trip End (Redis TTL)

As a **system**,
I want **live location data automatically deleted from Redis within 30 seconds of trip end**,
So that **privacy promises are technically enforced without manual cleanup**.

**Acceptance Criteria:**

**Given** a trip is active with riders sharing location
**When** location updates are stored in Redis
**Then** each location key uses this format: `location:{tripCode}:{riderId}`
**And** each key is set with TTL of 30 seconds: `SETEX location:ABC123:rider1 30 {locationData}`
**And** TTL is refreshed with every new location update for that rider
**When** a trip ends (host ends manually, 12-hour limit, or battery limit)
**Then** all location keys for that trip are immediately deleted:
  - Redis command: `DEL location:ABC123:*` (delete all matching pattern)
  - Executes synchronously before trip end confirmation is sent
**And** verification check runs after deletion:
  - Query: `KEYS location:ABC123:*`
  - Expected result: empty array
**And** if any keys remain (deletion failure), error is logged to Sentry with high priority
**When** 30 seconds pass after last update (no refresh)
**Then** Redis automatically expires the key (TTL enforcement)
**And** expired keys are cleaned up by Redis background process

**Requirements Fulfilled:** FR39, NFR-S10 (30s TTL), NFR-S12 (no persistent location graphs)

---

### Story 8.2: Display Opt-In Consent for 7-Day Trip Replay Storage

As a **rider**,
I want **to explicitly opt-in to 7-day trip replay storage with clear consent**,
So that **I can save my trip data if desired while understanding retention**).

**Acceptance Criteria:**

**Given** I am viewing the post-trip summary screen (Epic 9)
**When** the trip ends
**Then** an opt-in modal appears before showing summary:
  - Title: "Save Trip Replay?"
  - Message: "Your location history from this trip will be stored for 7 days to enable replay and sharing."
  - Details expandable section:
    - "What's stored: GPS coordinates, timestamps, trip statistics"
    - "How long: 7 days, then automatically deleted"
    - "Who can access: Only you via this device (no account required)"
  - Checkboxes (both optional):
    - ☐ "Save my trip replay for 7 days"
    - ☐ "Share anonymized trip statistics to improve SyncRide"
  - Buttons: "Save" (green, 120px), "Don't Save" (gray, 80px)
**When** I select "Save" with opt-in checkbox checked
**Then** consent is recorded:
  - `tripReplayConsent: true` saved to MongoDB trip document
  - `consentTimestamp: Date` logged
  - `consentDeviceId: string` recorded
**And** my location history from this trip is saved to MongoDB time-series collection
**And** TTL index is set for 7-day automatic deletion
**When** I select "Don't Save" or leave checkboxes unchecked
**Then** no location history is saved beyond live tracking
**And** only aggregate trip statistics are saved (Epic 9)
**And** consent refusal is logged: `tripReplayConsent: false`

**Requirements Fulfilled:** FR40, FR55

---

### Story 8.3: Enforce 7-Day Hard Delete with MongoDB TTL Indexes

As a **developer**,
I want **MongoDB TTL indexes configured to automatically delete trip replay data after 7 days**,
So that **data retention promises are enforced at the database level without manual cleanup**.

**Acceptance Criteria:**

**Given** trip replay data is stored in MongoDB time-series collection
**When** the collection is initialized
**Then** a TTL index is created:
  - Collection: `trip_replays`
  - Index field: `createdAt`
  - TTL value: `7 * 24 * 60 * 60` seconds (7 days)
  - Command: `db.trip_replays.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 604800 })`
**And** time-series collection is configured:
  - `timeField: "timestamp"`
  - `metaField: "tripCode"`
  - `granularity: "seconds"`
**When** 7 days pass after trip creation
**Then** MongoDB background process automatically deletes the trip replay documents
**And** deletion happens within 60 seconds of expiration (MongoDB TTL monitor runs every 60s)
**When** trip replay data is queried after expiration
**Then** query returns empty result (data is gone)
**And** no manual cleanup jobs or cron tasks are needed
**And** TTL deletion is logged in MongoDB server logs for auditing

**Requirements Fulfilled:** FR42, NFR-S11 (7-day hard delete with DB-level TTL)

---

### Story 8.4: Display Data Deletion Confirmation Message

As a **rider**,
I want **to receive confirmation that my location data was deleted after trip end**,
So that **I have transparency and trust in the app's privacy promises**.

**Acceptance Criteria:**

**Given** a trip has ended (host end, auto-end, or I left voluntarily)
**When** the trip end flow completes (Story 6.5)
**Then** a confirmation modal appears after trip summary:
  - Title: "Data Deleted"
  - Message: "Your real-time location data has been automatically deleted."
  - Icon: green checkmark
  - Details:
    - "Live tracking data: ✓ Deleted within 30 seconds"
    - "Trip replay: ✓ Will auto-delete in 7 days" (if opted-in)
    - "Trip replay: ✓ Not saved" (if opted-out)
  - Footer: "View our Privacy Policy"
  - Button: "Got It" (green, 120px)
**And** the modal auto-dismisses after 10 seconds if no interaction
**When** I tap "Got It"
**Then** modal closes and I return to home screen or post-trip summary
**When** I tap "View our Privacy Policy"
**Then** the Privacy Policy page opens in a new view/webview
**And** deletion confirmation timestamp is logged for compliance

**Requirements Fulfilled:** FR43, FR59

---

### Story 8.5: Implement Data Subject Rights Portal (DPDP Act Compliance)

As a **user**,
I want **to access my data subject rights (access, correction, deletion, portability)**,
So that **I can exercise my privacy rights under DPDP Act regulations**.

**Acceptance Criteria:**

**Given** I am using the app (logged in or anonymous with device ID)
**When** I navigate to Settings → Privacy → "Your Data Rights"
**Then** a Data Subject Rights portal displays with options:
  - **Right to Access**: "Download a copy of your data"
  - **Right to Correction**: "Update incorrect personal information"
  - **Right to Deletion**: "Delete all your data from SyncRide"
  - **Right to Portability**: "Export your data in machine-readable format"
  - **Withdraw Consent**: "Revoke location data collection consent"
**When** I tap "Download a copy of your data"
**Then** a data export is generated containing:
  - Device ID (masked)
  - Consent history (timestamps, types)
  - Trip codes participated in (last 30 days)
  - Aggregate statistics (no raw GPS coordinates unless replay opt-in)
  - Data retention status
**And** export is available as JSON download
**When** I tap "Delete all your data"
**Then** a confirmation appears: "This will delete all your data including trip history, consent records, and cached information. This action is irreversible."
**When** confirmed, all associated data is deleted:
  - Device ID from all trips (historical records anonymized)
  - Consent logs archived (required for compliance, but anonymized)
  - Trip replay data (if any)
  - Cached data in localStorage
**And** deletion confirmation email is sent (if email provided)
**And** deletion is completed within 72 hours

**Requirements Fulfilled:** FR44, NFR-S19 (DPDP Act compliance)

---

### Story 8.6: Log Consent Events for Regulatory Compliance Auditing

As a **system**,
I want **all consent events logged with timestamps for regulatory auditing**,
So that **we can prove compliance during audits and demonstrate user consent history**.

**Acceptance Criteria:**

**Given** a user interacts with any consent flow
**When** consent is granted, denied, or withdrawn
**Then** a consent event is logged to MongoDB `consent_logs` collection with:
  - `userId`: device ID (hashed for privacy)
  - `consentType`: 'location_tracking' | 'trip_replay' | 'terms_of_service' | 'data_collection'
  - `action`: 'granted' | 'denied' | 'withdrawn'
  - `timestamp`: ISO 8601 timestamp
  - `ipAddress`: hashed IP (for audit trail)
  - `userAgent`: browser/device info
  - `consentText`: snapshot of consent language shown to user
  - `version`: app version at time of consent
**And** consent logs are immutable (insert-only, no updates or deletes allowed)
**And** consent logs have separate retention policy:
  - Stored for 7 years (regulatory requirement)
  - After deletion request, logs are anonymized but retained
**When** an audit request is received
**Then** consent logs can be queried by:
  - Date range
  - Consent type
  - Action type
**And** export generates compliance report in CSV format
**And** consent log access is restricted to admin role only

**Requirements Fulfilled:** FR45, NFR-S22 (consent auditing)

---

### Story 8.7: Implement WSS (TLS) Encryption for WebSocket Communication

As a **system**,
I want **all WebSocket communication encrypted with TLS (WSS protocol)**,
So that **location data cannot be intercepted during transmission**.

**Acceptance Criteria:**

**Given** the WebSocket connection is established (Story 3.2)
**When** the connection URL is configured
**Then** WSS protocol is enforced:
  - Production: `wss://api.syncride.com/socket.io` (TLS required)
  - Development: `ws://localhost:3000/socket.io` (local only, TLS optional)
**And** the backend Socket.io server is configured with HTTPS/TLS:
  - TLS certificate: valid SSL certificate from Let's Encrypt or commercial CA
  - TLS version: minimum TLS 1.2
  - Cipher suites: strong encryption only (AES-256-GCM, ChaCha20-Poly1305)
**When** a client attempts to connect with WS (non-encrypted)
**Then** the connection is rejected with error: "Secure connection required"
**And** the client automatically upgrades to WSS
**When** location data is transmitted
**Then** all payloads are encrypted in transit via TLS
**And** no plaintext coordinates are exposed on the network
**And** TLS handshake is verified before first data transmission

**Requirements Fulfilled:** NFR-S1 (WSS/TLS encryption)

---

### Story 8.8: Encrypt Trip Replay Data at Rest with AES-256

As a **system**,
I want **trip replay data encrypted at rest using AES-256**,
So that **stored location data is protected even if the database is compromised**.

**Acceptance Criteria:**

**Given** trip replay opt-in is enabled (Story 8.2)
**When** location data is written to MongoDB
**Then** MongoDB encryption at rest is configured:
  - Encryption method: AES-256-CBC
  - Key management: MongoDB Atlas auto-managed keys or AWS KMS
  - Encrypted fields: `coordinates`, `heading`, `speed` (PII location data)
**And** database-level encryption is enabled:
  - MongoDB Atlas: Encryption at Rest enabled in cluster settings
  - Encryption applies to all data files, backups, and snapshots
**When** trip replay data is queried
**Then** decryption happens transparently (no application code changes needed)
**And** decryption is performed only by authenticated MongoDB connections
**When** database backups are created
**Then** backups are also encrypted with same AES-256 encryption
**And** backup encryption keys are stored separately from data

**Requirements Fulfilled:** NFR-S3 (AES-256 at rest)

---

### Story 8.9: Rotate Device IDs on Trip End to Prevent Cross-Trip Tracking

As a **system**,
I want **device IDs to rotate after each trip ends**,
So that **users cannot be tracked across multiple trips for behavioral profiling**.

**Acceptance Criteria:**

**Given** a trip has ended
**When** the trip end flow completes
**Then** a new device ID is generated for this device:
  - Format: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
  - Stored in localStorage: `device_id`
  - Replaces previous device ID
**And** the old device ID is marked as expired in backend:
  - Cannot be used to join new trips
  - Historical trips remain associated with old ID (for data subject rights)
**When** I join or create the next trip
**Then** the new device ID is used
**And** no server-side mapping exists between old and new IDs (true rotation)
**And** trip history is not linked across device IDs
**When** I request data access (Story 8.5)
**Then** data export only includes current device ID's trips
**And** previous device IDs cannot be queried (unless explicit consent given)

**Requirements Fulfilled:** NFR-S13 (device ID rotation)

---

## Epic 8 Summary

**Stories Created:** 9
**Requirements Covered:**
- FRs: FR39, FR40, FR42, FR43, FR44, FR45, FR55 (7 FRs, FR55 shared with Epic 9)
- NFRs: NFR-S1, NFR-S3, NFR-S10, NFR-S11, NFR-S12, NFR-S13, NFR-S19, NFR-S22

**Epic 8 Status:** ✅ Complete

---

## Epic 9: Post-Trip Experience & Replay

**Goal:** Provide users with trip summaries, optional replay storage, social sharing, and attribution tracking for post-ride engagement.

**User Outcome:** Users can review trip statistics, opt-in to save 7-day replay, share achievements on social media, and provide product feedback through attribution surveys.

---

### Story 9.1: Display Trip Summary Screen with Statistics

As a **rider**,
I want **to see a trip summary screen with route map, distance, time, speed, and group stats**,
So that **I can review my ride and share achievements**.

**Acceptance Criteria:**

**Given** a trip has ended (Story 6.5)
**When** the trip end confirmation is dismissed
**Then** the post-trip summary screen displays with:
  - **Header**: "Trip Complete!"
  - **Map View**: Route visualization showing start/end points and path traveled
  - **Personal Stats** card:
    - Total Distance: "X.X km"
    - Riding Time: "Xh Xm"
    - Max Speed: "X km/h"
    - Avg Speed: "X km/h"
  - **Group Stats** card:
    - Group Size: "X riders"
    - Group Distance: "X.X km" (furthest rider)
    - Longest Separation: "X.X km"
  - **Action Buttons**:
    - "Share Trip" (blue, 120px)
    - "Save Replay" (green, 120px, if not already opted-in)
    - "Back to Home" (gray, 80px)
**And** all statistics are calculated from trip data:
  - Distance: sum of coordinate-to-coordinate distances (Haversine formula)
  - Time: difference between first and last location update
  - Max/Avg speed: derived from GPS speed readings
**And** if no GPS data is available (disconnected entire trip), stats show "—"
**When** the screen loads
**Then** an attribution survey modal appears (Story 9.4)

**Requirements Fulfilled:** FR54

---

### Story 9.2: Opt-In to Save Trip Replay (Duplicate Check from Epic 8)

As a **rider**,
I want **to opt-in to save trip replay for 7 days from the post-trip screen**,
So that **I can access my trip history later if I didn't opt-in during trip end**.

**Acceptance Criteria:**

**Given** I did not opt-in to replay storage during trip end (Epic 8, Story 8.2)
**When** I view the trip summary screen (Story 9.1)
**Then** a "Save Replay" button is visible and enabled
**When** I tap "Save Replay"
**Then** the same opt-in modal from Epic 8 (Story 8.2) appears:
  - Consent checkboxes
  - 7-day retention explanation
  - "Save" and "Don't Save" buttons
**When** I opt-in
**Then** trip data is saved to MongoDB time-series collection (if not already saved)
**And** TTL index is applied for 7-day deletion
**And** confirmation toast: "Trip replay saved for 7 days"
**When** I already opted-in during trip end
**Then** "Save Replay" button is hidden
**And** a message displays: "Replay already saved (expires in X days)"

**Requirements Fulfilled:** FR55 (shared with Epic 8)

---

### Story 9.3: Share Trip Replay Link via Social Media

As a **rider**,
I want **to share my trip replay link on social media or messaging apps**,
So that **I can show my riding achievements to friends and followers**.

**Acceptance Criteria:**

**Given** I have opted-in to trip replay storage (Story 9.2)
**When** I tap "Share Trip" on the post-trip summary screen
**Then** a share modal appears with options:
  - **Public Replay Link**: `https://syncride.app/replay/[tripCode]` (shareable URL)
  - **Share Options**:
    - Social media: Instagram, Facebook, Twitter (opens native share sheet with pre-filled text)
    - Messaging: WhatsApp, SMS
    - Copy Link
  - **Preview**: Thumbnail of trip route map (640x480px)
  - **Pre-filled message**: "Check out my ride! X.X km in Xh Xm 🏍️ [link]"
**When** I tap a social share option
**Then** the native share sheet opens with:
  - Trip statistics
  - Route map thumbnail
  - Replay link
**When** someone opens the shared replay link
**Then** a public replay viewer page loads showing:
  - Anonymous trip (rider names hidden, only "Rider 1", "Rider 2")
  - Route playback with time slider
  - Aggregate statistics (distance, time, max speed)
  - "Download SyncRide" CTA button
**And** public replay is read-only (no personal data exposed)
**And** replay link expires after 7 days (same as storage TTL)

**Requirements Fulfilled:** FR56

---

### Story 9.4: Display Attribution Survey on Trip End

As a **product team**,
I want **to show a brief attribution survey asking how users heard about SyncRide**,
So that **we can track marketing effectiveness and user acquisition channels**.

**Acceptance Criteria:**

**Given** a trip has ended and the post-trip summary is displayed (Story 9.1)
**When** the summary screen loads
**Then** an attribution survey modal appears (max frequency: once per device):
  - Title: "How did you hear about SyncRide?"
  - Options (single select):
    - 🔍 Google Search
    - 📱 Social Media (Instagram, Facebook, Twitter)
    - 👥 Friend/Word of Mouth
    - 🏍️ Motorcycle Community/Forum
    - 📰 News Article/Blog
    - 🎙️ Podcast/YouTube
    - 🚫 Other
  - Optional text field: "Tell us more (optional)"
  - Buttons: "Submit" (blue, 120px), "Skip" (gray, 80px)
**When** I select an option and tap "Submit"
**Then** the response is saved to analytics:
  - `deviceId` (hashed)
  - `attributionSource`: selected option
  - `attributionDetails`: optional text
  - `timestamp`
  - `tripCode` (anonymized after 7 days)
**And** modal dismisses with toast: "Thank you for your feedback!"
**When** I tap "Skip"
**Then** modal dismisses without saving response
**And** survey doesn't appear again for this device (stored in localStorage: `attribution_survey_completed: true`)
**And** survey appearance is logged for completion rate tracking

**Requirements Fulfilled:** FR57

---

### Story 9.5: Export Trip Summary for Social Media Posting

As a **rider**,
I want **to export a shareable trip summary image for social media**,
So that **I can post my ride achievements without sharing the replay link**.

**Acceptance Criteria:**

**Given** I am on the post-trip summary screen (Story 9.1)
**When** I tap "Export Summary" (next to "Share Trip" button)
**Then** a shareable image is generated (1080x1920px portrait, social media optimized):
  - **Top Section**: SyncRide logo and branding
  - **Map Section**: Route visualization (60% of image)
  - **Stats Section**: Personal and group statistics with icons
  - **Bottom Section**: "Track your rides with SyncRide" + QR code to download app
  - **Style**: High-contrast design, dark background, readable at small sizes
**And** the image is rendered using canvas or HTML-to-image library
**When** rendering completes
**Then** options appear:
  - "Save to Photos" (downloads image)
  - "Share Now" (opens native share sheet with image)
  - "Copy Image"
**When** I tap "Save to Photos"
**Then** the image downloads with filename: `syncride-trip-[date].png`
**And** a toast confirms: "Saved to downloads"
**When** I tap "Share Now"
**Then** native share sheet opens with the image attached
**And** I can select any app (Instagram Stories, Facebook, Twitter)

**Requirements Fulfilled:** FR58

---

### Story 9.6: View Trip History (Within 7-Day Window)

As a **rider**,
I want **to view my trip history if replay storage was enabled**,
So that **I can revisit past rides within the 7-day window**.

**Acceptance Criteria:**

**Given** I have opted-in to trip replay for previous trips (Story 9.2)
**When** I navigate to Settings → "Trip History"
**Then** a list of saved trips appears (reverse chronological order):
  - Trip date and time
  - Trip duration
  - Distance traveled
  - Thumbnail of route map
  - Days remaining until expiration: "Expires in X days"
**And** only trips within the 7-day window are shown
**And** trips older than 7 days are automatically hidden (TTL deletion, Story 8.3)
**When** I tap a trip entry
**Then** the trip replay viewer opens showing:
  - Full route map
  - Time slider to scrub through ride
  - Playback controls: Play/Pause, Speed (1x, 2x, 4x)
  - Rider positions animated along route
  - Statistics panel (distance, time, speed)
**When** I tap "Delete Trip" in replay viewer
**Then** a confirmation appears: "Delete this trip replay? This cannot be undone."
**When** confirmed, the trip replay is immediately deleted from MongoDB
**And** the trip is removed from history list

**Requirements Fulfilled:** FR60

---

## Epic 9 Summary

**Stories Created:** 6
**Requirements Covered:**
- FRs: FR54, FR55, FR56, FR57, FR58, FR59, FR60 (7 FRs, FR59 shared with Epic 8)
- NFRs: NFR-SC11 (time-series downsampling for replay)

**Epic 9 Status:** ✅ Complete

---

## Epic 10: Accessibility & Glove-Friendly Usability

**Goal:** Ensure the app is fully accessible and usable while riding with gloves through WCAG 2.1 Level AA compliance, glance mode, keyboard navigation, and screen reader support.

**User Outcome:** All users can safely operate the app with gloves, access high-contrast glance mode at speed, use keyboard shortcuts on desktop, and leverage screen readers for observer mode.

---

### Story 10.1: Implement Glove-Friendly Touch Targets (Minimum 80x80px)

As a **rider with gloves**,
I want **all interactive elements to have minimum 80x80px touch targets**,
So that **I can reliably tap buttons while wearing motorcycle gloves**.

**Acceptance Criteria:**

**Given** all UI components are implemented
**When** I measure interactive element sizes
**Then** all buttons, links, and tappable elements meet minimum size:
  - Standard buttons: 80x80px minimum (exceeds WCAG 44x44px)
  - Primary actions (Create Trip, Join Trip): 120px height, full width
  - Critical actions (SOS, End Trip): 120-160px (extra large)
  - Navigation tabs: 60px height, equal width distribution
  - FAB buttons: 80px diameter
  - Input fields: 80px height
  - Rider markers: 60px visual + 40px invisible padding = 100px total tap target
**And** spacing between interactive elements is minimum 8px to prevent mis-taps
**When** glove usability testing is performed (12mm neoprene, leather gauntlets, winter gloves)
**Then** core user flows achieve >90% success rate:
  - Create trip: tap success rate >90%
  - Join trip: tap success rate >90%
  - Send voice status: tap success rate >90%
  - Trigger SOS: tap success rate >90%
**And** test results are documented in accessibility audit report

**Requirements Fulfilled:** FR67, NFR-A5, NFR-A6, NFR-A7 (>90% glove success rate), NFR-U1

---

### Story 10.2: Implement High-Contrast Glance Mode

As a **rider**,
I want **to access high-contrast glance mode for improved visibility at speed**,
So that **I can read critical information during quick 1-2 second glances while riding**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** I tap the "Glance Mode" toggle in floating controls (top-left FAB)
**Then** glance mode is activated with visual changes:
  - Background: pure black (#000000)
  - Text: pure white (#FFFFFF)
  - Contrast ratio: 21:1 (exceeds WCAG AAA 7:1)
  - Font sizes increase:
    - Nearest rider distance: 4rem (glance-lg)
    - Rider status: 3rem (glance-base)
    - Group spread: hidden (info overload reduction)
  - Bottom status bar height: increases from 15vh to 25vh
  - Map opacity: 80% (dimmed to emphasize status bar)
  - Only essential info shown: nearest rider name + distance
**And** motion-state detection can auto-enable glance mode:
  - When speed >20 km/h detected (via GPS + accelerometer)
  - Auto-enable after 30 seconds of continuous motion
  - Auto-disable when stationary for 15 seconds
**And** manual toggle always overrides auto-detection
**When** I toggle glance mode off
**Then** UI returns to normal colors and sizes with 300ms fade transition
**And** glance mode preference is saved to localStorage

**Requirements Fulfilled:** FR68, UX-DR36, UX-DR37, UX-DR38, UX-DR39, NFR-A4 (7:1 contrast), NFR-U5 (readable at-a-glance), NFR-U6 (high-contrast colors)

---

### Story 10.3: Implement Audio Narration for Group Status

As a **rider**,
I want **audio narration of group status for hands-free awareness**,
So that **I can stay informed without looking at my phone**.

**Acceptance Criteria:**

**Given** I have enabled audio narration in Settings → Accessibility
**When** significant group events occur
**Then** audio announcements are spoken via Web Speech API (Text-to-Speech):
  - Rider joins: "Rider [Name] joined the trip"
  - Rider leaves: "Rider [Name] left the trip"
  - SOS alert: "Emergency alert from [Name], [distance] away"
  - Falling behind: "You are [distance] behind the group"
  - Approaching rider: "[Name] is [distance] ahead"
  - Low battery: "Battery at 10%. Consider ending trip."
**And** narration respects motion state:
  - While moving (>20 km/h): only critical alerts (SOS, low battery)
  - While stationary: all events narrated
**And** narration works with helmet Bluetooth systems (Sena, Cardo):
  - Audio routes to Bluetooth audio output if connected
  - Volume adjustable in Settings (low, medium, high)
**And** visual alternatives accompany audio:
  - Toast notifications appear with same text
  - Ensures accessibility for hearing-impaired users
**When** Web Speech API is unsupported
**Then** audio narration is disabled gracefully
**And** Settings shows: "Audio narration not available on this device"

**Requirements Fulfilled:** FR69, NFR-U10 (helmet Bluetooth support), NFR-A9 (visual alternatives)

---

### Story 10.4: Implement Keyboard Navigation for Desktop Observer Mode

As a **desktop user** (observer mode),
I want **to navigate the interface using keyboard shortcuts**,
So that **I can manage trips efficiently without mouse interaction**.

**Acceptance Criteria:**

**Given** I am using SyncRide on desktop (viewport ≥1024px)
**When** keyboard navigation is enabled
**Then** all interactive elements are reachable via Tab key:
  - Tab order: Map controls → Member list → Settings → Bottom nav → FABs
  - Shift+Tab: reverse tab order
  - Focus indicators: 2px solid blue ring with 2px offset (highly visible)
**And** keyboard shortcuts are available:
  - **ESC**: Close any open modal/sheet
  - **Space**: Play/Pause trip replay (if on replay screen)
  - **G**: Toggle Group View (auto-zoom to fit all riders)
  - **M**: Open/close Member List
  - **/** (forward slash): Focus search/filter in Member List
  - **Arrow Keys**: Navigate member list items when focused
  - **Enter**: Activate focused button/link
**And** keyboard shortcuts are documented in Settings → Keyboard Shortcuts
**When** I press Tab repeatedly
**Then** focus moves logically through interactive elements
**And** focus is never trapped (can always escape via Tab or ESC)
**And** currently focused element is clearly visible (focus ring)

**Requirements Fulfilled:** FR70, NFR-A8 (keyboard navigation support), UX-DR31 (logical tab order)

---

### Story 10.5: Respect Reduced Motion Preferences

As a **user with motion sensitivity**,
I want **the app to respect my reduced motion preferences**,
So that **I don't experience discomfort from animations**.

**Acceptance Criteria:**

**Given** I have enabled "Reduce Motion" in my OS accessibility settings
**When** the app loads
**Then** the system detects the preference via CSS media query:
  - `@media (prefers-reduced-motion: reduce)`
**And** all animations are disabled or simplified:
  - No pulsing animations on markers (static colors only)
  - No slide/fade transitions (instant show/hide)
  - No smooth scrolling (instant scroll jumps)
  - No marker movement interpolation (teleport to new position)
  - No bottom sheet slide animations (instant open/close)
**And** essential motion for functionality is retained:
  - Map pan/zoom (user-controlled, not auto-animated)
  - Loading spinners (necessary for feedback)
**When** reduced motion is not set (default)
**Then** full animations are enabled as designed
**And** users can manually disable animations in Settings → Accessibility
**And** manual setting overrides system preference

**Requirements Fulfilled:** FR71, UX-DR46 (prefers-reduced-motion support)

---

### Story 10.6: Implement Screen Reader Support for Observer Mode

As a **visually impaired user** (observer mode),
I want **full screen reader support with VoiceOver (iOS) and TalkBack (Android)**,
So that **I can monitor trip progress through audio descriptions**.

**Acceptance Criteria:**

**Given** I am using a screen reader (VoiceOver or TalkBack)
**When** I navigate the app
**Then** all UI elements have proper ARIA attributes:
  - `role` attributes: button, link, navigation, region, alert
  - `aria-label`: descriptive labels for icons and images
  - `aria-expanded`: state for collapsible elements (member list sheet)
  - `aria-hidden`: decorative elements excluded from reading order
  - `aria-live="polite"`: status updates announced
  - `aria-live="assertive"`: critical alerts announced immediately (SOS)
**And** dynamic content is announced:
  - New rider joins: "Rider [Name] joined"
  - Location updates: "Rider [Name] is now [distance] away"
  - SOS alerts: "Emergency alert from [Name]" (immediate interruption)
  - Connection status: "Reconnecting, attempt 2 of 5"
**And** screen reader navigation order is logical:
  - Header/Title → Main content (map) → Member list → Bottom nav → Settings
**And** all buttons have descriptive labels:
  - Not: "Button" → Instead: "Create trip button"
  - Not: "Icon" → Instead: "Voice status button, tap to record"
**When** I interact with the map
**Then** rider markers announce: "[Rider Name], [distance] away, [status]"
**And** map controls announce: "Zoom in button", "Center on group button"

**Requirements Fulfilled:** FR72, NFR-A14, NFR-A15, UX-DR33, UX-DR34 (VoiceOver/TalkBack compatibility)

---

### Story 10.7: Implement Visible Focus Indicators for All Interactive Elements

As a **keyboard user**,
I want **clear visible focus indicators on all interactive elements**,
So that **I always know which element is currently focused**.

**Acceptance Criteria:**

**Given** all interactive elements are implemented
**When** I navigate using Tab key
**Then** focused elements display a prominent focus ring:
  - Style: 2px solid border
  - Color: primary blue (#3B82F6)
  - Offset: 2px outset (separates from element edge)
  - Border-radius: matches element shape
**And** focus indicators are visible in all themes:
  - Standard mode: blue ring (#3B82F6)
  - Glance mode: white ring (#FFFFFF) for contrast on black background
**And** focus indicators are never hidden by CSS (`outline: none` is forbidden)
**And** custom focus styles replace default browser outlines consistently
**When** I focus on buttons
**Then** button also receives hover state styling (scale, shadow)
**And** focus is distinct from hover (focus ring vs shadow)
**When** I focus on input fields
**Then** input receives focus ring and label animates (if applicable)
**And** placeholder text becomes more visible

**Requirements Fulfilled:** UX-DR32 (2px solid blue ring with 2px offset), NFR-A8, NFR-A11 (consistent UI patterns)

---

### Story 10.8: Ensure WCAG 2.1 Level AA Compliance Across All Components

As a **product team**,
I want **the entire app to meet WCAG 2.1 Level AA compliance**,
So that **the app is accessible to users with disabilities and meets legal standards**.

**Acceptance Criteria:**

**Given** all features are implemented
**When** accessibility audit is performed
**Then** the app meets all WCAG 2.1 Level AA success criteria:
  - **1.4.3 Contrast (Minimum)**: All text meets 4.5:1 contrast ratio (verified via tools)
  - **1.4.5 Images of Text**: No text embedded in images (except trip QR code, which is functional)
  - **1.4.10 Reflow**: Content functional at 200% zoom without horizontal scroll
  - **2.1.1 Keyboard**: All functionality accessible via keyboard
  - **2.1.2 No Keyboard Trap**: Focus can always escape
  - **2.4.3 Focus Order**: Logical tab order throughout app
  - **2.4.7 Focus Visible**: All focused elements have visible indicator
  - **2.5.5 Target Size**: All interactive elements ≥44x44px (we exceed with 80x80px)
  - **3.2.1 On Focus**: Focusing elements doesn't change context
  - **3.2.2 On Input**: Input doesn't trigger context change without warning
  - **3.3.1 Error Identification**: Errors described in text, not color-only
  - **3.3.2 Labels or Instructions**: All inputs have visible labels
**And** automated accessibility testing passes:
  - Axe DevTools: 0 violations
  - Lighthouse Accessibility score: ≥95
  - WAVE tool: 0 errors
**And** manual testing confirms:
  - Screen reader usability (VoiceOver, TalkBack)
  - Keyboard-only navigation successful
  - Color contrast verified with colorimeter
**And** accessibility statement is published at `/accessibility`

**Requirements Fulfilled:** NFR-A1, NFR-A2, NFR-A3, NFR-A11, NFR-A12, NFR-A13, UX-DR7 (WCAG 2.1 Level AA)

---

## Epic 10 Summary

**Stories Created:** 8
**Requirements Covered:**
- FRs: FR67, FR68, FR69, FR70, FR71, FR72 (6 FRs)
- UX Design: UX-DR7, UX-DR31, UX-DR32, UX-DR33, UX-DR34, UX-DR36, UX-DR37, UX-DR38, UX-DR39, UX-DR46
- NFRs: NFR-A1 through NFR-A15, NFR-U1, NFR-U5, NFR-U6, NFR-U7, NFR-U10

**Epic 10 Status:** ✅ Complete

---

**Epic 7 Status:** ✅ Complete

---

**Epic 5 Status:** ✅ Complete

---

**Epic 3 Status:** ✅ Complete

---

**Epic 1 Status:** ✅ Complete

---

### FR Coverage Map

**Trip Creation & Joining (Epic 2):**
- FR1: Trip hosts can create ephemeral trip sessions with auto-generated 6-digit alphanumeric codes
- FR2: Trip hosts can share trip codes via system share sheet (WhatsApp, SMS, clipboard)
- FR3: Riders can join trips by entering trip code with optional display name (no signup required)
- FR37: Users can opt-in to location data collection with explicit consent modal
- FR38: Users can view data retention policy before joining trips
- FR41: Users can view and accept Terms of Service including SOS limitations and distraction disclaimers
- FR61: The system can request and manage background GPS location permission on iOS and Android
- FR62: The system can request and manage lock-screen access permission for SOS button
- FR63: The system can request and manage push notification permission
- FR65: The system can function as Progressive Web App with Add to Home Screen capability
- FR66: The system can detect and handle platform capability constraints (graceful degradation if PWA features unavailable)

**Real-Time Location Sharing & Map Visualization (Epic 3):**
- FR11: Riders can share their GPS location in real-time with all trip participants
- FR12: Riders can view live location of all trip participants on synchronized map
- FR13: The system can broadcast location updates to trip participants with sub-second latency
- FR14: Riders can see visual indicators differentiating stopped vs moving riders
- FR15: The system can detect and display rider motion state (stationary, predictable, dynamic)
- FR16: The system can optimize GPS polling frequency based on rider motion state (adaptive polling)
- FR17: Riders can see last-seen timestamps for each trip participant
- FR18: The system can detect disconnected riders using location update expiration
- FR19: Riders can see visual decay indicators showing staleness of location data
- FR20: Riders can view Group View that auto-zooms map to fit all riders in viewport
- FR25: Riders can see rider avatars on map with color-coding and display name labels

**Group Awareness & Coordination Tools (Epic 4):**
- FR21: Riders can see nearest rider distance calculated continuously and displayed with color-coding
- FR22: Riders can see group spread indicator showing maximum distance between any two riders
- FR23: Riders can access member list showing online/offline status for all participants
- FR24: Riders can tap individual riders in member list to center map on their location
- FR26: Riders can see status icons on rider avatars indicating current state (fuel, break, mechanical, emergency)
- FR27: The system can calculate and display ETA for separated riders to rejoin group

**Safety Communication - SOS & Voice Status (Epic 5):**
- FR28: Riders can broadcast one-tap SOS emergency alerts to all trip participants
- FR29: Riders can access SOS button from lock screen (if platform permits)
- FR30: Riders can send voice status updates using tap-to-speak interface
- FR31: The system can transcribe voice to text using speech-to-text recognition (English + Hindi)
- FR32: Riders can send predefined status messages via large button interface ("Need gas", "Taking break", "Mechanical issue", "Medical emergency")
- FR33: Riders can receive haptic proximity alerts with distinct vibration patterns (rider ahead, falling behind, SOS received)
- FR34: Riders can share exact coordinates with support vehicles or emergency contacts
- FR35: Riders can receive push notifications for critical events when app is backgrounded (SOS, trip end)
- FR36: The system can display distraction warnings on first launch and before SOS use

**Trip Host Management Controls (Epic 6):**
- FR4: Trip hosts can view list of all joined riders with display names and join timestamps
- FR5: Trip hosts can kick riders from active trips
- FR6: Trip hosts can expire and rotate trip codes to prevent new joins
- FR7: Trip hosts can ban device IDs from rejoining trips
- FR8: Trip hosts can end trips manually, triggering data deletion
- FR9: The system can auto-end trips after 12 hours or at 10% battery level
- FR10: Riders can leave trips voluntarily before trip end

**Dead Zone Resilience & Offline Handling (Epic 7):**
- FR46: The system can buffer location updates client-side during network loss
- FR47: Riders can see "reconnecting" status indicators during network interruptions
- FR48: The system can replay buffered location trail with animation on reconnection
- FR49: Riders can see faint dotted lines showing rider paths through dead zones
- FR50: The system can automatically reconnect using exponential backoff after network restoration
- FR51: Riders can see "last known position" indicators when other riders are disconnected
- FR52: The system can batch upload buffered coordinates when connectivity restores
- FR53: Riders can continue using app in offline mode with degraded functionality (map remains functional, updates queued)

**Privacy, Data Lifecycle & Compliance (Epic 8):**
- FR39: The system can delete live location data automatically on trip end
- FR40: Users can opt-in to 7-day trip replay storage with explicit consent prompt
- FR42: The system can enforce 7-day hard delete for trip replay data using database-level TTL
- FR43: Users can receive data deletion confirmation after trip end
- FR44: Users can access data subject rights (access, correction, deletion, portability) per DPDP Act
- FR45: The system can log consent events for regulatory compliance auditing

**Post-Trip Experience & Replay (Epic 9):**
- FR54: Riders can view trip summary screen showing route map, total distance, riding time, max speed, and group stats
- FR55: Riders can opt-in to save trip replay for 7 days with explicit consent
- FR56: Riders can share trip replay link via social media or messaging apps
- FR57: Riders can complete attribution survey identifying how they heard about SyncRide
- FR58: Riders can export trip summary for social media posting
- FR59: The system can display data deletion confirmation message after trip end
- FR60: Riders can view trip history if replay storage was enabled (within 7-day window)

**Accessibility & Glove-Friendly Usability (Epic 10):**
- FR67: Riders can interact with core features while wearing motorcycle gloves (6mm minimum touch targets)
- FR68: Riders can access high-contrast glance mode for improved visibility at speed
- FR69: Riders can receive audio narration of group status for hands-free awareness
- FR70: Riders can navigate interface using keyboard (desktop observer mode)
- FR71: The system can respect user's reduced motion preferences (disable animations)
- FR72: The system can provide screen reader support for observer mode users

**Coverage Summary:**
- Total FRs: 72
- Epic 1 (Foundation): 0 FRs (31 Architecture + 13 UX Design + 14 Maintainability NFRs)
- Epic 2 (Trip Creation): 11 FRs
- Epic 3 (Real-Time Location): 11 FRs
- Epic 4 (Group Awareness): 6 FRs
- Epic 5 (Safety Communication): 9 FRs
- Epic 6 (Host Management): 7 FRs
- Epic 7 (Dead Zone Resilience): 8 FRs
- Epic 8 (Privacy & Data): 6 FRs
- Epic 9 (Post-Trip): 7 FRs
- Epic 10 (Accessibility): 6 FRs
- **Total Coverage: 72/72 FRs (100%)**

---

## Epic List

### Epic 1: Foundation & Development Environment

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

### Epic 2: Trip Creation & Joining

**Goal:** Enable users to create ephemeral trip sessions, share trip codes via multiple channels, and join existing trips with proper consent flows and platform permissions.

**User Outcome:** Users can create trips, share trip codes (WhatsApp/SMS/clipboard), and join groups within seconds with zero signup friction while understanding data collection and retention policies.

**FRs Covered:** FR1, FR2, FR3, FR37, FR38, FR41, FR61, FR62, FR63, FR65, FR66 (11 total)

**UX Design Requirements:**
- UX-DR18: TripCodeDisplay component (large monospace code, QR code, share options)
- UX-DR22: Sheet component customization (member list bottom drawer)
- UX-DR24: Button component customization (glove-friendly sizes, haptic feedback)
- UX-DR26: Input component customization (80px height, 1.5rem text, voice icon)
- UX-DR27: Mobile rider view implementation (full-screen map, bottom sheet overlays)

**Key Stories:**
- Create trip with auto-generated 6-digit code
- Share trip code via system share sheet
- Join trip by entering code with optional display name
- Display Terms of Service and consent modals
- Request and manage platform permissions (GPS, notifications, lock-screen)
- Handle PWA capability detection and graceful degradation

**NFRs Addressed:**
- NFR-P6 to NFR-P9: Initial load performance (FCP <1.5s, LCP <2.5s, TTI <3.5s)
- NFR-S6: Cryptographically random trip codes (2.1B combinations)
- NFR-A5 to NFR-A6: Glove-friendly touch targets (80x80px minimum)

---

### Epic 3: Real-Time Location Sharing & Map Visualization

**Goal:** Implement the core value proposition - real-time location broadcasting with sub-500ms P95 latency and synchronized map visualization with live rider positions.

**User Outcome:** Users can share GPS location in real-time and view all trip participants on a live map with smooth animations, motion state detection, and connection status indicators.

**FRs Covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25 (11 total)

**UX Design Requirements:**
- UX-DR14: RiderMarker component (status ring animations, live/stale/disconnected states)
- UX-DR17: BottomStatusBar component (nearest rider display, glance mode adaptive sizing)
- UX-DR28: Tablet split-view (map 66%, member list sidebar 34%)
- UX-DR29: Desktop management view (map 60%, enhanced sidebar 40%)
- UX-DR43: Rider marker animations (green pulse, yellow fade, scale pulse for SOS)
- UX-DR44: Smooth avatar movement interpolation (no teleportation jumps)

**Key Stories:**
- Real-time GPS location capture and broadcasting
- WebSocket location update streaming with differential payloads
- Mapbox GL JS integration with rider marker rendering
- Adaptive GPS polling based on motion state detection
- Connection status detection with TTL-based presence
- Last-seen timestamp and staleness decay indicators
- Group View auto-zoom to fit all riders
- Avatar color-coding and display name labels

**NFRs Addressed:**
- NFR-P1 to NFR-P5: Real-time latency (P95 <500ms, P99 <1s, delivery rate >99.5%)
- NFR-P10 to NFR-P12: Runtime performance (60fps map rendering, <100ms state updates)
- NFR-P13 to NFR-P16: Battery efficiency (adaptive GPS polling, <20% drain per 2hr trip)
- NFR-SC1 to NFR-SC3: Scalability (100 concurrent trips, 10K geospatial queries/sec)

---

### Epic 4: Group Awareness & Coordination Tools

**Goal:** Provide riders with continuous group cohesion monitoring through nearest rider distance, group spread metrics, and interactive member list.

**User Outcome:** Users can instantly assess group status, see who's nearby or falling behind, tap members to center on their location, and monitor overall group spread.

**FRs Covered:** FR21, FR22, FR23, FR24, FR26, FR27 (6 total)

**UX Design Requirements:**
- UX-DR20: MemberListSheet component (swipeable bottom drawer, 80px touch targets per rider)
- UX-DR22: Sheet component customization for member list (backdrop opacity, swipe gestures)

**Key Stories:**
- Nearest rider distance calculation with color-coding
- Group spread indicator (max distance between any two riders)
- Member list with online/offline status
- Tap-to-center-on-rider functionality
- Status icons for rider states (fuel, break, mechanical, emergency)
- ETA calculation for separated riders to rejoin

**NFRs Addressed:**
- NFR-P3: Redis geospatial queries <100ms at P95
- NFR-SC2: Handle 10,000 geospatial queries per second

---

### Epic 5: Safety Communication (SOS & Voice Status)

**Goal:** Enable critical safety communication through one-tap SOS broadcasts, voice status updates with STT, and haptic proximity alerts.

**User Outcome:** Users can send emergency alerts, broadcast voice status messages (English + Hindi), use predefined status buttons, and receive haptic feedback for proximity and emergencies.

**FRs Covered:** FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36 (9 total)

**UX Design Requirements:**
- UX-DR15: VoiceInputFAB component (tap-to-speak, recording states, confirmation)
- UX-DR16: SOSButton component (long-press activation, expanded state, bottom-third takeover)
- UX-DR21: ConfirmationDialog component (giant buttons, haptic feedback)
- UX-DR23: Dialog component customization (120px primary, 80px secondary buttons)
- UX-DR40 to UX-DR42: Haptic feedback patterns (proximity alerts, interaction feedback, visual alternatives)

**Key Stories:**
- One-tap SOS broadcast with confirmation dialog
- Lock-screen SOS access (platform permitting)
- Voice input FAB with tap-to-speak interface
- Web Speech API integration (English + Hindi STT)
- Predefined status message buttons (large, glove-friendly)
- Haptic proximity alerts (distinct vibration patterns)
- Coordinate sharing with emergency contacts
- Push notification support for backgrounded app
- Distraction warnings on first launch

**NFRs Addressed:**
- NFR-U1 to NFR-U13: Motorcycle-specific usability (>90% glove success rate, >85% voice accuracy, haptic recognizability >80%)
- NFR-I4 to NFR-I6: Speech recognition (Web Speech API primary, Google Cloud STT fallback)
- NFR-I7 to NFR-I9: Platform APIs (background GPS, lock-screen access, push notifications)

---

### Epic 6: Trip Host Management Controls

**Goal:** Provide trip hosts with comprehensive management capabilities including participant oversight, access control, and trip lifecycle management.

**User Outcome:** Trip hosts can view all riders with join timestamps, kick misbehaving riders, ban device IDs, rotate trip codes, and end trips with proper data cleanup.

**FRs Covered:** FR4, FR5, FR6, FR7, FR8, FR9, FR10 (7 total)

**Key Stories:**
- Member list view with display names and join timestamps
- Kick rider functionality with server-side authorization
- Ban device ID to prevent rejoining
- Expire and rotate trip codes
- Manual trip end with data deletion trigger
- Auto-end trips after 12 hours or at 10% battery
- Rider voluntary leave functionality

**NFRs Addressed:**
- NFR-S7: Server-side authorization checks for host controls
- NFR-S8: Device ID ban enforcement across all rejoin mechanisms

---

### Epic 7: Dead Zone Resilience & Offline Handling

**Goal:** Maintain group coordination through network dead zones with client-side buffering, automatic reconnection, and visual trail replay.

**User Outcome:** Users stay connected through tunnels and remote areas with buffered location updates, transparent reconnection status, and animated trail replay on network restoration.

**FRs Covered:** FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53 (8 total)

**UX Design Requirements:**
- UX-DR19: ConnectionStatusBanner component (reconnection progress, retry indicators)
- UX-DR47: Loading states with visible spinners/progress indicators
- UX-DR48: Error states with clear recovery instructions

**Key Stories:**
- Client-side location buffering (IndexedDB, queue up to 1000 updates)
- Reconnecting status indicators during network loss
- Trail replay with animation on reconnection
- Dotted line visualization for dead zone paths
- Exponential backoff with jitter for reconnection
- Last-known position indicators for disconnected riders
- Batch upload of buffered coordinates
- Offline mode with degraded functionality (map functional, updates queued)

**NFRs Addressed:**
- NFR-R1 to NFR-R16: Reliability and availability (99.5% uptime, auto-reconnection, fault tolerance, <2% false positive disconnect rate, >90% trail replay accuracy)
- NFR-P4: Reconnection <5 seconds after network restoration

---

### Epic 8: Privacy, Data Lifecycle & Compliance

**Goal:** Implement transparent privacy controls with automatic data deletion, opt-in replay storage, and full DPDP/GDPR/PDPA compliance.

**User Outcome:** Users have full control over their location data with automatic deletion on trip end, explicit consent for 7-day replay, and accessible data subject rights.

**FRs Covered:** FR39, FR40, FR42, FR43, FR44, FR45 (6 total)

**Key Stories:**
- Auto-delete live location data on trip end (Redis TTL 30s)
- Opt-in 7-day trip replay with explicit consent prompt
- Database-level TTL enforcement (MongoDB time-series)
- Data deletion confirmation message display
- Data subject rights access portal (DPDP Act compliance)
- Consent event logging for regulatory auditing

**NFRs Addressed:**
- NFR-S1 to NFR-S22: Security and compliance (WSS encryption, AES-256 at rest, TTL enforcement, device ID rotation, DPDP/GDPR/PDPA compliance, consent logging)

---

### Epic 9: Post-Trip Experience & Replay

**Goal:** Provide users with trip summaries, optional replay storage, social sharing, and attribution tracking for post-ride engagement.

**User Outcome:** Users can review trip statistics, opt-in to save 7-day replay, share achievements on social media, and provide product feedback through attribution surveys.

**FRs Covered:** FR54, FR55, FR56, FR57, FR58, FR59, FR60 (7 total)

**Key Stories:**
- Trip summary screen (route map, distance, riding time, max speed, group stats)
- Opt-in trip replay storage (7-day with explicit consent)
- Share trip replay link (social media, messaging apps)
- Attribution survey completion
- Trip summary export for social media
- Data deletion confirmation message
- Trip history view (within 7-day window if replay enabled)

**NFRs Addressed:**
- NFR-S11: Hard delete after 7 days using MongoDB TTL indexes
- NFR-SC11: Time-series downsampling (1s first hour, 10s first day, 1min thereafter)

---

### Epic 10: Accessibility & Glove-Friendly Usability

**Goal:** Ensure the app is fully accessible and usable while riding with gloves through WCAG 2.1 Level AA compliance, glance mode, keyboard navigation, and screen reader support.

**User Outcome:** All users can safely operate the app with gloves, access high-contrast glance mode at speed, use keyboard shortcuts on desktop, and leverage screen readers for observer mode.

**FRs Covered:** FR67, FR68, FR69, FR70, FR71, FR72 (6 total)

**UX Design Requirements:**
- UX-DR31 to UX-DR35: Accessibility implementation (keyboard navigation, focus indicators, ARIA labels, screen reader support, focus trap management)
- UX-DR36 to UX-DR39: Motion-state adaptive UI (glance mode detection, conditional styling, manual override, smooth transitions)
- UX-DR45: Bottom sheet animations with swipe gesture support
- UX-DR46: Respect for prefers-reduced-motion preference

**Key Stories:**
- Glove-friendly interaction testing (12mm neoprene, leather gauntlets, winter gloves >90% success rate)
- High-contrast glance mode implementation (7:1 contrast ratio)
- Audio narration for group status (hands-free awareness)
- Keyboard navigation for desktop observer mode
- Reduced motion preference support
- Screen reader support (VoiceOver, TalkBack)

**NFRs Addressed:**
- NFR-A1 to NFR-A15: Accessibility compliance (WCAG 2.1 Level AA, 4.5:1 contrast minimum, 44x44px touch targets minimum, keyboard navigation, ARIA attributes, screen reader support)
