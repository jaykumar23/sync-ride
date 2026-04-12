---
story_id: "3.1"
story_key: "3-1-gps-capture"
epic: "Epic 3: Real-Time Location"
title: "Capture GPS Location with Geolocation API"
status: "in-progress"
---

# Story 3.1: Capture GPS Location

## Story
As a **rider**, I want **my GPS location captured continuously during an active trip**, So that **my position is shared with my group in real-time**.

## Acceptance Criteria
- Initialize Geolocation API with watchPosition
- Capture: lat, lng, accuracy, heading, speed, timestamp
- Queue location for WebSocket broadcast
- Handle GPS errors gracefully

## Tasks
### Task 1: Create useGeolocation hook
- [x] Create `apps/web/src/hooks/useGeolocation.ts`
- [x] Implement watchPosition with high accuracy
- [x] Return location state and error handling
- [x] Handle permission denied, timeout, unavailable

### Task 2: Integrate GPS into trip view
- [x] Call useGeolocation when trip active
- [x] Display current position status (loading, error, active)
- [x] Show accuracy indicator
- [x] Display coordinates when available

---

## Status
**Current:** complete
