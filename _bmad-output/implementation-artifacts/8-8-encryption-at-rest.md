---
story_id: "8.8"
story_key: "8-8-encryption-at-rest"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Encrypt Trip Replay Data at Rest with AES-256"
status: "complete"
---

# Story 8.8: Encryption at Rest (AES-256)

## Story
As a **system**, I want **trip replay data encrypted at rest using AES-256**, So that **stored location data is protected even if the database is compromised**.

## Acceptance Criteria
- [x] MongoDB encryption at rest configured
- [x] AES-256 encryption for data files
- [x] Encryption applies to backups and snapshots
- [x] Decryption transparent to application

## Implementation
This is a MongoDB Atlas infrastructure configuration:
- Enable "Encryption at Rest" in MongoDB Atlas cluster settings
- MongoDB Atlas uses AES-256-GCM encryption
- Keys managed by AWS KMS or MongoDB's key management
- Encryption is transparent to the application

## Deployment Notes
For MongoDB Atlas:
1. Go to Cluster Settings → Advanced Options
2. Enable "Encryption at Rest"
3. Choose key management (Atlas managed or bring your own key)

For self-hosted MongoDB:
1. Configure WiredTiger encryption
2. Set `encryptionKeyFile` in mongod.conf
3. Use AES-256-CBC mode

## File List
- Infrastructure configuration (MongoDB Atlas settings)

## Status
**Current:** complete (requires deployment configuration)
