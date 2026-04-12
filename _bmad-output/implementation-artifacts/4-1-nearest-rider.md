---
story_id: "4.1"
story_key: "4-1-nearest-rider"
epic: "Epic 4: Group Awareness"
title: "Calculate and Display Nearest Rider Distance"
status: "in-progress"
---

# Story 4.1: Nearest Rider Distance

## Story
As a **rider**, I want **to see the distance to my nearest group member with color-coded indicator**, So that **I know if I'm falling behind or pulling ahead**.

## Acceptance Criteria
- Calculate distance using Haversine formula
- Display in BottomStatusBar with color coding
- Green <500m, Yellow 500m-2km, Orange 2km-5km, Red >5km
- Show "No other riders nearby" when alone

## Tasks
### Task 1: Create Haversine distance utility
- [x] Create `apps/web/src/utils/distance.ts`
- [x] Implement Haversine formula
- [x] Return distance in meters
- [x] formatDistance, getDistanceColor, getDistanceLabel helpers

### Task 2: Create BottomStatusBar component
- [x] Create component showing nearest rider
- [x] Color-coded distance indicator (green/yellow/orange/red)
- [x] Show rider name and distance
- [x] Group spread indicator
- [x] Rider count with live status

### Task 3: Create MemberListSheet component
- [x] Bottom sheet with member list
- [x] Online/offline status badges
- [x] Distance to each rider
- [x] Sorted by: host first, then online, then distance

---

## Status
**Current:** complete
