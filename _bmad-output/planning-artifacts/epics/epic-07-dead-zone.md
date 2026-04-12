# Epic 7: Dead Zone Resilience & Offline Handling

**Goal:** Maintain group coordination through network dead zones with client-side buffering, automatic reconnection, and visual trail replay.

**User Outcome:** Users stay connected through tunnels and remote areas with buffered location updates, transparent reconnection status, and animated trail replay on network restoration.

---

### Story 7.1: Implement Client-Side Location Buffering During Network Loss

As a **rider**,
I want **my location updates buffered client-side when network is unavailable**,
So that **my trail is preserved and can be replayed when connectivity returns**.

**Acceptance Criteria:**

**Given** I am in an active trip and the WebSocket connection drops
**When** GPS continues capturing my location (Story 3.1)
**Then** location updates are queued in IndexedDB instead of being sent:
  - Database: `syncride_offline_buffer`
  - Store: `location_updates`
  - Schema: `{ riderId, coordinates, timestamp, motionState, heading, speed }`
**And** updates are batched every 5 seconds to minimize IndexedDB writes
**And** buffer capacity is 1000 coordinate updates (approximately 15 minutes at 2s polling)
**When** buffer reaches 1000 updates
**Then** oldest updates are deleted (FIFO queue)
**And** a warning is logged: "Offline buffer full, dropping oldest location data"
**When** device storage is low (<10MB available)
**Then** buffering is paused and a toast warns: "Low storage, location buffering disabled"
**And** last-known position continues to display on map

**Requirements Fulfilled:** FR46, NFR-R7 (queue up to 1000 updates), NFR-R16 (preserve 15 minutes history)

---

### Story 7.2: Display Reconnecting Status Indicators

As a **rider**,
I want **to see clear status indicators when my connection is lost and reconnecting**,
So that **I understand the app is attempting to restore connectivity and not frozen**.

**Acceptance Criteria:**

