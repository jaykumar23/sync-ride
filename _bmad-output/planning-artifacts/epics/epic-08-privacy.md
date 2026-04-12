# Epic 8: Privacy, Data Lifecycle & Compliance

**Goal:** Implement transparent privacy controls with automatic data deletion, opt-in replay storage, and full DPDP/GDPR/PDPA compliance.

**User Outcome:** Users have full control over their location data with automatic deletion on trip end, explicit consent for 7-day replay, and accessible data subject rights.

---

### Story 8.1: Auto-Delete Live Location Data on Trip End (Redis TTL)

As a **system**,
I want **live location data automatically deleted from Redis within 30 seconds of trip end**,
So that **privacy promises are technically enforced without manual cleanup**.

**Acceptance Criteria:**

**Given** a trip is active with riders sharing location
**When** location updates are stored in Redis
**Then** each location key uses this format: `location:{tripCode}:{riderId}`
**And** each key is set with TTL of 30 seconds: `SETEX location:ABC123:rider1 30 {locationData}`
**And** TTL is refreshed with every new location update for that rider
**When** a trip ends (host ends manually, 12-hour limit, or battery limit)
**Then** all location keys for that trip are immediately deleted:
  - Redis command: `DEL location:ABC123:*` (delete all matching pattern)
  - Executes synchronously before trip end confirmation is sent
**And** verification check runs after deletion:
  - Query: `KEYS location:ABC123:*`
  - Expected result: empty array
**And** if any keys remain (deletion failure), error is logged to Sentry with high priority
**When** 30 seconds pass after last update (no refresh)
**Then** Redis automatically expires the key (TTL enforcement)
**And** expired keys are cleaned up by Redis background process

**Requirements Fulfilled:** FR39, NFR-S10 (30s TTL), NFR-S12 (no persistent location graphs)

---

### Story 8.2: Display Opt-In Consent for 7-Day Trip Replay Storage

As a **rider**,
I want **to explicitly opt-in to 7-day trip replay storage with clear consent**,
So that **I can save my trip data if desired while understanding retention**.

**Acceptance Criteria:**

**Given** I am viewing the post-trip summary screen (Epic 9)
**When** the trip ends
**Then** an opt-in modal appears before showing summary:
  - Title: "Save Trip Replay?"
  - Message: "Your location history from this trip will be stored for 7 days to enable replay and sharing."
  - Details expandable section:
    - "What's stored: GPS coordinates, timestamps, trip statistics"
    - "How long: 7 days, then automatically deleted"
    - "Who can access: Only you via this device (no account required)"
  - Checkboxes (both optional):
    - ☐ "Save my trip replay for 7 days"
    - ☐ "Share anonymized trip statistics to improve SyncRide"
  - Buttons: "Save" (green, 120px), "Don't Save" (gray, 80px)
**When** I select "Save" with opt-in checkbox checked
**Then** consent is recorded:
  - `tripReplayConsent: true` saved to MongoDB trip document
  - `consentTimestamp: Date` logged
  - `consentDeviceId: string` recorded
**And** my location history from this trip is saved to MongoDB time-series collection
**And** TTL index is set for 7-day automatic deletion
**When** I select "Don't Save" or leave checkboxes unchecked
**Then** no location history is saved beyond live tracking
**And** only aggregate trip statistics are saved (Epic 9)
**And** consent refusal is logged: `tripReplayConsent: false`

**Requirements Fulfilled:** FR40, FR55

---

### Story 8.3: Enforce 7-Day Hard Delete with MongoDB TTL Indexes

As a **developer**,
I want **MongoDB TTL indexes configured to automatically delete trip replay data after 7 days**,
So that **data retention promises are enforced at the database level without manual cleanup**.

**Acceptance Criteria:**

**Given** trip replay data is stored in MongoDB time-series collection
**When** the collection is initialized
**Then** a TTL index is created:
  - Collection: `trip_replays`
  - Index field: `createdAt`
  - TTL value: `7 * 24 * 60 * 60` seconds (7 days)
  - Command: `db.trip_replays.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 604800 })`
**And** time-series collection is configured:
  - `timeField: "timestamp"`
  - `metaField: "tripCode"`
  - `granularity: "seconds"`
