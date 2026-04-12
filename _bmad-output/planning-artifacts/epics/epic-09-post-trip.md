# Epic 9: Post-Trip Experience & Replay

**Goal:** Provide users with trip summaries, optional replay storage, social sharing, and attribution tracking for post-ride engagement.

**User Outcome:** Users can review trip statistics, opt-in to save 7-day replay, share achievements on social media, and provide product feedback through attribution surveys.

---

### Story 9.1: Display Trip Summary Screen with Statistics

As a **rider**,
I want **to see a trip summary screen with route map, distance, time, speed, and group stats**,
So that **I can review my ride and share achievements**.

**Acceptance Criteria:**

**Given** a trip has ended (Story 6.5)
**When** the trip end confirmation is dismissed
**Then** the post-trip summary screen displays with:
  - **Header**: "Trip Complete!"
  - **Map View**: Route visualization showing start/end points and path traveled
  - **Personal Stats** card:
    - Total Distance: "X.X km"
    - Riding Time: "Xh Xm"
    - Max Speed: "X km/h"
    - Avg Speed: "X km/h"
  - **Group Stats** card:
    - Group Size: "X riders"
    - Group Distance: "X.X km" (furthest rider)
    - Longest Separation: "X.X km"
  - **Action Buttons**:
    - "Share Trip" (blue, 120px)
    - "Save Replay" (green, 120px, if not already opted-in)
    - "Back to Home" (gray, 80px)
**And** all statistics are calculated from trip data:
  - Distance: sum of coordinate-to-coordinate distances (Haversine formula)
  - Time: difference between first and last location update
  - Max/Avg speed: derived from GPS speed readings
**And** if no GPS data is available (disconnected entire trip), stats show "—"
**When** the screen loads
**Then** an attribution survey modal appears (Story 9.4)

**Requirements Fulfilled:** FR54

---

### Story 9.2: Opt-In to Save Trip Replay (Duplicate Check from Epic 8)

As a **rider**,
I want **to opt-in to save trip replay for 7 days from the post-trip screen**,
So that **I can access my trip history later if I didn't opt-in during trip end**.

**Acceptance Criteria:**

**Given** I did not opt-in to replay storage during trip end (Epic 8, Story 8.2)
**When** I view the trip summary screen (Story 9.1)
**Then** a "Save Replay" button is visible and enabled
**When** I tap "Save Replay"
**Then** the same opt-in modal from Epic 8 (Story 8.2) appears:
  - Consent checkboxes
  - 7-day retention explanation
  - "Save" and "Don't Save" buttons
**When** I opt-in
**Then** trip data is saved to MongoDB time-series collection (if not already saved)
**And** TTL index is applied for 7-day deletion
**And** confirmation toast: "Trip replay saved for 7 days"
**When** I already opted-in during trip end
**Then** "Save Replay" button is hidden
**And** a message displays: "Replay already saved (expires in X days)"

**Requirements Fulfilled:** FR55 (shared with Epic 8)

---

### Story 9.3: Share Trip Replay Link via Social Media

As a **rider**,
I want **to share my trip replay link on social media or messaging apps**,
So that **I can show my riding achievements to friends and followers**.

**Acceptance Criteria:**

**Given** I have opted-in to trip replay storage (Story 9.2)
**When** I tap "Share Trip" on the post-trip summary screen
**Then** a share modal appears with options:
  - **Public Replay Link**: `https://syncride.app/replay/[tripCode]` (shareable URL)
  - **Share Options**:
    - Social media: Instagram, Facebook, Twitter (opens native share sheet with pre-filled text)
    - Messaging: WhatsApp, SMS
    - Copy Link
  - **Preview**: Thumbnail of trip route map (640x480px)
  - **Pre-filled message**: "Check out my ride! X.X km in Xh Xm 🏍️ [link]"
**When** I tap a social share option
**Then** the native share sheet opens with:
  - Trip statistics
  - Route map thumbnail
  - Replay link
**When** someone opens the shared replay link
**Then** a public replay viewer page loads showing:
  - Anonymous trip (rider names hidden, only "Rider 1", "Rider 2")
  - Route playback with time slider
  - Aggregate statistics (distance, time, max speed)
  - "Download SyncRide" CTA button
**And** public replay is read-only (no personal data exposed)
**And** replay link expires after 7 days (same as storage TTL)

**Requirements Fulfilled:** FR56

---

