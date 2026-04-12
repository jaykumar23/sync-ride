---
story_id: "8.9"
story_key: "8-9-device-id-rotation"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Rotate Device IDs on Trip End to Prevent Cross-Trip Tracking"
status: "complete"
---

# Story 8.9: Device ID Rotation

## Story
As a **system**, I want **device IDs to rotate after each trip ends**, So that **users cannot be tracked across multiple trips for behavioral profiling**.

## Acceptance Criteria
- [x] New UUID generated when trip ends
- [x] Stored in localStorage
- [x] Rotation happens after consent flow completes
- [x] Also rotates when user is kicked
- [x] Also rotates when trip ends externally (by host)

## Implementation
Added `rotateDeviceId()` function that:
- Generates new UUID v4
- Stores in localStorage
- Called in three scenarios:
  1. After user ends/leaves trip and consent flow completes
  2. When user is kicked from trip
  3. When trip ends externally (by host)

## File List
- apps/web/src/App.tsx (rotateDeviceId function and integration)

## Status
**Current:** complete