**Given** my WebSocket connection has dropped (disconnect event)
**When** the disconnection is detected
**Then** the ConnectionStatusBanner component appears at top of screen:
  - Background: orange (#FF9500)
  - Icon: spinning loader icon
  - Text: "Reconnecting... attempt 1/5"
  - Height: 48px
  - Position: fixed top, full width
  - Z-index: 30 (above map, below modals)
**And** the banner animates slide-down from top (300ms)
**And** attempt counter increments with each retry: "attempt 2/5", "attempt 3/5"
**And** retry timing follows exponential backoff:
  - Attempt 1: immediate
  - Attempt 2: 1 second
  - Attempt 3: 2 seconds
  - Attempt 4: 4 seconds
  - Attempt 5: 8 seconds
**When** connection is restored
**Then** banner background changes to green (#00FF00)
**And** text changes to "Connected"
**And** banner auto-dismisses after 2 seconds with slide-up animation
**When** all 5 attempts fail
**Then** banner background changes to red (#FF0000)
**And** text changes to "Connection failed. Tap to retry."
**And** tapping banner manually triggers reconnection attempt

**Requirements Fulfilled:** FR47, UX-DR19, NFR-R4 (exponential backoff with jitter), NFR-P4 (<5s median reconnection)

---

### Story 7.3: Replay Buffered Location Trail with Animation on Reconnection

As a **rider**,
I want **my buffered location updates replayed with animation when I reconnect**,
So that **my group can see where I was during the disconnection period**.

**Acceptance Criteria:**

**Given** I have buffered location updates in IndexedDB (Story 7.1) and I reconnect
**When** the WebSocket connection is reestablished
**Then** the buffered updates are batch-uploaded to backend:
  - POST endpoint: `/api/trips/:tripCode/locations/batch`
  - Payload: array of LocationUpdate objects from buffer
  - Header: `Authorization: Bearer [JWT]`
  - Timeout: 10 seconds (fail if backend doesn't respond)
**And** the backend processes the batch:
  - Validates all updates (coordinates, timestamps)
  - Broadcasts `location:trail_replay` event to all riders with the buffered path
  - Stores updates in MongoDB time-series collection (if replay opt-in enabled, Epic 8)
**When** other riders receive the trail replay event
**Then** my marker animates along the buffered path:
  - Animation duration: 3 seconds total (regardless of buffer size)
  - Path: polyline connecting all buffered coordinates
  - Speed: constant (distance-independent timing)
  - Style: blue dotted line tracing my route
**And** after animation completes, my marker resumes live position
**And** a toast appears for other riders: "[Rider Name] reconnected"

**Requirements Fulfilled:** FR48, FR52, NFR-R15 (>90% trail replay accuracy)

---

### Story 7.4: Display Faint Dotted Lines for Dead Zone Paths

As a **rider**,
I want **to see dotted lines showing where riders traveled through dead zones**,
So that **I understand their path even when they were offline**.

**Acceptance Criteria:**

**Given** a rider's trail replay has completed (Story 7.3)
**When** the animation finishes
**Then** a persistent dotted line remains on the map showing the dead zone path:
  - Style: dashed line (4px dash, 8px gap)
  - Color: light gray (#CCCCCC), 50% opacity
  - Path: connects all buffered coordinates in sequence
  - Z-index: below rider markers, above map base
**And** the dotted line persists for 5 minutes after reconnection
**And** after 5 minutes, the line fades out over 2 seconds (opacity 0.5 → 0)
**When** multiple riders have dead zone paths
**Then** each rider's path uses a unique color (derived from their avatar color)
**And** tapping a dead zone path highlights that rider's marker
**When** map is panned/zoomed
**Then** dead zone paths remain visible and scale appropriately

**Requirements Fulfilled:** FR49

---

### Story 7.5: Implement Automatic Reconnection with Exponential Backoff and Jitter

As a **developer**,
I want **WebSocket reconnection logic with exponential backoff and jitter**,
So that **reconnection attempts don't overwhelm the server during network restoration**.

**Acceptance Criteria:**

**Given** the WebSocket client is configured (Story 3.2)
**When** a disconnect event occurs
**Then** the reconnection strategy executes:
  - Base delay: 1000ms
  - Exponential multiplier: 2
  - Max delay: 8000ms
  - Max attempts: 5
  - Jitter: random ±25% of calculated delay
**And** reconnection timing is:
  - Attempt 1: 0ms (immediate)
  - Attempt 2: 1000ms ± 250ms jitter
  - Attempt 3: 2000ms ± 500ms jitter
  - Attempt 4: 4000ms ± 1000ms jitter
  - Attempt 5: 8000ms ± 2000ms jitter
**When** reconnection succeeds before attempt 5
**Then** reconnection counter resets to 0
**And** connection status banner shows "Connected" (Story 7.2)
**When** all 5 attempts fail
**Then** reconnection stops and manual retry is required
**And** connection status shows "Connection failed. Tap to retry."
**And** tapping retry button resets counter and starts from attempt 1

**Requirements Fulfilled:** FR50, NFR-R4, NFR-P4 (median <5s reconnection)

---

### Story 7.6: Display Last-Known Position Indicators for Disconnected Riders

As a **rider**,
I want **to see "last known position" indicators when other riders are disconnected**,
So that **I have a reference point for where they were before losing connection**.

**Acceptance Criteria:**

**Given** another rider's connection has been lost >30 seconds (disconnected state, Story 3.11)
**When** they remain disconnected
**Then** their marker displays:
  - Red solid status ring (no animation)
  - 50% opacity on avatar
  - Timestamp overlay: "Last seen Xm ago" (updates every 10 seconds)
  - Expanding uncertainty radius (dotted circle, Story 3.11):
    - Initial radius: 50m
    - Grows by 50m every 10 seconds
    - Max radius: 500m
**And** marker remains at last-known coordinates (doesn't move)
**And** heading indicator is hidden (direction unknown while disconnected)
**When** tapping the disconnected rider's marker
**Then** a tooltip appears:
  - "Last seen: X minutes ago"
  - "Last position (may have moved)"
  - Accuracy: "±Xm (when last connected)"
**When** the disconnected rider reconnects
**Then** uncertainty radius fades out (500ms)
**And** marker returns to live state (green pulsing ring, full opacity)
**And** marker animates from last-known position to current position

**Requirements Fulfilled:** FR51

---

### Story 7.7: Continue App Use in Offline Mode with Degraded Functionality

As a **rider**,
I want **the app to remain functional in offline mode with degraded features**,
So that **I can still view the map and my cached location even without network**.

**Acceptance Criteria:**

**Given** my device has no network connectivity
**When** I open the app or connection is lost during trip
**Then** offline mode is automatically activated:
  - Banner shows: "Offline Mode - Limited Functionality"
  - Banner color: gray (#6B7280)
  - Banner persists (not auto-dismissing)
**And** available functionality in offline mode:
  - ✅ View map with cached map tiles (last viewed areas)
  - ✅ See my current GPS position (blue dot, updates locally)
  - ✅ View last-known positions of other riders (markers frozen)
  - ✅ Access cached trip code (can share offline)
  - ✅ Queue location updates for later upload (Story 7.1)
**And** unavailable functionality (gracefully disabled):
  - ❌ Real-time location updates from others (markers show "offline" badges)
  - ❌ Send status messages or SOS (buttons grayed out with tooltip: "Requires connection")
  - ❌ View updated group stats (nearest rider, group spread - shows "—")
  - ❌ Join or create new trips (requires backend)
**When** tapping disabled features
**Then** a toast explains: "This feature requires network connection"
**When** network is restored
**Then** offline banner transitions to "Reconnecting..." (Story 7.2)
**And** all queued updates are uploaded (Story 7.3)
**And** real-time functionality resumes

**Requirements Fulfilled:** FR53

---

## Epic 7 Summary

**Stories Created:** 7
**Requirements Covered:**
- FRs: FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53 (8 FRs)
- UX Design: UX-DR19, UX-DR47, UX-DR48
- NFRs: NFR-R1, NFR-R4, NFR-R7, NFR-R14, NFR-R15, NFR-R16, NFR-P4

**Epic 7 Status:** ✅ Complete

---

