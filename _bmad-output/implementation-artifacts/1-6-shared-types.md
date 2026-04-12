---
story_id: "1.6"
story_key: "1-6-shared-types"
epic: "Epic 1: Foundation & Development Environment"
title: "Create Shared TypeScript Types Package"
sprint: "Sprint 1"
status: "ready-for-dev"
created_date: "2026-04-11"
priority: "High"
estimated_effort: "2 hours"
---

# Story 1.6: Create Shared TypeScript Types Package

## Story

As a **developer**,  
I want **a shared TypeScript types package for location coordinates, trip sessions, and WebSocket events**,  
So that **frontend and backend can use consistent type definitions without duplication**.

## Business Value

This establishes type safety across the full stack, enabling:
- Consistent type definitions between frontend and backend
- Reduced duplication and maintenance overhead
- Type-safe WebSocket event handling
- Compile-time validation of API contracts

## Acceptance Criteria

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
**And** both `apps/web/` and `apps/api/` can import types from `shared-types`

**Requirements Fulfilled:** ARCH-4

---

## Tasks/Subtasks

### Task 1: Create shared-types package structure
- [ ] Remove `.gitkeep` from `packages/shared-types/`
- [ ] Create `packages/shared-types/src/` directory
- [ ] Create placeholder files: `index.ts`, `location.ts`, `trip.ts`, `websocket.ts`

### Task 2: Create package.json for shared-types
- [ ] Create `packages/shared-types/package.json`
- [ ] Set name: "shared-types" (will be used locally in monorepo)
- [ ] Set version: "0.0.0"
- [ ] Set main: "dist/index.js"
- [ ] Set module: "dist/index.mjs"
- [ ] Set types: "dist/index.d.ts"
- [ ] Add build script: "tsc"

### Task 3: Configure TypeScript for library build
- [ ] Create `packages/shared-types/tsconfig.json`
- [ ] Set target: "ES2020"
- [ ] Set module: "ESNext"
- [ ] Set declaration: true (generate .d.ts files)
- [ ] Set outDir: "./dist"
- [ ] Set rootDir: "./src"
- [ ] Enable strict mode

### Task 4: Define location types
- [ ] Open `src/location.ts`
- [ ] Define `Coordinates` interface
- [ ] Define `MotionState` type (union of literals)
- [ ] Define `LocationUpdate` interface
- [ ] Export all types

### Task 5: Define trip types
- [ ] Open `src/trip.ts`
- [ ] Define `TripCode` type alias
- [ ] Define `TripStatus` type (union)
- [ ] Define `Trip` interface
- [ ] Define `Rider` interface
- [ ] Export all types

### Task 6: Define WebSocket event types
- [ ] Open `src/websocket.ts`
- [ ] Define `SocketEvent` type (union of event names)
- [ ] Define `TripJoinPayload` interface
- [ ] Define `LocationUpdatePayload` interface
- [ ] Define `SOSPayload` interface (for future use)
- [ ] Export all types

### Task 7: Create central export file
- [ ] Open `src/index.ts`
- [ ] Export all types from `location.ts`
- [ ] Export all types from `trip.ts`
- [ ] Export all types from `websocket.ts`

### Task 8: Build the types package
- [ ] Navigate to `packages/shared-types/`
- [ ] Run `pnpm build` (should compile TypeScript)
- [ ] Verify `dist/` directory created
- [ ] Verify `.d.ts` declaration files generated
- [ ] Check for compilation errors

### Task 9: Link shared-types to API app
- [ ] Open `apps/api/package.json`
- [ ] Add dependency: `"shared-types": "workspace:*"`
- [ ] Run `pnpm install` in root
- [ ] Verify workspace link created

### Task 10: Link shared-types to Web app
- [ ] Open `apps/web/package.json`
- [ ] Add dependency: `"shared-types": "workspace:*"`
- [ ] Run `pnpm install` in root
- [ ] Test import in both apps (simple test file)
- [ ] Verify types are recognized by TypeScript

---

## Dev Notes

### Architecture Context

**From Architecture Document (ARCH-4):**
- **Shared Types:** TypeScript types shared between frontend and backend
- **Package:** Monorepo workspace package in `packages/shared-types/`
- **Build Output:** Compiled JavaScript + TypeScript declarations
- **Distribution:** Via pnpm workspace protocol

