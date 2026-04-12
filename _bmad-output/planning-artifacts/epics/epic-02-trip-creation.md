# Epic 2: Trip Creation & Joining

**Goal:** Enable users to create ephemeral trip sessions, share trip codes via multiple channels, and join existing trips with proper consent flows and platform permissions.

**User Outcome:** Users can create trips, share trip codes (WhatsApp/SMS/clipboard), and join groups within seconds with zero signup friction while understanding data collection and retention policies.

**FRs Covered:** FR1, FR2, FR3, FR37, FR38, FR41, FR61, FR62, FR63, FR64, FR65, FR66 (12 total)

**UX Design Requirements:**
- UX-DR18: TripCodeDisplay component (large monospace code, QR code, share options)
- UX-DR22: Sheet component customization (member list bottom drawer)
- UX-DR24: Button component customization (glove-friendly sizes, haptic feedback)
- UX-DR26: Input component customization (80px height, 1.5rem text, voice icon)
- UX-DR27: Mobile rider view implementation (full-screen map, bottom sheet overlays)

**NFRs Addressed:**
- NFR-P6 to NFR-P9: Initial load performance (FCP <1.5s, LCP <2.5s, TTI <3.5s)
- NFR-S6: Cryptographically random trip codes (2.1B combinations)
- NFR-A5 to NFR-A6: Glove-friendly touch targets (80x80px minimum)

---

## Stories (11 total)

### Story 2.1: Create Trip Session with Auto-Generated 6-Digit Code

As a **trip host**,
I want **to create a new trip with an automatically generated 6-digit alphanumeric code**,
So that **I can quickly start a trip and share the code with my riding group**.

**Acceptance Criteria:**

**Given** I am on the SyncRide home screen
**When** I tap the "Create Trip" button
**Then** the backend generates a cryptographically random 6-digit alphanumeric code (uppercase A-Z, 0-9)
**And** the trip is saved to MongoDB with:
  - `tripCode`: generated code
  - `hostId`: my device ID
  - `createdAt`: current timestamp
  - `status`: 'active'
  - `riders`: array containing my rider object
**And** the trip code is added to Redis with TTL of 12 hours
**And** I am redirected to the trip screen showing the trip code prominently
**And** the trip code is displayed in large monospace font (3rem size) with letter-spacing
**And** a visual confirmation appears: "Trip created successfully"

**Requirements Fulfilled:** FR1, NFR-S6 (2.1 billion combinations, <0.01% collision rate)

---

### Story 2.2: Display Trip Code with Share Options

As a **trip host**,
I want **to see the trip code with easy sharing options (WhatsApp, SMS, copy to clipboard)**,
So that **I can quickly share the code with my group through their preferred channel**.

**Acceptance Criteria:**

**Given** I have created a trip (Story 2.1)
**When** I view the trip code screen
**Then** the TripCodeDisplay component renders with:
  - Trip code in large monospace text (3rem, letter-spacing 0.25em)
  - Three share buttons: WhatsApp, SMS, Copy (each 80x80px)
  - QR code below the trip code (scannable, 200x200px)
**And** tapping the trip code itself copies it to clipboard
**And** a "Copied!" toast appears for 1 second after copying
**And** tapping WhatsApp opens share sheet with pre-filled message: "Join my SyncRide trip: [CODE]"
**And** tapping SMS opens SMS composer with pre-filled message
**And** tapping Copy copies the code to clipboard with haptic feedback (single pulse)
**And** all share buttons have visible focus indicators for accessibility
**And** the component meets minimum touch target size (80x80px per button)

**Requirements Fulfilled:** FR2, UX-DR18, UX-DR24, NFR-A5

---

### Story 2.3: Join Trip by Entering Trip Code

As a **rider**,
I want **to join an existing trip by entering a 6-digit code**,
So that **I can connect to my group without creating an account**.

**Acceptance Criteria:**

**Given** I am on the SyncRide home screen
**When** I tap "Join Trip" button
**Then** a bottom sheet slides up with a trip code input form
**And** the input field is styled with:
  - Height: 80px (glove-friendly)
  - Font size: 1.5rem
  - Uppercase transformation (auto-converts to uppercase)
  - Max length: 6 characters
**And** I can enter the trip code using keyboard or voice-to-text icon
**When** I enter all 6 characters
**Then** the "Join" button becomes enabled (disabled until 6 characters entered)
**When** I tap "Join" with a valid trip code
**Then** the backend validates the trip code exists and is active
**And** I am added to the trip's riders array in MongoDB
**And** my rider object is saved with: `riderId`, `displayName` (default "Rider N"), `joinedAt`, `isHost: false`
**And** I am redirected to the live map screen showing all riders
**And** a success toast appears: "Joined trip successfully"
**When** I tap "Join" with an invalid trip code
**Then** an error message displays: "Trip code not found. Check code and try again."
**And** the input field shows red border with error state
**And** the input field is cleared and refocused for retry

