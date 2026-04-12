---
story_id: "9.1"
story_key: "9-1-trip-summary"
epic: "Epic 9: Post-Trip Experience & Replay"
title: "Display Trip Summary Screen with Statistics"
status: "complete"
---

# Story 9.1: Display Trip Summary Screen with Statistics

## Story
As a **rider**, I want **to see a trip summary screen with route map, distance, time, speed, and group stats**, So that **I can review my ride and share achievements**.

## Acceptance Criteria
- [x] Trip summary screen displays after trip end confirmation
- [x] Header shows "Trip Complete!"
- [x] Personal stats card shows: distance, riding time, max speed, avg speed
- [x] Group stats card shows: group size, group distance, longest separation
- [x] Action buttons: "Share Trip", "Save Replay", "Back to Home"
- [x] Stats calculated from trip data using Haversine formula
- [x] Stats show "—" if no GPS data available
- [x] Attribution survey modal appears on load (Story 9.4)

## Tasks

### Task 1: Create Trip Statistics Service (Backend)
- [x] Create `apps/api/src/services/tripStats.ts`
- [x] Implement distance calculation using Haversine formula
- [x] Implement time calculation from location timestamps
- [x] Implement max/avg speed calculation from GPS data

### Task 2: Create Trip Summary API Endpoint
- [x] Add GET `/api/trips/:code/summary` endpoint
- [x] Return personal stats: distance, duration, maxSpeed, avgSpeed
- [x] Return group stats: riderCount, groupDistance, maxSeparation

### Task 3: Create TripSummary Component (Frontend)
- [x] Create `apps/web/src/components/TripSummary.tsx`
- [x] Display "Trip Complete!" header
- [x] Display personal stats card with icons
- [x] Display group stats card with icons
- [x] Display action buttons

### Task 4: Integrate TripSummary into Trip End Flow
- [x] Show TripSummary after trip end/leave
- [x] Store trip stats before clearing trip state
- [x] Pass stats to TripSummary component

---

## Dev Notes
- Uses existing location data from locationStore
- Haversine formula calculates distance between GPS coordinates
- Stats calculated client-side from buffered location history
- Integration with Epic 8 consent flow (already exists)

## File List
- apps/api/src/services/tripStats.ts (new)
- apps/api/src/routes/trips.ts (modified)
- apps/web/src/components/TripSummary.tsx (new)
- apps/web/src/App.tsx (modified)

## Status
**Current:** in-progress