**When** 7 days pass after trip creation
**Then** MongoDB background process automatically deletes the trip replay documents
**And** deletion happens within 60 seconds of expiration (MongoDB TTL monitor runs every 60s)
**When** trip replay data is queried after expiration
**Then** query returns empty result (data is gone)
**And** no manual cleanup jobs or cron tasks are needed
**And** TTL deletion is logged in MongoDB server logs for auditing

**Requirements Fulfilled:** FR42, NFR-S11 (7-day hard delete with DB-level TTL)

---

### Story 8.4: Display Data Deletion Confirmation Message

As a **rider**,
I want **to receive confirmation that my location data was deleted after trip end**,
So that **I have transparency and trust in the app's privacy promises**.

**Acceptance Criteria:**

**Given** a trip has ended (host end, auto-end, or I left voluntarily)
**When** the trip end flow completes (Story 6.5)
**Then** a confirmation modal appears after trip summary:
  - Title: "Data Deleted"
  - Message: "Your real-time location data has been automatically deleted."
  - Icon: green checkmark
  - Details:
    - "Live tracking data: ✓ Deleted within 30 seconds"
    - "Trip replay: ✓ Will auto-delete in 7 days" (if opted-in)
    - "Trip replay: ✓ Not saved" (if opted-out)
  - Footer: "View our Privacy Policy"
  - Button: "Got It" (green, 120px)
**And** the modal auto-dismisses after 10 seconds if no interaction
**When** I tap "Got It"
**Then** modal closes and I return to home screen or post-trip summary
**When** I tap "View our Privacy Policy"
**Then** the Privacy Policy page opens in a new view/webview
**And** deletion confirmation timestamp is logged for compliance

**Requirements Fulfilled:** FR43, FR59

---

### Story 8.5: Implement Data Subject Rights Portal (DPDP Act Compliance)

As a **user**,
I want **to access my data subject rights (access, correction, deletion, portability)**,
So that **I can exercise my privacy rights under DPDP Act regulations**.

**Acceptance Criteria:**

**Given** I am using the app (logged in or anonymous with device ID)
**When** I navigate to Settings → Privacy → "Your Data Rights"
**Then** a Data Subject Rights portal displays with options:
  - **Right to Access**: "Download a copy of your data"
  - **Right to Correction**: "Update incorrect personal information"
  - **Right to Deletion**: "Delete all your data from SyncRide"
  - **Right to Portability**: "Export your data in machine-readable format"
  - **Withdraw Consent**: "Revoke location data collection consent"
**When** I tap "Download a copy of your data"
**Then** a data export is generated containing:
  - Device ID (masked)
  - Consent history (timestamps, types)
  - Trip codes participated in (last 30 days)
  - Aggregate statistics (no raw GPS coordinates unless replay opt-in)
  - Data retention status
**And** export is available as JSON download
**When** I tap "Delete all your data"
**Then** a confirmation appears: "This will delete all your data including trip history, consent records, and cached information. This action is irreversible."
**When** confirmed, all associated data is deleted:
  - Device ID from all trips (historical records anonymized)
  - Consent logs archived (required for compliance, but anonymized)
  - Trip replay data (if any)
  - Cached data in localStorage
**And** deletion confirmation email is sent (if email provided)
**And** deletion is completed within 72 hours

**Requirements Fulfilled:** FR44, NFR-S19 (DPDP Act compliance)

---

### Story 8.6: Log Consent Events for Regulatory Compliance Auditing

As a **system**,
I want **all consent events logged with timestamps for regulatory auditing**,
So that **we can prove compliance during audits and demonstrate user consent history**.

**Acceptance Criteria:**

**Given** a user interacts with any consent flow
**When** consent is granted, denied, or withdrawn
**Then** a consent event is logged to MongoDB `consent_logs` collection with:
  - `userId`: device ID (hashed for privacy)
  - `consentType`: 'location_tracking' | 'trip_replay' | 'terms_of_service' | 'data_collection'
  - `action`: 'granted' | 'denied' | 'withdrawn'
  - `timestamp`: ISO 8601 timestamp
  - `ipAddress`: hashed IP (for audit trail)
  - `userAgent`: browser/device info
  - `consentText`: snapshot of consent language shown to user
  - `version`: app version at time of consent
