---
story_id: "8.3"
story_key: "8-3-mongodb-ttl"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Enforce 7-Day Hard Delete with MongoDB TTL Indexes"
status: "complete"
---

# Story 8.3: MongoDB TTL Indexes for 7-Day Auto-Delete

## Story
As a **developer**, I want **MongoDB TTL indexes configured to automatically delete trip replay data after 7 days**, So that **data retention promises are enforced at the database level without manual cleanup**.

## Acceptance Criteria
- [x] TTL index created on `trip_replays` collection
- [x] Index field: `createdAt` with 7-day expiration
- [x] MongoDB automatically deletes expired documents
- [x] No manual cleanup jobs required

## Implementation
Created `TripReplay` model with TTL index:
- `createdAt` field with `expires: 604800` (7 days in seconds)
- MongoDB's background TTL monitor deletes expired documents automatically

## File List
- apps/api/src/models/TripReplay.ts

## Status
**Current:** complete
