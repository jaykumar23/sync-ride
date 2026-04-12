---
story_id: "9.4"
story_key: "9-4-attribution-survey"
epic: "Epic 9: Post-Trip Experience & Replay"
title: "Display Attribution Survey on Trip End"
status: "complete"
---

# Story 9.4: Display Attribution Survey on Trip End

## Story
As a **product team**, I want **to show a brief attribution survey asking how users heard about SyncRide**, So that **we can track marketing effectiveness and user acquisition channels**.

## Acceptance Criteria
- [x] Attribution survey modal appears on trip summary (max once per device)
- [x] Title: "How did you hear about SyncRide?"
- [x] Single-select options with icons
- [x] Optional text field for additional details
- [x] Submit and Skip buttons
- [x] Response saved to analytics with deviceId (hashed), source, details, timestamp
- [x] Survey doesn't appear again after completion (localStorage flag)

## Tasks

### Task 1: Create AttributionSurvey Component
- [x] Create `apps/web/src/components/AttributionSurvey.tsx`
- [x] Display survey modal with options
- [x] Handle selection and submission
- [x] Store completion flag in localStorage

### Task 2: Create Attribution API Endpoint
- [x] Add POST `/api/analytics/attribution` endpoint
- [x] Store hashed deviceId, source, details, timestamp
- [x] Create Attribution model

### Task 3: Integrate with TripSummary
- [x] Trigger survey from TripSummary component
- [x] Check localStorage before showing

---

## Dev Notes
- Survey shown only once per device (localStorage flag)
- DeviceId is hashed for privacy
- Analytics stored in MongoDB

## File List
- apps/web/src/components/AttributionSurvey.tsx (new)
- apps/api/src/models/Attribution.ts (new)
- apps/api/src/routes/analytics.ts (new)
- apps/api/src/index.ts (modified)
- apps/web/src/App.tsx (modified)

## Status
**Current:** in-progress