**And** consent logs are immutable (insert-only, no updates or deletes allowed)
**And** consent logs have separate retention policy:
  - Stored for 7 years (regulatory requirement)
  - After deletion request, logs are anonymized but retained
**When** an audit request is received
**Then** consent logs can be queried by:
  - Date range
  - Consent type
  - Action type
**And** export generates compliance report in CSV format
**And** consent log access is restricted to admin role only

**Requirements Fulfilled:** FR45, NFR-S22 (consent auditing)

---

### Story 8.7: Implement WSS (TLS) Encryption for WebSocket Communication

As a **system**,
I want **all WebSocket communication encrypted with TLS (WSS protocol)**,
So that **location data cannot be intercepted during transmission**.

**Acceptance Criteria:**

**Given** the WebSocket connection is established (Story 3.2)
**When** the connection URL is configured
**Then** WSS protocol is enforced:
  - Production: `wss://api.syncride.com/socket.io` (TLS required)
  - Development: `ws://localhost:3000/socket.io` (local only, TLS optional)
**And** the backend Socket.io server is configured with HTTPS/TLS:
  - TLS certificate: valid SSL certificate from Let's Encrypt or commercial CA
  - TLS version: minimum TLS 1.2
  - Cipher suites: strong encryption only (AES-256-GCM, ChaCha20-Poly1305)
**When** a client attempts to connect with WS (non-encrypted)
**Then** the connection is rejected with error: "Secure connection required"
**And** the client automatically upgrades to WSS
**When** location data is transmitted
**Then** all payloads are encrypted in transit via TLS
**And** no plaintext coordinates are exposed on the network
**And** TLS handshake is verified before first data transmission

**Requirements Fulfilled:** NFR-S1 (WSS/TLS encryption)

---

### Story 8.8: Encrypt Trip Replay Data at Rest with AES-256

As a **system**,
I want **trip replay data encrypted at rest using AES-256**,
So that **stored location data is protected even if the database is compromised**.

**Acceptance Criteria:**

**Given** trip replay opt-in is enabled (Story 8.2)
**When** location data is written to MongoDB
**Then** MongoDB encryption at rest is configured:
  - Encryption method: AES-256-CBC
  - Key management: MongoDB Atlas auto-managed keys or AWS KMS
  - Encrypted fields: `coordinates`, `heading`, `speed` (PII location data)
**And** database-level encryption is enabled:
  - MongoDB Atlas: Encryption at Rest enabled in cluster settings
  - Encryption applies to all data files, backups, and snapshots
**When** trip replay data is queried
**Then** decryption happens transparently (no application code changes needed)
**And** decryption is performed only by authenticated MongoDB connections
**When** database backups are created
**Then** backups are also encrypted with same AES-256 encryption
**And** backup encryption keys are stored separately from data

**Requirements Fulfilled:** NFR-S3 (AES-256 at rest)

---

### Story 8.9: Rotate Device IDs on Trip End to Prevent Cross-Trip Tracking

As a **system**,
I want **device IDs to rotate after each trip ends**,
So that **users cannot be tracked across multiple trips for behavioral profiling**.

**Acceptance Criteria:**

**Given** a trip has ended
**When** the trip end flow completes
**Then** a new device ID is generated for this device:
  - Format: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
  - Stored in localStorage: `device_id`
  - Replaces previous device ID
**And** the old device ID is marked as expired in backend:
  - Cannot be used to join new trips
  - Historical trips remain associated with old ID (for data subject rights)
**When** I join or create the next trip
**Then** the new device ID is used
**And** no server-side mapping exists between old and new IDs (true rotation)
**And** trip history is not linked across device IDs
**When** I request data access (Story 8.5)
**Then** data export only includes current device ID's trips
**And** previous device IDs cannot be queried (unless explicit consent given)

**Requirements Fulfilled:** NFR-S13 (device ID rotation)

---

## Epic 8 Summary

**Stories Created:** 9
**Requirements Covered:**
- FRs: FR39, FR40, FR42, FR43, FR44, FR45, FR55 (7 FRs, FR55 shared with Epic 9)
- NFRs: NFR-S1, NFR-S3, NFR-S10, NFR-S11, NFR-S12, NFR-S13, NFR-S19, NFR-S22

**Epic 8 Status:** ✅ Complete

---

