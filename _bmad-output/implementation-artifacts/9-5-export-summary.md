---
story_id: "9.5"
story_key: "9-5-export-summary"
epic: "Epic 9: Post-Trip Experience & Replay"
title: "Export Trip Summary for Social Media Posting"
status: "complete"
---

# Story 9.5: Export Trip Summary for Social Media Posting

## Story
As a **rider**, I want **to export a shareable trip summary image for social media**, So that **I can post my ride achievements without sharing the replay link**.

## Acceptance Criteria
- [x] "Export Summary" button in TripSummary
- [x] Generate shareable image (1080x1920px portrait)
- [x] Image includes: logo, stats, branding, QR code placeholder
- [x] Options: Save to Photos, Share Now, Copy Image
- [x] Native share sheet integration for image

## Tasks

### Task 1: Create ExportSummaryModal Component
- [x] Create image generation using canvas
- [x] Display export options
- [x] Handle download and share

### Task 2: Integrate with TripSummary
- [x] Add "Export Summary" button
- [x] Connect to ExportSummaryModal

---

## Dev Notes
- Uses HTML Canvas for image generation
- Downloads as PNG file
- Web Share API for native sharing

## File List
- apps/web/src/components/ExportSummaryModal.tsx (new)
- apps/web/src/components/TripSummary.tsx (modified)
- apps/web/src/App.tsx (modified)

## Status
**Current:** in-progress
