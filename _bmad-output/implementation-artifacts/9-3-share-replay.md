---
story_id: "9.3"
story_key: "9-3-share-replay"
epic: "Epic 9: Post-Trip Experience & Replay"
title: "Share Trip Replay Link via Social Media"
status: "complete"
---

# Story 9.3: Share Trip Replay Link via Social Media

## Story
As a **rider**, I want **to share my trip replay link on social media or messaging apps**, So that **I can show my riding achievements to friends and followers**.

## Acceptance Criteria
- [x] Share modal with social/messaging options
- [x] Public replay link generation
- [x] Native share sheet integration
- [x] Pre-filled message with trip stats
- [x] Copy link option

## Tasks

### Task 1: Create ShareTripModal Component
- [x] Create share options modal
- [x] Show social media and messaging options
- [x] Copy link functionality
- [x] Pre-filled message with stats

### Task 2: Update TripSummary Share Button
- [x] Connect share button to ShareTripModal
- [x] Pass trip stats for message generation

---

## Dev Notes
- Uses Web Share API where available
- Falls back to copy-to-clipboard on unsupported browsers
- Public replay viewer is a future enhancement (URL placeholder for now)

## File List
- apps/web/src/components/ShareTripModal.tsx (new)
- apps/web/src/components/TripSummary.tsx (modified)
- apps/web/src/App.tsx (modified)

## Status
**Current:** in-progress
