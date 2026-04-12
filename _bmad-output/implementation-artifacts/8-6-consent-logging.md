---
story_id: "8.6"
story_key: "8-6-consent-logging"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Log Consent Events for Regulatory Compliance Auditing"
status: "complete"
---

# Story 8.6: Consent Event Logging

## Story
As a **system**, I want **all consent events logged with timestamps for regulatory auditing**, So that **we can prove compliance during audits and demonstrate user consent history**.

## Acceptance Criteria
- [x] Consent events logged to MongoDB `consent_logs` collection
- [x] Includes: deviceId (hashed), consentType, action, timestamp, IP, userAgent
- [x] Logs are immutable (insert-only)
- [x] Separate retention policy (7 years for compliance)
- [x] Consent logged for trip replay decisions

## Implementation
Created `ConsentLog` model:
- Indexed by deviceId, consentType, timestamp
- Logged when consent is granted, denied, or withdrawn
- IP and device info hashed for privacy
- Integrated into consent flow in trips router

## File List
- apps/api/src/models/ConsentLog.ts
- apps/api/src/routes/trips.ts (integration)
- apps/api/src/routes/privacy.ts (integration)

## Status
**Current:** complete
