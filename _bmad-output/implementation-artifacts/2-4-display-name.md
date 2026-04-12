---
story_id: "2.4"
story_key: "2-4-display-name"
epic: "Epic 2: Trip Creation"
title: "Display Name Entry on Join"
status: "in-progress"
---

# Story 2.4: Display Name Entry

## Story
As a **rider**, I want **to optionally provide a display name when joining a trip**, So that **other riders can identify me instead of seeing "Rider N"**.

## Acceptance Criteria
- Optional display name field when joining
- 80px height, 1.5rem font (glove-friendly)
- Max 30 characters
- XSS sanitization
- Auto-generated "Rider N" if empty

## Tasks
### Task 1: Add display name input to join form
- [x] Add optional name field to join view (appears when code entered)
- [x] Apply glove-friendly styling (80px height, 1.5rem font)
- [x] Validate max 30 chars, no whitespace-only
- [x] Sanitize HTML/script tags (XSS prevention)

### Task 2: Update join API to accept displayName
- [x] Modify join endpoint to use provided name
- [x] Backend validation and sanitization
- [x] Auto-generate "Rider N" if name not provided

---

## Status
**Current:** complete
