# Epic 3: Real-Time Location Sharing & Map Visualization

**Goal:** Implement the core value proposition - real-time location broadcasting with sub-500ms P95 latency and synchronized map visualization with live rider positions.

**User Outcome:** Users can share GPS location in real-time and view all trip participants on a live map with smooth animations, motion state detection, and connection status indicators.

**FRs Covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25 (11 total)

**UX Design Requirements:**
- UX-DR14: RiderMarker component (status ring animations, live/stale/disconnected states)
- UX-DR17: BottomStatusBar component (nearest rider display, glance mode adaptive sizing)
- UX-DR28: Tablet split-view (map 66%, member list sidebar 34%)
- UX-DR29: Desktop management view (map 60%, enhanced sidebar 40%)
- UX-DR43: Rider marker animations (green pulse, yellow fade, scale pulse for SOS)
- UX-DR44: Smooth avatar movement interpolation (no teleportation jumps)

**NFRs Addressed:**
- NFR-P1 to NFR-P5: Real-time latency (P95 <500ms, P99 <1s, delivery rate >99.5%)
- NFR-P10: Map rendering 60fps with hardware acceleration
- NFR-P13 to NFR-P16: Battery efficiency (adaptive GPS polling, 60-80% savings)
- NFR-S1: WSS encryption for WebSocket
- NFR-R4: Auto-reconnection with exponential backoff

---

## Stories (11 total)

### Story 3.1: Capture GPS Location with Geolocation API

As a **rider**,
I want **my GPS location captured continuously during an active trip**,
So that **my position is shared with my group in real-time**.

**Acceptance Criteria:**

**Given** I have joined a trip and granted location permission
**When** the trip starts
**Then** the app initializes Geolocation API with watchPosition
**And** location options are configured:
  - `enableHighAccuracy: true` (use GPS instead of network)
  - `maximumAge: 0` (always fresh coordinates)
  - `timeout: 5000ms` (5-second timeout per reading)
**And** successful position callbacks capture:
  - `latitude`, `longitude` (6 decimal places precision)
  - `accuracy` (in meters)
  - `heading` (compass direction if available)
  - `speed` (in m/s if available)
  - `timestamp` (device time)
**When** location is successfully captured
**Then** the LocationUpdate object is created with coordinates, accuracy, heading, speed, timestamp
**And** the location is queued for broadcast to backend via WebSocket
**When** location capture fails (GPS unavailable, permission denied)
**Then** an error event is logged to Sentry
**And** a status indicator shows: "GPS unavailable"
**And** the app continues attempting to capture with exponential backoff (5s → 10s → 20s)

**Requirements Fulfilled:** FR11, FR61

---

### Story 3.2: Establish WebSocket Connection for Real-Time Communication

As a **rider**,
I want **a WebSocket connection established between my device and the backend**,
So that **location updates can be broadcast with sub-second latency**.

**Acceptance Criteria:**

**Given** I have joined a trip
**When** the trip screen loads
**Then** a WebSocket connection is initiated to the backend server
**And** connection URL uses WSS protocol (TLS encryption): `wss://api.syncride.com/socket.io`
**And** connection includes authentication with JWT token in handshake
**And** Socket.io client is configured with:
  - `reconnection: true` (auto-reconnect on disconnect)
  - `reconnectionDelay: 1000` (start at 1 second)
  - `reconnectionDelayMax: 8000` (max 8 seconds)
  - `reconnectionAttempts: 5` (try 5 times before giving up)
**When** connection is successful
**Then** `connected` event fires and connection status shows "Connected"
**And** client emits `trip:join` event with `{ tripCode, riderId, displayName }`
**And** server acknowledges join with current trip state (all riders)
**When** connection fails
**Then** `connect_error` event fires
**And** connection status shows "Connecting..."
**And** automatic reconnection attempts with exponential backoff
**When** connection is lost during trip
**Then** `disconnect` event fires
**And** status banner shows: "Reconnecting... attempt N/5"
**And** buffered location updates queue client-side (Story 7.1)

**Requirements Fulfilled:** FR13, NFR-S1 (WSS encryption), NFR-R4 (exponential backoff)

---

### Story 3.3: Broadcast Location Updates via WebSocket

As a **rider**,
I want **my location updates broadcast to all trip participants via WebSocket**,
So that **my group can see my position in near real-time**.

**Acceptance Criteria:**

