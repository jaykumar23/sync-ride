---
story_id: "8.1"
story_key: "8-1-redis-location-ttl"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Auto-Delete Live Location Data on Trip End (Redis TTL)"
status: "in-progress"
---

# Story 8.1: Auto-Delete Live Location Data on Trip End

## Story
As a **system**, I want **live location data automatically deleted from Redis within 30 seconds of trip end**, So that **privacy promises are technically enforced without manual cleanup**.

## Acceptance Criteria
- Location updates stored in Redis with format: `location:{tripCode}:{riderId}`
- Each key has 30-second TTL that refreshes with each update
- On trip end, all location keys for that trip are immediately deleted
- Verification check confirms deletion was successful
- Redis automatically expires keys after 30 seconds of no updates

## Tasks
### Task 1: Create location cache service
- [x] Create `apps/api/src/services/locationCache.ts`
- [x] Implement `cacheLocation(tripCode, riderId, location)` with 30s TTL
- [x] Implement `deleteAllTripLocations(tripCode)` for trip end cleanup
- [x] Implement `getTripLocations(tripCode)` for late-joining riders

### Task 2: Update location update handler to use cache
- [x] Modify WebSocket location:update handler to cache locations
- [x] Ensure TTL is refreshed with each update

### Task 3: Update trip end flow to delete location data
- [x] Call `deleteAllTripLocations()` in trip:end route
- [x] Add verification check after deletion
- [x] Log deletion success/failure

### Task 4: Additional privacy features
- [x] Delete rider location on trip:leave
- [x] Send cached locations to late-joining riders
- [x] Add endedAt timestamp to trip model

---

## Dev Notes
- Location data cached with 30-second TTL using Redis SETEX
- Late-joining riders receive cached locations of existing riders
- On trip end, all location data is deleted and verified
- On rider leave, their individual location data is deleted

## File List
- apps/api/src/services/locationCache.ts (new)
- apps/api/src/index.ts (modified)
- apps/api/src/routes/trips.ts (modified)
- apps/api/src/models/Trip.ts (modified)

## Status
**Current:** complete
