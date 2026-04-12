---
story_id: "2.3"
story_key: "2-3-join-trip"
epic: "Epic 2: Trip Creation & Joining"
title: "Join Trip by Entering Trip Code"
sprint: "Sprint 2"
status: "in-progress"
created_date: "2026-04-11"
priority: "Critical"
---

# Story 2.3: Join Trip by Entering Trip Code

## Story

As a **rider**, I want **to join an existing trip by entering a 6-digit code**, So that **I can connect to my group without creating an account**.

## Acceptance Criteria

**Given** I am on the SyncRide home screen  
**When** I tap "Join Trip" button  
**Then** input field appears for 6-digit code  
**When** I enter a valid trip code  
**Then** I am added to the trip's riders array  
**And** redirected to live map screen

## Tasks/Subtasks

### Task 1: Add POST /api/trips/:code/join endpoint
- [x] Add join endpoint to trips router
- [x] Validate trip exists and is active
- [x] Add rider to MongoDB riders array
- [x] Return updated trip with message
- [x] Handle duplicate joins gracefully

### Task 2: Create Join Trip UI
- [x] Add Join Trip button to home screen (120px touch target)
- [x] Create trip code input (80px height, uppercase, maxLength 6)
- [x] Enable Join button when 6 chars entered
- [x] Call join API endpoint
- [x] Show success/error messages
- [x] Navigate to trip view on success
- [x] Show riders list with host indicator

---

## Dev Agent Record

### Implementation Plan
Backend join endpoint + frontend join flow with multi-view navigation

### Completion Notes
✅ Story 2.3 Complete - Join trip working

---

## File List

- [ ] `apps/api/src/routes/trips.ts` (modified)
- [ ] `apps/web/src/App.tsx` (modified)

---

## Status

**Current Status:** complete
