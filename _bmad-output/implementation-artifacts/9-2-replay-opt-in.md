---
story_id: "9.2"
story_key: "9-2-replay-opt-in"
epic: "Epic 9: Post-Trip Experience & Replay"
title: "Opt-In to Save Trip Replay from Post-Trip Screen"
status: "complete"
---

# Story 9.2: Opt-In to Save Trip Replay

## Story
As a **rider**, I want **to opt-in to save trip replay for 7 days from the post-trip screen**, So that **I can access my trip history later if I didn't opt-in during trip end**.

## Acceptance Criteria
- [x] "Save Replay" button visible if not already opted-in
- [x] Clicking "Save Replay" saves trip data with 7-day TTL
- [x] Confirmation toast shown on success
- [x] Button hidden if already opted-in, showing expiration message instead

## Implementation Notes
This functionality was implemented as part of Story 9.1 in the TripSummary component:
- `handleSaveReplayFromSummary` function in App.tsx saves consent and location history
- TripSummary shows "Save Replay" button or expiration message based on `replayAlreadySaved` prop
- Uses existing Epic 8 consent API endpoint

## File List
- apps/web/src/components/TripSummary.tsx (implemented in 9.1)
- apps/web/src/App.tsx (implemented in 9.1)

## Status
**Current:** complete
