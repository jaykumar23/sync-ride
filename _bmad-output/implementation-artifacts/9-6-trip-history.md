---
story_id: "9.6"
story_key: "9-6-trip-history"
epic: "Epic 9: Post-Trip Experience & Replay"
title: "View Trip History (Within 7-Day Window)"
status: "complete"
---

# Story 9.6: View Trip History (Within 7-Day Window)

## Story
As a **rider**, I want **to view my trip history if replay storage was enabled**, So that **I can revisit past rides within the 7-day window**.

## Acceptance Criteria
- [x] Trip History accessible from Settings
- [x] List of saved trips (reverse chronological)
- [x] Trip details: date, duration, distance, thumbnail, expiration
- [x] Only trips within 7-day window shown
- [x] Tap to open trip replay viewer
- [x] Delete trip option with confirmation

## Tasks

### Task 1: Create API endpoint for user's trip history
- [x] GET `/api/trips/history/:deviceId` endpoint
- [x] Return trips with consent granted within 7-day TTL

### Task 2: Create TripHistory Component
- [x] List view with trip cards
- [x] Show date, duration, distance, days until expiration
- [x] Delete functionality with confirmation

### Task 3: Integrate with Settings/PrivacySettings
- [x] Add "Trip History" button to PrivacySettings
- [x] Navigate to TripHistory view

---

## Dev Notes
- Uses existing TripReplay model from Epic 8
- DeviceId hashed for privacy in queries
- TTL index ensures auto-deletion after 7 days

## File List
- apps/api/src/routes/trips.ts (modified)
- apps/web/src/components/TripHistory.tsx (new)
- apps/web/src/components/PrivacySettings.tsx (modified)
- apps/web/src/App.tsx (modified)

## Status
**Current:** in-progress
