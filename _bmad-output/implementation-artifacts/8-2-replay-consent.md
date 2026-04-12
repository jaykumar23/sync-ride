---
story_id: "8.2"
story_key: "8-2-replay-consent"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Display Opt-In Consent for 7-Day Trip Replay Storage"
status: "in-progress"
---

# Story 8.2: Opt-In Consent for 7-Day Trip Replay Storage

## Story
As a **rider**, I want **to explicitly opt-in to 7-day trip replay storage with clear consent**, So that **I can save my trip data if desired while understanding retention**.

## Acceptance Criteria
- Consent modal appears when trip ends
- Clear explanation of what's stored and for how long
- Checkboxes for opt-in (not pre-checked)
- Consent recorded with timestamp and device ID
- If declined, no location history is saved

## Tasks
### Task 1: Create TripReplay model in MongoDB
- [ ] Create `apps/api/src/models/TripReplay.ts`
- [ ] Include fields: tripCode, riderId, coordinates, timestamps, consent
- [ ] Add 7-day TTL index

### Task 2: Create consent API endpoints
- [ ] POST `/api/trips/:code/consent` - Record consent decision
- [ ] GET `/api/trips/:code/replay` - Get replay data if consented

### Task 3: Create ConsentModal component
- [ ] Create `apps/web/src/components/ConsentModal.tsx`
- [ ] Display consent options with clear language
- [ ] Handle save/don't save actions

### Task 4: Integrate into trip end flow
- [ ] Show modal when trip ends
- [ ] Store consent decision in localStorage
- [ ] Call API to record consent

---

## Status
**Current:** in-progress