**Given** I have an active WebSocket connection and GPS location
**When** a new location is captured (Story 3.1)
**Then** the LocationUpdate is emitted via Socket.io: `socket.emit('location:update', locationPayload)`
**And** the payload includes:
  - `tripCode`: current trip code
  - `riderId`: my device/rider ID
  - `coordinates`: { latitude, longitude, accuracy }
  - `motionState`: 'stationary' | 'predictable' | 'dynamic' (from Story 3.5)
  - `heading`: compass direction (if available)
  - `speed`: current speed in m/s (if available)
  - `timestamp`: ISO 8601 timestamp
**And** the emit includes a client acknowledgment callback
**When** server acknowledges receipt within 500ms
**Then** the update is considered delivered successfully
**And** no retry is needed
**When** server doesn't acknowledge within 500ms
**Then** the update is queued for retry
**And** retry occurs after 1 second with same payload
**And** after 3 failed attempts, the update is added to offline buffer (Story 7.1)
**And** latency is measured (timestamp diff) and logged for monitoring

**Requirements Fulfilled:** FR13, NFR-P1 (P95 latency <500ms), NFR-P5 (>99.5% delivery rate)

---

### Story 3.4: Receive and Process Location Updates from Other Riders

As a **rider**,
I want **to receive location updates from other trip participants**,
So that **I can see their current positions on the map**.

**Acceptance Criteria:**

**Given** I am connected to the trip WebSocket
**When** another rider broadcasts their location (Story 3.3)
**Then** my client receives `location:update` event from server
**And** the event payload includes the other rider's:
  - `riderId`
  - `coordinates` (latitude, longitude, accuracy)
  - `motionState`
  - `heading`
  - `speed`
  - `timestamp`
**And** the location is validated:
  - Coordinates are within valid ranges (lat: -90 to 90, lng: -180 to 180)
  - Accuracy is reasonable (<100m preferred, <500m acceptable)
  - Timestamp is recent (not older than 60 seconds)
**When** validation passes
**Then** the rider's location is updated in Zustand location store
**And** the rider's marker is updated on the Mapbox map
**And** the rider's last-seen timestamp is updated
**When** validation fails
**Then** the update is ignored and error is logged
**And** the rider's previous location remains displayed
**And** no map update occurs

**Requirements Fulfilled:** FR12, FR13

---

### Story 3.5: Implement Motion State Detection (Stationary, Predictable, Dynamic)

As a **rider**,
I want **my motion state automatically detected based on GPS speed and heading changes**,
So that **adaptive GPS polling can optimize battery life based on my riding pattern**.

**Acceptance Criteria:**

**Given** I have GPS location data with speed and heading
**When** the app analyzes my recent location history (last 5 readings)
**Then** motion state is calculated using these rules:
  - **Stationary**: speed < 2 m/s for last 30 seconds → GPS pauses
  - **Predictable**: speed constant (±5 km/h variance) and heading stable (±10° variance) → GPS polling every 10-15 seconds
  - **Dynamic**: speed varying >5 km/h or heading changing >10° → GPS polling every 2-3 seconds
**And** motion state transitions include debouncing (3 consecutive readings before state change)
**And** current motion state is included in every location broadcast
**When** I transition from stationary to moving
**Then** GPS resumes within 2 seconds
**And** first location after resume is broadcast immediately
**When** I transition from dynamic to predictable (highway riding)
**Then** GPS polling interval increases to 10-15 seconds after 30 seconds of stable speed
**And** battery savings are reflected in system usage stats

**Requirements Fulfilled:** FR15, FR16, NFR-P14 (60-80% battery savings), NFR-P15 (fallback if <50% savings)

---

### Story 3.6: Integrate Mapbox GL JS with Custom Style

As a **developer**,
I want **Mapbox GL JS integrated with a custom dark map style**,
So that **riders can view locations on a high-contrast map optimized for outdoor visibility**.

**Acceptance Criteria:**

**Given** the frontend app exists with design system (Epic 1)
**When** the trip screen loads
**Then** Mapbox GL JS is initialized with:
  - Access token from `VITE_MAPBOX_TOKEN` environment variable
  - Container: full-viewport div (`#map`)
  - Style: Mapbox Dark (`mapbox://styles/mapbox/dark-v11`)
  - Initial center: user's current location
  - Initial zoom: 13 (city-level view)
  - Pitch: 0 (flat view)
  - Bearing: 0 (north-up orientation)
**And** map controls are added:
  - NavigationControl (zoom +/-, compass) - positioned top-right
  - GeolocateControl (center on user) - positioned top-right
  - ScaleControl (distance scale) - positioned bottom-left
