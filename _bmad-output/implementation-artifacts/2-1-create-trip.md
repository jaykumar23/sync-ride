---
story_id: "2.1"
story_key: "2-1-create-trip"
epic: "Epic 2: Trip Creation & Joining"
title: "Create Trip Session with Auto-Generated 6-Digit Code"
sprint: "Sprint 2"
status: "in-progress"
created_date: "2026-04-11"
priority: "Critical"
estimated_effort: "3-4 hours"
---

# Story 2.1: Create Trip Session with Auto-Generated 6-Digit Code

## Story

As a **trip host**,  
I want **to create a new trip with an automatically generated 6-digit alphanumeric code**,  
So that **I can quickly start a trip and share the code with my riding group**.

## Business Value

Foundation for all trip-related features. Without trip creation, no other Epic 2-10 features can function.

## Acceptance Criteria

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

**Requirements Fulfilled:** FR1, NFR-S6

---

## Tasks/Subtasks

### Task 1: Create Trip Mongoose Schema
- [x] Create `apps/api/src/models/Trip.ts`
- [x] Define Trip schema with fields: tripCode, hostId, createdAt, status, riders
- [x] Add TTL index for automatic deletion after 7 days
- [x] Export Trip model
- [x] Fixed duplicate index warning

### Task 2: Create trip code generator utility
- [x] Create `apps/api/src/utils/tripCode.ts`
- [x] Implement `generateTripCode()` using crypto.randomBytes
- [x] Generate 6-character uppercase alphanumeric (A-Z, 0-9, excluding ambiguous chars)
- [x] Add collision check against MongoDB

### Task 3: Create POST /api/trips endpoint
- [x] Create `apps/api/src/routes/trips.ts`
- [x] Implement POST /api/trips handler
- [x] Generate trip code, create MongoDB document
- [x] Cache trip code in Redis with 12-hour TTL (graceful fallback if Redis unavailable)
- [x] Return trip object with 201 status
- [x] Add GET /api/trips/:code endpoint for retrieval

### Task 4: Create frontend Trip page
- [x] Update `apps/web/src/App.tsx` with Create Trip button
- [x] Display trip code in large monospace (text-glance-lg)
- [x] Add "Create Trip" button using touch-lg height (120px)
- [x] Implement API call to create trip
- [x] Show trip code after creation
- [x] Add click-to-copy functionality
- [x] Create .env.example for frontend

---

## Dev Agent Record

### Implementation Plan

1. Created Trip Mongoose model with TTL index (7 days)
2. Implemented crypto-random trip code generator (6 chars, no ambiguous chars)
3. Created POST /api/trips endpoint with MongoDB + Redis caching
4. Built frontend Create Trip flow with glove-friendly UI

### Debug Log

- Fixed duplicate index warning by removing inline `index: true` from schema fields
- Redis graceful fallback working (trips still created without Redis)
- API tested successfully: trips PS27BZ and BTNFLY created

### Completion Notes

✅ **Story 2.1 Complete - 2026-04-11**

**Backend Implemented:**
- Trip model with 7-day TTL and proper indexes
- Crypto-random code generator (32 chars, excluding O,I,0,1)
- POST /api/trips → creates trip, returns 201
- GET /api/trips/:code → retrieves trip
- Redis caching (12-hour TTL, graceful fallback)

**Frontend Implemented:**
- Create Trip button (120px touch target)
- Trip code display (3rem glance-lg size)
- Click-to-copy functionality
- Device ID generation and storage

**Verified:**
- API returns valid trip codes (PS27BZ, BTNFLY)
- MongoDB persistence working
- Graceful Redis fallback
- Custom Tailwind tokens applied

---

## File List

- [x] `apps/api/src/models/Trip.ts`
- [x] `apps/api/src/utils/tripCode.ts`
- [x] `apps/api/src/routes/trips.ts`
- [x] `apps/api/src/index.ts` (modified - added trips router)
- [x] `apps/web/src/App.tsx` (modified - added Create Trip flow)
- [x] `apps/web/.env.example` (created)

---

## Status

**Current Status:** complete

**Status History:**
- 2026-04-11: Created and started (in-progress)
- 2026-04-11: Implementation complete (complete)