**Requirements Fulfilled:** FR3, UX-DR26, NFR-A12 (clear error messages)

---

### Story 2.4: Display Optional Display Name Entry on Join

As a **rider**,
I want **to optionally provide a display name when joining a trip**,
So that **other riders can identify me instead of seeing "Rider N"**.

**Acceptance Criteria:**

**Given** I am on the trip join screen (Story 2.3)
**When** I enter a valid trip code
**Then** an optional display name input field appears below the code input
**And** the display name field shows placeholder text: "Your name (optional)"
**And** the display name field has the same glove-friendly styling (80px height, 1.5rem font)
**And** the display name has a max length of 30 characters
**When** I provide a display name and join
**Then** my rider object saves with the custom display name
**And** other riders see my custom name instead of "Rider N"
**When** I don't provide a display name
**Then** my rider object saves with auto-generated name "Rider N" (where N is join order number)
**And** input validation prevents empty whitespace-only names
**And** input validation sanitizes HTML/script tags from display name (XSS prevention)

**Requirements Fulfilled:** FR3, NFR-S17 (input validation for XSS prevention)

---

### Story 2.5: Display Terms of Service and Consent Modal on First Launch

As a **user**,
I want **to view and accept Terms of Service including SOS limitations and data collection consent**,
So that **I understand how my data is used and the app's safety disclaimers before using it**.

**Acceptance Criteria:**

**Given** I am launching SyncRide for the first time
**When** the app loads
**Then** a full-screen modal appears before showing the home screen
**And** the modal displays:
  - Header: "Welcome to SyncRide"
  - Terms of Service section with scrollable content
  - SOS limitations disclaimer highlighted in yellow
  - Distraction warning highlighted in red
  - Data collection policy with clear retention timelines
**And** the modal includes two checkboxes (both required):
  - "I agree to the Terms of Service and understand SOS limitations"
  - "I consent to location data collection for trip coordination"
**And** both checkboxes must be checked to enable "Continue" button
**And** "Continue" button is 120px tall with primary styling (glove-friendly)
**And** tapping "Continue" with accepted terms:
  - Saves consent timestamp to localStorage
  - Closes modal and shows home screen
**And** tapping "Learn More" links open detailed policy pages
**And** on subsequent launches, if consent is already saved, modal does not appear
**And** consent can be reviewed later in Settings

**Requirements Fulfilled:** FR41, FR37, FR38

---

### Story 2.6: Request Background GPS Location Permission

As a **user**,
I want **the app to request background GPS location permission with clear justification**,
So that **I understand why this permission is needed and can make an informed decision**.

**Acceptance Criteria:**

**Given** I have accepted Terms of Service (Story 2.5)
**When** I create or join my first trip
**Then** a permission request dialog appears with justification text:
  - "Keep your group connected during rides"
  - "SyncRide needs background location access to share your position even when the app is minimized"
**And** the dialog shows the browser/OS native permission prompt
**When** I grant the permission
**Then** the permission status is saved to app state
**And** background location tracking is enabled
**And** I proceed to the trip screen
**When** I deny the permission
**Then** a warning message displays: "Background location is required for real-time coordination"
**And** a "Settings" button appears to open device location settings
**And** the app shows limited functionality mode (can view but not share location)
**And** a persistent banner shows: "Enable location to share your position with your group"

**Requirements Fulfilled:** FR61, NFR-I7 (clear justification)

---

### Story 2.7: Request Lock-Screen Access Permission for SOS Button

As a **user**,
I want **the app to request lock-screen access permission**,
So that **I can trigger SOS from my lock screen during emergencies**.

**Acceptance Criteria:**

**Given** I have granted background GPS permission (Story 2.6)
**When** the app requests lock-screen access
**Then** a custom modal appears explaining the feature:
  - "Quick SOS Access from Lock Screen"
  - "Activate emergency alerts without unlocking your phone"
  - Note: "This feature may not be available on all devices"
**And** the modal includes "Enable" and "Skip" buttons (both 80px tall)
**When** I tap "Enable"
**Then** the app attempts to register lock-screen SOS via platform API
**And** if successful, shows confirmation: "Lock-screen SOS enabled"
**And** if platform doesn't support it, shows message: "Lock-screen access not available on this device. SOS will be available in-app."
**When** I tap "Skip"
**Then** the modal closes and SOS remains available as in-app button only
**And** the permission request doesn't appear again
**And** I can enable it later from Settings

**Requirements Fulfilled:** FR62, NFR-I8 (platform API fallback)

---

### Story 2.8: Request Push Notification Permission