**And** map interactions are configured:
  - `touchZoomRotate: true` (pinch to zoom, two-finger rotate)
  - `dragPan: true` (single-finger drag)
  - `scrollZoom: false` (prevent accidental zoom while scrolling)
**And** map loads within 2 seconds on 4G connection
**And** WebGL hardware acceleration is enabled for smooth 60fps rendering

**Requirements Fulfilled:** ARCH-18, NFR-I1 (WebGL hardware acceleration), NFR-P7 (LCP <2.5s)

---

### Story 3.7: Render Rider Markers on Map with Status Rings

As a **rider**,
I want **to see all trip participants as markers on the map with color-coded status rings**,
So that **I can quickly identify who's live, stale, or disconnected at a glance**.

**Acceptance Criteria:**

**Given** the Mapbox map is initialized (Story 3.6) and I have received location updates (Story 3.4)
**When** rider locations are available
**Then** RiderMarker components are rendered for each rider on the map
**And** each marker displays:
  - Base circle: 60px diameter with rider initials (first 2 characters of display name)
  - Status ring: 4px stroke around circle edge
  - Heading indicator: small arrow/wedge showing direction (only if speed >5 km/h)
**And** status ring colors indicate connection health:
  - **Live (Green)**: Last update <10 seconds ago, animated pulse (scale 100% → 105% → 100%, 1s cycle)
  - **Stale (Yellow)**: Last update 10-30 seconds ago, fade animation (opacity 1.0 → 0.6 → 1.0, 2s cycle)
  - **Disconnected (Red)**: Last update >30 seconds ago, solid red, timestamp overlay "Last seen Xs ago"
**And** my own marker (self) is blue pulsing dot without status ring (always "live")
**And** marker tap target is 100px diameter (60px visual + 20px invisible padding)
**When** I tap a rider marker
**Then** the map centers on that rider with smooth animation (500ms)
**And** the marker scales to 110% for 300ms as visual feedback

**Requirements Fulfilled:** FR25, FR14, UX-DR14, UX-DR43

---

### Story 3.8: Implement Smooth Avatar Movement Interpolation

As a **rider**,
I want **rider markers to move smoothly between location updates**,
So that **I don't see teleportation jumps that are disorienting during quick glances**.

**Acceptance Criteria:**

**Given** rider markers are rendered on the map (Story 3.7)
**When** a new location update arrives for a rider
**Then** instead of instantly jumping to new position, marker animates smoothly:
  - Duration: calculated based on time between updates (typically 200-500ms)
  - Easing: linear for constant speed, ease-out for deceleration
  - Path: straight line between old and new coordinates
**And** heading indicator rotates smoothly to new direction
**And** if distance between updates >100m (potential GPS jump), marker teleports instantly to avoid slow animation
**And** animation is cancelled if a newer update arrives mid-animation
**And** animation maintains 60fps throughout the transition
**And** no visual jitter or stuttering occurs during map pan/zoom

**Requirements Fulfilled:** FR14, UX-DR44, NFR-U7 (smooth interpolation), NFR-P10 (60fps rendering)

---

### Story 3.9: Implement Group View Auto-Zoom

As a **rider**,
I want **to tap a "Group View" button that auto-zooms the map to fit all riders**,
So that **I can see my entire group's spatial distribution at a glance**.

**Acceptance Criteria:**