### Story 9.4: Display Attribution Survey on Trip End

As a **product team**,
I want **to show a brief attribution survey asking how users heard about SyncRide**,
So that **we can track marketing effectiveness and user acquisition channels**.

**Acceptance Criteria:**

**Given** a trip has ended and the post-trip summary is displayed (Story 9.1)
**When** the summary screen loads
**Then** an attribution survey modal appears (max frequency: once per device):
  - Title: "How did you hear about SyncRide?"
  - Options (single select):
    - 🔍 Google Search
    - 📱 Social Media (Instagram, Facebook, Twitter)
    - 👥 Friend/Word of Mouth
    - 🏍️ Motorcycle Community/Forum
    - 📰 News Article/Blog
    - 🎙️ Podcast/YouTube
    - 🚫 Other
  - Optional text field: "Tell us more (optional)"
  - Buttons: "Submit" (blue, 120px), "Skip" (gray, 80px)
**When** I select an option and tap "Submit"
**Then** the response is saved to analytics:
  - `deviceId` (hashed)
  - `attributionSource`: selected option
  - `attributionDetails`: optional text
  - `timestamp`
  - `tripCode` (anonymized after 7 days)
**And** modal dismisses with toast: "Thank you for your feedback!"
**When** I tap "Skip"
**Then** modal dismisses without saving response
**And** survey doesn't appear again for this device (stored in localStorage: `attribution_survey_completed: true`)
**And** survey appearance is logged for completion rate tracking

**Requirements Fulfilled:** FR57

---

### Story 9.5: Export Trip Summary for Social Media Posting

As a **rider**,
I want **to export a shareable trip summary image for social media**,
So that **I can post my ride achievements without sharing the replay link**.

**Acceptance Criteria:**

**Given** I am on the post-trip summary screen (Story 9.1)
**When** I tap "Export Summary" (next to "Share Trip" button)
**Then** a shareable image is generated (1080x1920px portrait, social media optimized):
  - **Top Section**: SyncRide logo and branding
  - **Map Section**: Route visualization (60% of image)
  - **Stats Section**: Personal and group statistics with icons
  - **Bottom Section**: "Track your rides with SyncRide" + QR code to download app
  - **Style**: High-contrast design, dark background, readable at small sizes
**And** the image is rendered using canvas or HTML-to-image library
**When** rendering completes
**Then** options appear:
  - "Save to Photos" (downloads image)
  - "Share Now" (opens native share sheet with image)
  - "Copy Image"
**When** I tap "Save to Photos"
**Then** the image downloads with filename: `syncride-trip-[date].png`
**And** a toast confirms: "Saved to downloads"
**When** I tap "Share Now"
**Then** native share sheet opens with the image attached
**And** I can select any app (Instagram Stories, Facebook, Twitter)

**Requirements Fulfilled:** FR58

---

### Story 9.6: View Trip History (Within 7-Day Window)

As a **rider**,
I want **to view my trip history if replay storage was enabled**,
So that **I can revisit past rides within the 7-day window**.

**Acceptance Criteria:**

**Given** I have opted-in to trip replay for previous trips (Story 9.2)
**When** I navigate to Settings → "Trip History"
**Then** a list of saved trips appears (reverse chronological order):
  - Trip date and time
  - Trip duration
  - Distance traveled
  - Thumbnail of route map
  - Days remaining until expiration: "Expires in X days"
**And** only trips within the 7-day window are shown
**And** trips older than 7 days are automatically hidden (TTL deletion, Story 8.3)
**When** I tap a trip entry
**Then** the trip replay viewer opens showing:
  - Full route map
  - Time slider to scrub through ride
  - Playback controls: Play/Pause, Speed (1x, 2x, 4x)
  - Rider positions animated along route
  - Statistics panel (distance, time, speed)
**When** I tap "Delete Trip" in replay viewer
**Then** a confirmation appears: "Delete this trip replay? This cannot be undone."
**When** confirmed, the trip replay is immediately deleted from MongoDB
**And** the trip is removed from history list

**Requirements Fulfilled:** FR60

---

## Epic 9 Summary

**Stories Created:** 6
**Requirements Covered:**
- FRs: FR54, FR55, FR56, FR57, FR58, FR59, FR60 (7 FRs, FR59 shared with Epic 8)
- NFRs: NFR-SC11 (time-series downsampling for replay)

**Epic 9 Status:** ✅ Complete

---