As a **user**,
I want **the app to request push notification permission**,
So that **I receive critical alerts (SOS, trip end) even when the app is backgrounded**.

**Acceptance Criteria:**

**Given** I have completed previous permission requests
**When** the app requests push notification permission
**Then** a custom modal appears explaining:
  - "Stay Alert to Critical Events"
  - "Receive notifications for SOS alerts and trip updates"
  - "You can customize notification preferences in Settings"
**And** the modal includes "Enable" and "Not Now" buttons
**When** I tap "Enable"
**Then** the browser/OS native notification permission prompt appears
**And** if granted, FCM (Android) or APNs (iOS) registration occurs
**And** notification token is saved to backend for this device
**And** a confirmation message appears: "Notifications enabled"
**When** I tap "Not Now"
**Then** the modal closes without requesting permission
**And** a settings option remains available to enable later
**And** in-app alerts remain functional even without notification permission

**Requirements Fulfilled:** FR63, NFR-I9 (FCM/APNs integration)

---

### Story 2.9: Detect PWA Capability and Show Add to Home Screen Prompt

As a **user**,
I want **to add SyncRide to my home screen as a PWA**,
So that **it feels like a native app with quick access from my home screen**.

**Acceptance Criteria:**

**Given** I am using a browser that supports PWA
**When** I have used the app for 30 seconds or created/joined my first trip
**Then** a custom "Add to Home Screen" prompt appears as a bottom sheet
**And** the prompt shows:
  - App icon and name "SyncRide"
  - Benefits: "Quick access, works offline, no app store needed"
  - "Add to Home Screen" button (120px tall)
  - "Not Now" link
**When** I tap "Add to Home Screen"
**Then** the browser's native install prompt triggers
**And** after installation, the app launches in standalone mode (no browser chrome)
**And** the PWA manifest is correctly applied (theme color, icons, display mode)
**When** I tap "Not Now"
**Then** the prompt dismisses and doesn't reappear for 7 days
**When** my browser doesn't support PWA
**Then** no prompt appears, but app remains functional as web app
**And** a subtle banner shows: "For best experience, use Chrome/Safari"

**Requirements Fulfilled:** FR65, FR66 (graceful degradation)

---

### Story 2.10: Handle Platform Capability Detection and Graceful Degradation

As a **developer**,
I want **platform capability detection for PWA features (service worker, background sync, notifications)**,
So that **the app degrades gracefully on platforms with limited PWA support**.

**Acceptance Criteria:**

**Given** the app is running on any platform
**When** the app initializes
**Then** capability checks are performed:
  - Service Worker API availability
  - Background Sync API availability
  - Notification API availability
  - Geolocation API availability
  - Vibration API availability (for haptic feedback)
**And** capability results are stored in app state/context
**And** feature availability is displayed in Settings → About
**When** a feature is unavailable
**Then** UI for that feature shows "Not available on this device" message
**And** alternative functionality is provided where possible:
  - No service worker → no offline mode, but app still functions online
  - No background sync → manual retry for failed requests
  - No notifications → in-app alerts only
  - No vibration → visual-only feedback
**And** the app logs capability info to Sentry for analytics
**And** no JavaScript errors occur due to missing APIs

**Requirements Fulfilled:** FR66, NFR-I8 (graceful fallback)

---

### Story 2.11: Display Persistent Foreground Service Notification on Android

As an **Android user**,
I want **a persistent foreground service notification while a trip is active**,
So that **I know the app is tracking my location and Android doesn't kill the background process**.

**Acceptance Criteria:**

**Given** I am on Android and have joined/created a trip
**When** location tracking starts
**Then** a persistent notification appears in the notification shade
**And** the notification displays:
  - Icon: SyncRide logo
  - Title: "Trip Active"
  - Text: "Sharing location with your group"
  - Action buttons: "View Trip", "End Trip"
**And** the notification is non-dismissible while trip is active
**And** tapping the notification opens the app to the trip screen
**And** tapping "End Trip" button shows confirmation dialog
**When** I leave or end the trip
**Then** the persistent notification is removed
**And** a regular dismissible notification appears: "Trip ended. Data deleted."
**When** I am on iOS or desktop
**Then** no persistent notification appears (Android-specific)

**Requirements Fulfilled:** FR64

---

## Epic 2 Summary

**Stories Created:** 11
**Requirements Covered:**
- FRs: FR1, FR2, FR3, FR37, FR38, FR41, FR61, FR62, FR63, FR64, FR65, FR66 (12 FRs)
- UX Design: UX-DR18, UX-DR24, UX-DR26, UX-DR27
- NFRs: NFR-A5, NFR-A12, NFR-I7, NFR-I8, NFR-I9, NFR-S6, NFR-S17

**Epic 2 Status:** ✅ Complete
