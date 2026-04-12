# Epic 5: Safety Communication (SOS & Voice Status)

**Goal:** Enable critical safety communication through one-tap SOS broadcasts, voice status updates with STT, and haptic proximity alerts.

**User Outcome:** Users can send emergency alerts, broadcast voice status messages (English + Hindi), use predefined status buttons, and receive haptic feedback for proximity and emergencies.

---

### Story 5.1: Display SOS Button with Long-Press Activation

As a **rider**,
I want **a persistent SOS button that activates via long-press to prevent accidental triggers**,
So that **I can broadcast emergencies to my group with confidence**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** the trip screen loads
**Then** the SOSButton component renders as a floating action button:
  - Position: fixed bottom-left, 16px margin
  - Size: 80px diameter (collapsed state)
  - Background: red (#FF0000)
  - Label: "SOS" in white, 2rem bold font
  - Z-index: 20 (above map, below modals)
**And** short tap (<500ms) does nothing (prevents accidental activation)
**When** I long-press the SOS button (hold >1 second)
**Then** the button expands to full width with animation:
  - Target height: 160px (bottom-third of screen)
  - Width: 100%
  - Label changes to "Hold to Activate SOS"
  - Progress bar appears showing hold duration (fills over 2 seconds)
**When** I hold for full 2 seconds
**Then** a confirmation dialog opens:
  - Title: "Send SOS Alert?"
  - Message: "This will notify all group members of your emergency and share your exact location."
  - Buttons: "Send SOS" (red, 120px), "Cancel" (gray, 80px)
  - Continuous strong haptic vibration while dialog is open
**When** I release before 2 seconds
**Then** the button collapses back to 80px circle with animation
**And** no SOS is sent

**Requirements Fulfilled:** FR28, UX-DR16, NFR-A6 (80x80px critical action target)

---

### Story 5.2: Broadcast SOS Alert to All Trip Participants

As a **rider**,
I want **my SOS alert broadcast to all group members immediately after confirmation**,
So that **everyone knows I need help and can see my exact location**.

**Acceptance Criteria:**

**Given** I have confirmed the SOS alert (Story 5.1)
**When** I tap "Send SOS" in the confirmation dialog
**Then** the backend broadcasts `sos:broadcast` event via WebSocket to all connected riders in the trip
**And** the SOS payload includes:
  - `riderId`: my device ID
  - `displayName`: my rider name
  - `coordinates`: my exact current location
  - `timestamp`: ISO 8601 timestamp of SOS trigger
  - `tripCode`: current trip code
**And** all riders receive the SOS event within 500ms (P95 latency target)
**And** my SOS button changes state:
  - Label: "Cancel SOS"
  - Pulsing animation continues
  - Background: solid red with white pulsing ring
**And** my map marker increases to 80px diameter with continuous red pulse
**And** a toast confirms: "SOS sent to all riders"
**When** other riders receive my SOS
**Then** their devices trigger:
  - Full-screen SOS alert modal with my name and distance
  - Continuous strong haptic vibration (3 seconds)
  - Push notification if app is backgrounded
  - Audio alert (if notifications enabled)
**And** a dashed line is drawn on their maps from their position to my SOS location

**Requirements Fulfilled:** FR28, FR34, NFR-P1 (P95 latency <500ms)

---

### Story 5.3: Display SOS Alert Received Modal for Other Riders

As a **rider**,
I want **to immediately see when another rider sends an SOS with their location and distance**,
So that **I can assess the situation and coordinate a response**.

**Acceptance Criteria:**

**Given** another rider has broadcast an SOS (Story 5.2)
**When** I receive the `sos:broadcast` event
**Then** a full-screen SOS alert modal appears over the map:
  - Red background (#FF0000)
  - Large SOS icon (warning triangle)
  - Rider name in 3rem bold white text
  - Distance: "X.X km away" in 2.5rem white text
  - Exact coordinates below (smaller text)
  - Action buttons (all 120px tall, white background, red text):
    - "View on Map" (primary)
    - "Call [if contact available]"
    - "Dismiss"
**And** continuous strong haptic vibration triggers for 3 seconds
**And** audio alert plays (loud beep, if device not muted)
**And** if app is backgrounded, a high-priority push notification appears:
  - Title: "SOS ALERT"
  - Body: "[Rider Name] needs help - X.X km away"
  - Action: "View" (opens app to SOS modal)
**When** I tap "View on Map"
**Then** the modal dismisses and map centers on SOS sender's location
**And** SOS sender's marker is highlighted (80px, pulsing red)
**And** a dashed line connects my position to theirs
**When** I tap "Dismiss"
**Then** the modal closes but SOS marker remains visible on map
**And** I can reopen SOS details from member list

**Requirements Fulfilled:** FR28, FR35, NFR-U8 (distinct haptic patterns)

---

### Story 5.4: Implement Voice Input FAB for Status Updates

As a **rider**,
I want **a voice input button to tap-and-speak my status updates hands-free**,
So that **I can communicate with my group without typing while riding**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** the trip screen loads
**Then** the VoiceInputFAB component renders:
  - Position: fixed bottom-right, 16px margin from edge, 80px above bottom nav bar
  - Size: 80px diameter circle
  - Background: primary blue (#3B82F6)
  - Icon: microphone (white, 32px)
  - Z-index: 20
**When** I tap the voice FAB
**Then** recording starts immediately:
  - Button background changes to red
  - Red pulsing ring animates around button (scale 100% → 110%, 500ms cycle)
  - Microphone icon turns red
  - Haptic pulse every 500ms while recording
  - Speech recognition starts (Web Speech API)
**And** a toast appears: "Speak your status..."
**When** I speak (e.g., "I need gas")
**Then** audio is captured and transcribed in real-time
**And** transcribed text appears below the FAB in a bubble (live preview)
**When** I tap the FAB again (or release after 10 seconds max)
**Then** recording stops
**And** transcribed text is sent as status message to all riders
**And** button returns to blue with microphone icon
**And** a green checkmark briefly appears (1 second) indicating success
**And** double haptic pulse confirms send

**Requirements Fulfilled:** FR30, UX-DR15, UX-DR41, NFR-U4 (tap-to-speak bottom 1/3 accessible)

---

### Story 5.5: Integrate Web Speech API for Voice Transcription

As a **developer**,
I want **Web Speech API integrated for voice-to-text transcription (English + Hindi)**,
So that **riders can send voice status updates with accurate transcription in noisy conditions**.

**Acceptance Criteria:**

**Given** the voice FAB is implemented (Story 5.4)
**When** recording starts
**Then** Web Speech API is initialized:
  - `lang: 'en-US'` (default) or `'hi-IN'` based on user preference
  - `continuous: false` (single utterance)
  - `interimResults: true` (show real-time preview)
  - `maxAlternatives: 1` (best guess only)
**And** speech recognition captures audio and returns transcription
**When** transcription accuracy is >75% confidence
**Then** the transcribed text is accepted and broadcast
**When** transcription accuracy is <75% or recognition fails
**Then** a fallback modal appears:
  - "Voice recognition unclear. Type your status instead?"
  - Large text input (80px height, 1.5rem font)
  - "Send" button (120px wide)
**And** if Web Speech API is unsupported (browser compatibility)
**Then** voice FAB shows disabled state with tooltip: "Voice input not supported on this device"
**And** fallback to text-only status input
**And** detection of helmet/wind noise environment logged for analytics

**Requirements Fulfilled:** FR31, NFR-I4, NFR-I5, NFR-I6, NFR-U2 (>85% accuracy target), NFR-U3 (fallback if <75%)

---

### Story 5.6: Display Predefined Status Message Buttons

As a **rider**,
I want **large predefined status buttons (Need gas, Taking break, Mechanical issue, Medical emergency)**,
So that **I can quickly send common messages with gloves on without typing or speaking**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** I tap the "Status" button in bottom navigation
**Then** a bottom sheet slides up with predefined status buttons:
  - "Need Gas" ⛽ (yellow, 120px tall, full width)
  - "Taking Break" ☕ (blue, 120px tall, full width)
  - "Mechanical Issue" 🔧 (orange, 120px tall, full width)
  - "Medical Emergency" 🚨 (red, 120px tall, full width)
**And** each button has:
  - Large icon (48px) on left
  - Status text (1.5rem) center-aligned
  - Minimum 16px vertical spacing between buttons
**When** I tap a status button
**Then** the status is broadcast to all riders via WebSocket
**And** my rider avatar displays the corresponding status icon (Story 4.5)
**And** the bottom sheet dismisses with slide-down animation
**And** a confirmation toast appears: "[Status] sent to group"
**And** haptic feedback (single pulse) confirms tap
**When** I tap "Medical Emergency"
**Then** an additional confirmation dialog appears:
  - "Send Medical Emergency Alert?"
  - "This will notify all riders immediately."
  - "Confirm" (red, 120px), "Cancel" (80px)
**And** if confirmed, all riders receive high-priority alert (similar to SOS)

**Requirements Fulfilled:** FR32, NFR-U1 (>90% glove success rate)

---

### Story 5.7: Implement Haptic Proximity Alerts

As a **rider**,
I want **distinct haptic vibration patterns when approaching riders or falling behind**,
So that **I can sense group cohesion changes without looking at my phone**.

**Acceptance Criteria:**

**Given** I am riding with active GPS and other riders are nearby
**When** I am approaching a rider ahead (closing distance <500m)
**Then** my device vibrates with 2 short pulses (200ms on, 100ms off, 200ms on)
**And** the proximity alert triggers once per rider per approach (not continuously)
**And** a 30-second cooldown prevents repeated alerts for same rider
**When** I am falling behind the group (distance increasing >2km)
**Then** my device vibrates with 3 long pulses (400ms on, 200ms off, repeating)
**And** this alert repeats every 2 minutes while falling behind
**When** another rider sends an SOS (Story 5.2)
**Then** continuous strong vibration triggers for 3 seconds
**And** haptic is accompanied by audio alert (if not muted)
**And** if Vibration API is unsupported
**Then** visual-only alternatives are shown:
  - Screen flash (white → red → white)
  - Prominent banner notification
**And** users can adjust haptic intensity in Settings (off, low, medium, high)

**Requirements Fulfilled:** FR33, UX-DR40, UX-DR42, NFR-U8, NFR-U9 (>80% recognizability), NFR-A10 (visual alternatives)

---

### Story 5.8: Share Exact Coordinates with Emergency Contacts

As a **rider**,
I want **to share my exact coordinates via SMS or messaging apps during an emergency**,
So that **support vehicles or emergency services can locate me precisely**.

**Acceptance Criteria:**

**Given** I am in an SOS situation or need to share my location
**When** I long-press my own rider marker or tap "Share Location" in Settings
**Then** a share options modal appears with:
  - My current coordinates (latitude, longitude, 6 decimal places)
  - Google Maps link: `https://maps.google.com/?q=lat,lng`
  - Share buttons: SMS, WhatsApp, Copy, More (system share sheet)
**When** I tap SMS
**Then** SMS composer opens with pre-filled message:
  - "I need help at this location: [Google Maps link]"
  - "SyncRide Trip Code: [CODE]"
**When** I tap WhatsApp
**Then** WhatsApp opens with same pre-filled message
**When** I tap Copy
**Then** coordinates and Google Maps link are copied to clipboard
**And** a toast confirms: "Location copied to clipboard"
**When** I tap More
**Then** the native system share sheet opens with the location text
**And** I can choose any available app (email, Telegram, etc.)

**Requirements Fulfilled:** FR34

---

### Story 5.9: Display Distraction Warnings on First Launch

As a **user**,
I want **to see distraction warnings before using SOS and on first app launch**,
So that **I understand the safety risks and limitations of using the app while riding**.

**Acceptance Criteria:**

**Given** I am launching SyncRide for the first time
**When** the app loads (after Terms of Service, Story 2.5)
**Then** a distraction warning modal appears:
  - Title: "Safety First"
  - Message: "SyncRide is designed for quick glances. Do not use this app while actively riding. Pull over safely before interacting."
  - Highlight: "Never text, tap, or navigate while in motion."
  - Checkbox: "I understand the risks" (required)
  - "Continue" button (disabled until checkbox checked)
**And** after confirmation, warning is saved to localStorage (don't show again)
**When** I long-press the SOS button for the first time (Story 5.1)
**Then** before the SOS confirmation dialog, a one-time warning appears:
  - Title: "SOS Limitations"
  - Message: "SOS is not a substitute for emergency services (911/112). Your group members are not trained responders."
  - Highlight: "Always call emergency services first in life-threatening situations."
  - "I Understand" button
**And** after acknowledgment, SOS confirmation dialog appears
**And** this SOS warning only shows once per device (saved to localStorage)

**Requirements Fulfilled:** FR36, NFR-U12 (distraction warnings), FR41 (SOS limitations in ToS)

---

### Story 5.10: Send Push Notifications for Critical Events

As a **rider**,
I want **to receive push notifications for SOS alerts and trip end events even when the app is backgrounded**,
So that **I don't miss critical safety information**.

**Acceptance Criteria:**

**Given** I have granted push notification permission (Story 2.8)
**When** another rider sends an SOS alert (Story 5.2)
**Then** a high-priority push notification is sent to my device:
  - Title: "🚨 SOS ALERT"
  - Body: "[Rider Name] needs help - X.X km away"
  - Priority: high (bypasses Do Not Disturb on some platforms)
  - Sound: loud alert sound
  - Action buttons: "View" (opens app), "Dismiss"
**When** the trip host ends the trip (Story 6.5)
**Then** a push notification is sent to all riders:
  - Title: "Trip Ended"
  - Body: "Your SyncRide trip has ended. Location data deleted."
  - Priority: default
  - Action: "View Summary" (opens post-trip screen, Epic 9)
**When** I am disconnected for >5 minutes
**Then** a push notification is sent to me:
  - Title: "Connection Lost"
  - Body: "Reconnect to share your location with the group."
  - Action: "Reconnect" (opens app)
**And** notifications include trip code in metadata for routing to correct trip screen
**And** if notification permission is denied, in-app alerts are shown instead (fallback)

**Requirements Fulfilled:** FR35, NFR-I9 (FCM/APNs with Service Worker)

---

## Epic 5 Summary

**Stories Created:** 10
**Requirements Covered:**
- FRs: FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36 (9 FRs)
- UX Design: UX-DR15, UX-DR16, UX-DR21, UX-DR23, UX-DR40, UX-DR41, UX-DR42
- NFRs: NFR-U1, NFR-U2, NFR-U3, NFR-U4, NFR-U8, NFR-U9, NFR-U12, NFR-A6, NFR-A10, NFR-I4, NFR-I5, NFR-I6, NFR-I9, NFR-P1

**Epic 5 Status:** ✅ Complete

---

