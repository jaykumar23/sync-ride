# Epic 4: Group Awareness & Coordination Tools

**Goal:** Provide riders with continuous group cohesion monitoring through nearest rider distance, group spread metrics, and interactive member list.

**User Outcome:** Users can instantly assess group status, see who's nearby or falling behind, tap members to center on their location, and monitor overall group spread.

---

### Story 4.1: Calculate and Display Nearest Rider Distance

As a **rider**,
I want **to see the distance to my nearest group member with color-coded indicator**,
So that **I know if I'm falling behind or pulling ahead**.

**Acceptance Criteria:**

**Given** there are multiple riders in the trip
**When** location updates are received
**Then** the app calculates distance to nearest rider using Haversine formula
**And** nearest rider distance is displayed in BottomStatusBar component:
  - Format: "X.X km" with 1 decimal place (or "Xm" if <1km)
  - Position: left section of bottom bar
  - Includes nearest rider's name and avatar
**And** distance is color-coded based on threshold:
  - **Green**: <500m (tight group)
  - **Yellow**: 500m-2km (moderate spread)
  - **Orange**: 2km-5km (wide spread)
  - **Red**: >5km (separated)
**And** distance updates every 3 seconds with smooth number transitions
**And** tapping the nearest rider section centers map on that rider
**When** I am the only rider or all other riders are disconnected
**Then** section shows "No other riders nearby"

**Requirements Fulfilled:** FR21, UX-DR17, NFR-P3 (<100ms Redis geospatial queries)

---

### Story 4.2: Calculate and Display Group Spread Indicator

As a **rider**,
I want **to see the maximum distance between any two riders in the group (group spread)**,
So that **I understand how scattered the group is overall**.

**Acceptance Criteria:**

**Given** there are multiple riders in the trip
**When** location updates are received
**Then** the backend calculates group spread:
  - Finds the two riders who are furthest apart
  - Calculates distance between them using Haversine formula
  - Caches result in Redis with 5-second TTL
**And** group spread is displayed in BottomStatusBar (center section):
  - Format: "Group: X.X km"
  - Icon: expand arrows (⟷) indicating spread
  - Updates every 5 seconds
**And** spread is color-coded:
  - **Green**: <1km (very tight)
  - **Yellow**: 1-3km (normal)
  - **Orange**: 3-10km (spread out)
  - **Red**: >10km (widely scattered)
**When** tapping the group spread indicator
**Then** Group View is triggered (auto-zoom to fit all riders, Story 3.9)
**When** only 2 riders are in trip
**Then** group spread equals distance between them
**When** in glance mode (moving)
**Then** group spread is hidden (minimizes information overload)

**Requirements Fulfilled:** FR22

---

### Story 4.3: Display Member List with Online/Offline Status

As a **rider**,
I want **to access a member list showing all trip participants with their online/offline status**,
So that **I can see who's actively sharing location and who's disconnected**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** I tap the BottomStatusBar or "Members" navigation button
**Then** MemberListSheet component slides up from bottom (70vh height on mobile)
**And** the member list displays all riders with:
  - Avatar with status ring (green/yellow/red based on connection)
  - Display name
  - Online/Offline badge
  - Last seen timestamp (if offline: "Last seen Xm ago")
  - Distance from me (e.g., "1.2 km away")
**And** riders are sorted by:
  - Host first (with crown icon)
  - Online riders (sorted by distance, nearest first)
  - Offline riders (sorted by last seen, most recent first)
**And** each member list item has 80px height (glove-friendly touch target)
**And** list is scrollable if more than 8 riders (viewport height limit)
**When** tapping a member list item
**Then** the map centers on that rider's location
**And** the member list sheet dismisses with slide-down animation
**When** swiping down on the sheet handle
**Then** the member list sheet dismisses

**Requirements Fulfilled:** FR23, UX-DR20, UX-DR22

---

### Story 4.4: Tap-to-Center-on-Rider from Member List

As a **rider**,
I want **to tap any rider in the member list and have the map center on their location**,
So that **I can quickly locate specific group members on the map**.

**Acceptance Criteria:**

**Given** the member list is open (Story 4.3)
**When** I tap a rider entry
**Then** the member list sheet dismisses with slide-down animation (300ms)
**And** the map animates to center on that rider's marker:
  - Duration: 800ms smooth animation
  - Target zoom: 15 (close enough to see local streets)
  - Easing: ease-in-out curve
**And** the centered rider's marker briefly scales to 120% for 400ms (visual feedback)
**And** if the rider is disconnected (red status), map centers on their last-known position
**And** after centering, map remains interactive (can pan/zoom manually)
**When** the centered rider is offline/disconnected
**Then** a toast appears: "Showing last known position (Xm ago)"

**Requirements Fulfilled:** FR24

---

### Story 4.5: Display Rider Status Icons on Avatars

As a **rider**,
I want **to see status icons on rider avatars indicating their current state (fuel, break, mechanical, emergency)**,
So that **I understand what's happening with each group member without needing to read messages**.

**Acceptance Criteria:**

**Given** riders can broadcast status messages (implemented in Epic 5)
**When** a rider sets a status
**Then** an icon overlay appears on their map marker avatar:
  - ⛽ Fuel (gas icon): yellow badge, top-right corner
  - ☕ Break (coffee icon): blue badge, top-right corner
  - 🔧 Mechanical (wrench icon): orange badge, top-right corner
  - 🚨 Emergency (SOS): red badge, full marker pulse (handled in Epic 5)
**And** the status icon is 20px diameter (1/3 of marker size)
**And** icon appears in member list as well (next to rider name)
**When** a rider clears their status or it expires (auto-clear after 15 minutes)
**Then** the icon overlay is removed with fade-out animation (300ms)
**And** multiple riders can have different statuses simultaneously
**And** only the most recent status per rider is displayed (one icon at a time)

**Requirements Fulfilled:** FR26

---

### Story 4.6: Calculate and Display ETA for Separated Riders

As a **rider**,
I want **to see ETA for separated riders to rejoin the group**,
So that **I know approximately when a fallen-behind rider will catch up**.

**Acceptance Criteria:**

**Given** a rider is >2km away from the group (separated)
**When** that rider is moving toward the group (closing distance)
**Then** an ETA is calculated based on:
  - Current distance between rider and nearest group member
  - Rider's current speed (from GPS)
  - Assumption: speed remains constant
  - Formula: ETA (minutes) = distance (km) / speed (km/h) × 60
**And** ETA is displayed:
  - In member list next to rider name: "ETA: Xm"
  - On map marker tooltip on hover/tap: "Rejoining in Xm"
  - Color: yellow (indicates temporary separation)
**And** ETA updates every 10 seconds as speed and distance change
**When** rider's speed is <5 km/h (stopped or very slow)
**Then** ETA shows "—" (no estimate, rider is stationary)
**When** rider is moving away from group (distance increasing)
**Then** ETA shows "Moving away" in red
**When** rider gets within 500m of group
**Then** ETA indicator is removed (rider has rejoined)

**Requirements Fulfilled:** FR27

---

## Epic 4 Summary

**Stories Created:** 6
**Requirements Covered:**
- FRs: FR21, FR22, FR23, FR24, FR26, FR27 (6 FRs)
- UX Design: UX-DR17, UX-DR20, UX-DR22
- NFRs: NFR-P3

**Epic 4 Status:** ✅ Complete

---

