# Epic 6: Trip Host Management Controls

**Goal:** Provide trip hosts with comprehensive management capabilities including participant oversight, access control, and trip lifecycle management.

**User Outcome:** Trip hosts can view all riders with join timestamps, kick misbehaving riders, ban device IDs, rotate trip codes, and end trips with proper data cleanup.

---

### Story 6.1: Display Rider List with Join Timestamps for Host

As a **trip host**,
I want **to view a list of all joined riders with their display names and join timestamps**,
So that **I can monitor who's in my trip and when they joined**.

**Acceptance Criteria:**

**Given** I am the trip host
**When** I open the member list (Story 4.3)
**Then** my view includes additional host-only information:
  - Crown icon next to my name indicating host status
  - Join timestamps for all riders: "Joined X minutes ago"
  - Device ID (masked, last 4 characters): "Device: ...AB12"
  - Host controls dropdown menu (3-dot icon) for each rider
**And** the list displays riders sorted by join order (oldest first)
**And** host-only UI elements are hidden for non-host riders
**When** I tap the 3-dot menu for a rider
**Then** a dropdown menu appears with options:
  - "View Details" (shows full rider info modal)
  - "Center on Map"
  - "Kick from Trip" (red text)
  - "Ban Device" (red text, requires kick first)

**Requirements Fulfilled:** FR4

---

### Story 6.2: Kick Rider from Active Trip

As a **trip host**,
I want **to kick a rider from the trip**,
So that **I can remove misbehaving participants or manage trip size**.

**Acceptance Criteria:**

**Given** I am the trip host viewing the member list (Story 6.1)
**When** I tap "Kick from Trip" in a rider's menu
**Then** a confirmation dialog appears:
  - Title: "Kick [Rider Name]?"
  - Message: "This will immediately remove them from the trip. They can rejoin with the trip code unless you ban their device."
  - Buttons: "Kick" (red, 120px), "Cancel" (gray, 80px)
**When** I confirm the kick
**Then** a `trip:kick` WebSocket event is sent to the backend with:
  - `tripCode`: current trip
  - `hostId`: my device ID (for authorization)
  - `targetRiderId`: rider being kicked
**And** the backend validates I am the host before processing
**And** the kicked rider is removed from the trip's riders array in MongoDB
**And** the kicked rider receives a `trip:kicked` event
**And** their app displays a modal: "You have been removed from this trip by the host."
**And** they are redirected to the home screen
**And** the kicked rider's marker disappears from all participants' maps
**And** all participants see a toast: "[Rider Name] was removed from the trip"
**And** if host authorization fails, an error is returned: "Only the host can kick riders"

**Requirements Fulfilled:** FR5, NFR-S7 (server-side authorization)

---

### Story 6.3: Ban Device ID from Rejoining Trip

As a **trip host**,
I want **to ban a device ID after kicking a rider**,
So that **they cannot rejoin the trip even with the trip code**.

**Acceptance Criteria:**

**Given** I have kicked a rider (Story 6.2)
**When** the kick confirmation succeeds
**Then** an additional prompt appears:
  - Title: "Ban this device?"
  - Message: "Prevent this rider from rejoining this trip. Ban lasts until trip ends."
  - Buttons: "Ban Device" (red, 120px), "No Thanks" (gray, 80px)
**When** I confirm the ban
**Then** a `trip:ban` WebSocket event is sent with:
  - `tripCode`, `hostId`, `targetDeviceId`
**And** the backend adds the device ID to the trip's `bannedDevices` array in MongoDB
**And** the ban is also cached in Redis with same TTL as trip (12 hours)
**When** the banned rider attempts to rejoin with the trip code
**Then** the join request is rejected with error: "You have been banned from this trip"
**And** no further join attempts are allowed from that device for this trip
**And** the ban is automatically cleared when the trip ends
**And** host can view banned devices list in trip settings

**Requirements Fulfilled:** FR7, NFR-S8 (ban enforcement across all mechanisms)

---

### Story 6.4: Expire and Rotate Trip Code

As a **trip host**,
I want **to expire the current trip code and generate a new one**,
So that **I can prevent new riders from joining after the trip has started or control access**.

**Acceptance Criteria:**

**Given** I am the trip host
**When** I access trip settings (3-dot menu in top-right)
**Then** a "Security" section includes "Rotate Trip Code" option
**When** I tap "Rotate Trip Code"
**Then** a confirmation dialog appears:
  - Title: "Rotate Trip Code?"
  - Message: "Current code will stop working. A new code will be generated. Existing riders stay connected."
  - Buttons: "Generate New Code" (orange, 120px), "Cancel" (80px)
**When** I confirm rotation
**Then** the backend generates a new 6-digit cryptographically random code
**And** the old trip code is removed from Redis (immediately invalid)
**And** the new trip code is added to Redis with 12-hour TTL
**And** the trip document in MongoDB is updated with new `tripCode` and `codeRotatedAt` timestamp
**And** existing riders remain connected (not affected)
**And** the new code is displayed to me in TripCodeDisplay component (Story 2.2)
**And** a toast confirms: "Trip code updated. Share the new code with riders."
**When** someone attempts to join with the old code after rotation
**Then** join fails with error: "Trip code expired or invalid"

**Requirements Fulfilled:** FR6

---