**Given** multiple riders are active on the trip
**When** I tap the "Group View" FAB button (positioned top-right, below navigation controls)
**Then** the map calculates bounding box containing all rider positions
**And** map animates to fit all riders in viewport with:
  - Padding: 80px on all sides (ensures markers aren't at edge)
  - Duration: 1 second smooth animation
  - Easing: ease-in-out curve
  - Max zoom: 18 (prevents excessive zoom if riders are very close)
  - Min zoom: 8 (prevents excessive zoom-out if riders are very far)
**And** after animation completes, map remains interactive (can pan/zoom manually)
**When** riders are moving and positions update
**Then** Group View doesn't auto-update (requires manual re-tap)
**And** a subtle indicator shows "Group View active - tap again to refresh"
**When** I am the only rider in the trip
**Then** "Group View" button is hidden (no need for group framing with 1 rider)

**Requirements Fulfilled:** FR20

---

### Story 3.10: Display Last-Seen Timestamps for Riders

As a **rider**,
I want **to see last-seen timestamps for each trip participant**,
So that **I know how current their location data is**.

**Acceptance Criteria:**

**Given** riders are displayed on the map with status rings (Story 3.7)
**When** a rider's last update is >30 seconds old (disconnected state)
**Then** a timestamp overlay appears near their marker:
  - Format: "Last seen Xs ago" or "Last seen Xm ago"
  - Style: small text (0.875rem), semi-transparent dark background, white text
  - Position: below the marker avatar
  - Updates every 5 seconds to reflect increasing time
**When** a rider reconnects and sends a new update
**Then** the timestamp overlay is removed
**And** status ring transitions from red (disconnected) to green (live) with animation
**And** marker scales briefly (110% for 300ms) to indicate reconnection
**When** hovering/tapping a marker (any state)
**Then** a tooltip shows detailed connection info:
  - Display name
  - Last update: "X seconds ago" or "Live"
  - Accuracy: "±Xm"
  - Speed: "X km/h" (if available)

**Requirements Fulfilled:** FR17, FR18

---

### Story 3.11: Implement Connection Status Detection with Visual Decay

As a **rider**,
I want **visual decay indicators showing staleness of location data**,
So that **I can differentiate between live, slightly delayed, and disconnected riders**.

**Acceptance Criteria:**

**Given** riders are displayed with status rings (Story 3.7)
**When** time since last update increases
**Then** visual decay progresses through stages:
  - **0-10s (Live)**: Green pulsing ring, full opacity marker
  - **10-30s (Stale)**: Yellow fading ring, 85% opacity marker
  - **30-60s (Very Stale)**: Orange solid ring, 70% opacity marker, "Last seen Xs ago" overlay
  - **>60s (Disconnected)**: Red solid ring, 50% opacity marker, "Last seen Xm ago" overlay
**And** transitions between stages are smooth (300ms fade)
**And** marker size remains constant (no shrinking) to maintain touch target
**When** a rider enters "Very Stale" or "Disconnected" state
**Then** an uncertainty radius is drawn around their marker:
  - Expanding circle showing potential position error
  - Radius increases by 50m every 10 seconds
  - Max radius: 500m
  - Style: dotted line, low opacity, same color as status ring
**When** a disconnected rider reconnects
**Then** uncertainty radius fades out over 500ms
**And** marker returns to full opacity with green pulsing ring

**Requirements Fulfilled:** FR18, FR19, NFR-R14 (<2% false positive disconnect rate)

---

### Story 3.12: Implement Responsive Layouts (Mobile, Tablet, Desktop)

As a **user**,
I want **the map interface to adapt responsively to mobile, tablet, and desktop screens**,
So that **I get optimized layouts for my device (full-screen on mobile, split-view on desktop)**.

**Acceptance Criteria:**

**Given** the app is running on any device size
**When** viewport width is <768px (mobile)
**Then** mobile rider view is rendered:
  - Map: 100% viewport height and width (full-screen)
  - Bottom status bar: fixed at bottom, 15vh height (25vh in glance mode)
  - FABs: Voice (bottom-right), SOS (bottom-left), 80px diameter
  - Navigation: bottom navigation bar (5 tabs, 60px height)
  - Member list: bottom sheet (slides up on tap, 70vh height)
**When** viewport width is 768-1023px (tablet)
**Then** tablet split-view is rendered:
  - Map: 66% width (left side)
  - Member list sidebar: 34% width (right side, persistent)
  - Bottom status bar: hidden (replaced by sidebar stats)
  - FABs: positioned within map area (not overlapping sidebar)
**When** viewport width is ≥1024px (desktop)
**Then** desktop management view is rendered:
  - Map: 60% width (left side)
  - Enhanced sidebar: 40% width (right side)
    - Trip statistics (top): duration, distance, avg speed
    - Member list (middle): scrollable, detailed info per rider
    - Settings panel (bottom): host controls, preferences
  - Container max-width: 1440px, centered on ultrawide screens
  - FABs: 64px diameter (smaller, mouse-friendly)
**And** layout transitions smoothly when resizing window (300ms)

**Requirements Fulfilled:** UX-DR27, UX-DR28, UX-DR29, NFR-A3 (functional at 200% zoom)

---

## Epic 3 Summary

**Stories Created:** 11  
**Requirements Covered:**
- FRs: FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR25 (11 FRs)
- UX Design: UX-DR14, UX-DR27, UX-DR28, UX-DR29, UX-DR43, UX-DR44
- Architecture: ARCH-18
- NFRs: NFR-P1, NFR-P5, NFR-P7, NFR-P10, NFR-P14, NFR-P15, NFR-I1, NFR-U7, NFR-R4, NFR-R14, NFR-S1, NFR-A3

**Epic 3 Status:** ✅ Complete
