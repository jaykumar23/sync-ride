---
story_id: "8.5"
story_key: "8-5-data-rights-portal"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Implement Data Subject Rights Portal (DPDP Act Compliance)"
status: "complete"
---

# Story 8.5: Data Subject Rights Portal

## Story
As a **user**, I want **to access my data subject rights (access, correction, deletion, portability)**, So that **I can exercise my privacy rights under DPDP Act regulations**.

## Acceptance Criteria
- [x] Data Rights portal accessible from home screen and trip settings
- [x] Right to Access: Download user data as JSON
- [x] Right to Correction: Info about updating display name
- [x] Right to Erasure: Delete all user data with confirmation
- [x] Withdraw Consent: Revoke location consent
- [x] Data Portability: JSON export format

## Implementation
Created `PrivacySettings` component and API endpoints:
- `/api/privacy/export/:deviceId` - Export user data
- `/api/privacy/delete/:deviceId` - Delete all user data
- Accessible from home screen and trip settings

## File List
- apps/web/src/components/PrivacySettings.tsx
- apps/api/src/routes/privacy.ts
- apps/web/src/App.tsx (integration)
- apps/web/src/components/TripSettings.tsx (integration)

## Status
**Current:** complete