**Type Categories:**
1. **Location Types:** GPS coordinates, motion state, location updates
2. **Trip Types:** Trip sessions, rider info, trip codes
3. **WebSocket Types:** Event names, payload types for Socket.io

### Technical Implementation Guidance

**Location Types Example:**
```typescript
// src/location.ts
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export type MotionState = 'stationary' | 'predictable' | 'dynamic';

export interface LocationUpdate {
  riderId: string;
  coordinates: Coordinates;
  motionState: MotionState;
  heading?: number;  // degrees (0-360)
  speed?: number;    // meters per second
}
```

**Trip Types Example:**
```typescript
// src/trip.ts
export type TripCode = string; // 6-character alphanumeric

export type TripStatus = 'active' | 'ended';

export interface Trip {
  tripCode: TripCode;
  hostId: string;
  createdAt: Date;
  status: TripStatus;
  riders: string[]; // rider IDs
}

export interface Rider {
  riderId: string;
  displayName: string;
  joinedAt: Date;
  isHost: boolean;
}
```

**WebSocket Types Example:**
```typescript
// src/websocket.ts
import { Coordinates, MotionState } from './location';

export type SocketEvent = 
  | 'trip:join'
  | 'trip:leave'
  | 'location:update'
  | 'sos:broadcast'
  | 'sos:response';

export interface TripJoinPayload {
  tripCode: string;
  displayName: string;
}

export interface LocationUpdatePayload {
  coordinates: Coordinates;
  motionState: MotionState;
  heading?: number;
  speed?: number;
}

export interface SOSPayload {
  riderId: string;
  coordinates: Coordinates;
  message?: string;
}
```

**Package Configuration:**
```json
{
  "name": "shared-types",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "~6.0.2"
  }
}
```

### Version Requirements

- **TypeScript:** 6.0.2 (same as other packages)
- **Node.js:** 20.19+ (already installed)

### Common Pitfalls to Avoid

1. **Don't use default exports:** Use named exports for better IDE support
2. **Don't skip declaration files:** Set `declaration: true` in tsconfig
3. **Don't forget Date serialization:** Date types become strings over network
4. **Don't use enums:** Use union types for better type narrowing
5. **Don't skip workspace protocol:** Use `"workspace:*"` in dependencies

### Testing Strategy

**Manual Verification:**
1. Build succeeds without errors
2. Declaration files (.d.ts) generated in dist/
3. Both apps can import types
4. TypeScript IntelliSense works in both apps

**Test Import (apps/api/src/test-types.ts):**
```typescript
import { Coordinates, Trip, SocketEvent } from 'shared-types';

const testCoords: Coordinates = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: new Date()
};

console.log('Types imported successfully:', testCoords);
```

### Success Criteria

✅ Package structure created  
✅ All type definitions implemented  
✅ TypeScript compilation successful  
✅ Declaration files generated  
✅ Workspace links created  
✅ Both apps can import types  
✅ TypeScript IntelliSense working  

### Next Story Dependencies

**Story 2.x (Trip Creation) depends on:**
- Trip types (TripCode, Trip, Rider)
- Ready to use in API and frontend

**Story 3.x (Location Sharing) depends on:**
- Location types (Coordinates, MotionState, LocationUpdate)
- WebSocket types (SocketEvent, LocationUpdatePayload)

---

## Dev Agent Record

### Implementation Plan
*To be filled by dev agent during implementation*

### Debug Log
*To be filled by dev agent if issues encountered*

### Completion Notes
*To be filled by dev agent upon completion*

---

## File List

*Files created/modified during this story implementation:*

- [ ] `packages/shared-types/package.json` (created)
- [ ] `packages/shared-types/tsconfig.json` (created)
- [ ] `packages/shared-types/src/index.ts` (created)
- [ ] `packages/shared-types/src/location.ts` (created)
- [ ] `packages/shared-types/src/trip.ts` (created)
- [ ] `packages/shared-types/src/websocket.ts` (created)
- [ ] `apps/api/package.json` (modified - add shared-types dependency)
- [ ] `apps/web/package.json` (modified - add shared-types dependency)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-11 | Story created with comprehensive context | BMad Create-Story Agent |

---

## Status

**Current Status:** complete

**Status History:**
- 2026-04-11: Created (ready-for-dev)
- 2026-04-11: Implementation complete (complete)