### Story 6.5: End Trip Manually with Data Deletion Trigger

As a **trip host**,
I want **to manually end the trip which triggers automatic data deletion**,
So that **I can conclude the ride and ensure location data is removed as promised**.

**Acceptance Criteria:**

**Given** I am the trip host with an active trip
**When** I tap "End Trip" button in trip settings or bottom nav
**Then** a confirmation dialog appears:
  - Title: "End Trip?"
  - Message: "This will end the trip for all riders. Location data will be deleted within 30 seconds."
  - Warning: "This action cannot be undone."
  - Buttons: "End Trip" (red, 120px), "Cancel" (80px)
**When** I confirm ending the trip
**Then** a `trip:end` WebSocket event is broadcast to all riders
**And** the backend updates trip status to 'ended' in MongoDB
**And** the trip code is removed from Redis immediately
**And** all riders' live location data is deleted from Redis (30-second TTL enforcement)
**And** all riders receive the `trip:ended` event and are redirected to post-trip summary (Epic 9)
**And** all riders see a confirmation modal: "Trip ended by host. Location data deleted."
**And** push notifications are sent to all riders (if permitted, Story 5.10)
**And** a data deletion confirmation is logged for compliance (Epic 8)

**Requirements Fulfilled:** FR8, FR39, NFR-S10 (Redis TTL 30s)

---

### Story 6.6: Auto-End Trip After 12 Hours

As a **system**,
I want **to automatically end trips after 12 hours of activity**,
So that **trips don't remain active indefinitely and data retention policies are enforced**.

**Acceptance Criteria:**

**Given** a trip has been active for 12 hours
**When** the backend cron job runs (every 10 minutes)
**Then** the job queries MongoDB for trips where:
  - `status: 'active'`
  - `createdAt < (now - 12 hours)`
**And** for each expired trip:
  - Trip status is updated to 'ended' in MongoDB
  - Trip code is removed from Redis
  - All riders' live location data is deleted from Redis
  - `trip:ended` WebSocket event is broadcast to all connected riders
  - Push notifications are sent: "Your trip has ended (12-hour limit)"
**And** disconnected riders (not connected to WebSocket) receive push notification when they next come online
**When** riders attempt to rejoin an auto-ended trip
**Then** they see error: "This trip has ended (12-hour time limit)"
**And** auto-end events are logged for analytics and monitoring

**Requirements Fulfilled:** FR9

---

### Story 6.7: Auto-End Trip at 10% Battery Level

As a **system**,
I want **to prompt trip end when device battery reaches 10%**,
So that **riders conserve remaining battery for essential communication**.

**Acceptance Criteria:**

**Given** I am in an active trip with GPS tracking enabled
**When** the Battery Status API detects battery level ≤10%
**Then** a warning modal appears:
  - Title: "Low Battery Warning"
  - Message: "Battery at 10%. Location tracking will stop soon to preserve battery."
  - Recommendation: "Consider ending trip or charging device."
  - Buttons: "End Trip Now" (orange, 120px), "Continue Trip" (gray, 80px)
**When** I tap "End Trip Now"
**Then** the trip ends with same flow as manual host end (Story 6.5)
**When** I tap "Continue Trip"
**Then** GPS polling interval increases to maximum (15 seconds) to conserve battery
**And** non-critical features are disabled (animations, haptic feedback reduced)
**And** a persistent banner shows: "Battery Saver Mode Active"
**When** battery reaches 5%
**Then** the trip automatically ends without further prompt
**And** GPS tracking stops immediately
**And** a final push notification is sent: "Trip ended to preserve battery"
**And** if Battery Status API is unsupported, low battery prompts are not shown

**Requirements Fulfilled:** FR9, NFR-P16 (battery monitoring, feature disabling <15%)

---

### Story 6.8: Allow Rider to Leave Trip Voluntarily

As a **rider** (non-host),
I want **to voluntarily leave a trip before it ends**,
So that **I can exit the group if I'm separating or no longer need tracking**.

**Acceptance Criteria:**

**Given** I am a rider (not host) in an active trip
**When** I tap "Leave Trip" button in trip settings
**Then** a confirmation dialog appears:
  - Title: "Leave Trip?"
  - Message: "You will stop sharing your location. You can rejoin with the trip code if needed."
  - Buttons: "Leave" (orange, 120px), "Cancel" (80px)
**When** I confirm leaving
**Then** a `trip:leave` WebSocket event is sent with my `riderId`
**And** I am removed from the trip's riders array in MongoDB
**And** my live location data is deleted from Redis
**And** my marker disappears from all participants' maps
**And** all participants see a toast: "[Rider Name] left the trip"
**And** I am redirected to the home screen with message: "You left the trip"
**When** I am the trip host and tap "Leave Trip"
**Then** a different confirmation appears:
  - "You are the host. Leaving will end the trip for all riders."
  - Options: "End Trip for All", "Cancel"
**And** if confirmed, the trip ends for everyone (Story 6.5)

**Requirements Fulfilled:** FR10

---

## Epic 6 Summary

**Stories Created:** 8
**Requirements Covered:**
- FRs: FR4, FR5, FR6, FR7, FR8, FR9, FR10 (7 FRs)
- NFRs: NFR-S7, NFR-S8, NFR-S10, NFR-P16

**Epic 6 Status:** ✅ Complete

---

