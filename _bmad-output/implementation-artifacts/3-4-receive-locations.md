---
story_id: "3.4"
story_key: "3-4-receive-locations"
epic: "Epic 3: Real-Time Location"
title: "Receive Location Updates from Other Riders"
status: "in-progress"
---

# Story 3.4: Receive Location Updates

## Story
As a **rider**, I want **to receive location updates from other trip participants**, So that **I can see their current positions**.

## Acceptance Criteria
- Listen to `location:broadcast` WebSocket events
- Validate coordinates, accuracy, timestamp
- Update rider positions in state
- Display on map

## Tasks
### Task 1: Create location state management
- [x] Create Zustand store for rider locations
- [x] Add location validation logic (coordinates, timestamp)
- [x] Update locations from WebSocket events
- [x] Update statuses periodically (live/stale/disconnected)

### Task 2: Display live locations in UI
- [x] Show rider count with live locations
- [x] Display last update times
- [x] Color-code rider status (green=live, yellow=stale, red=offline)

---

## Status
**Current:** complete
