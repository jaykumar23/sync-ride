# Epic 10: Accessibility & Glove-Friendly Usability

**Goal:** Ensure the app is fully accessible and usable while riding with gloves through WCAG 2.1 Level AA compliance, glance mode, keyboard navigation, and screen reader support.

**User Outcome:** All users can safely operate the app with gloves, access high-contrast glance mode at speed, use keyboard shortcuts on desktop, and leverage screen readers for observer mode.

---

### Story 10.1: Implement Glove-Friendly Touch Targets (Minimum 80x80px)

As a **rider with gloves**,
I want **all interactive elements to have minimum 80x80px touch targets**,
So that **I can reliably tap buttons while wearing motorcycle gloves**.

**Acceptance Criteria:**

**Given** all UI components are implemented
**When** I measure interactive element sizes
**Then** all buttons, links, and tappable elements meet minimum size:
  - Standard buttons: 80x80px minimum (exceeds WCAG 44x44px)
  - Primary actions (Create Trip, Join Trip): 120px height, full width
  - Critical actions (SOS, End Trip): 120-160px (extra large)
  - Navigation tabs: 60px height, equal width distribution
  - FAB buttons: 80px diameter
  - Input fields: 80px height
  - Rider markers: 60px visual + 40px invisible padding = 100px total tap target
**And** spacing between interactive elements is minimum 8px to prevent mis-taps
**When** glove usability testing is performed (12mm neoprene, leather gauntlets, winter gloves)
**Then** core user flows achieve >90% success rate:
  - Create trip: tap success rate >90%
  - Join trip: tap success rate >90%
  - Send voice status: tap success rate >90%
  - Trigger SOS: tap success rate >90%
**And** test results are documented in accessibility audit report

**Requirements Fulfilled:** FR67, NFR-A5, NFR-A6, NFR-A7 (>90% glove success rate), NFR-U1

---

### Story 10.2: Implement High-Contrast Glance Mode

As a **rider**,
I want **to access high-contrast glance mode for improved visibility at speed**,
So that **I can read critical information during quick 1-2 second glances while riding**.

**Acceptance Criteria:**

**Given** I am in an active trip
**When** I tap the "Glance Mode" toggle in floating controls (top-left FAB)
**Then** glance mode is activated with visual changes:
  - Background: pure black (#000000)
  - Text: pure white (#FFFFFF)
  - Contrast ratio: 21:1 (exceeds WCAG AAA 7:1)
  - Font sizes increase:
    - Nearest rider distance: 4rem (glance-lg)
    - Rider status: 3rem (glance-base)
    - Group spread: hidden (info overload reduction)
  - Bottom status bar height: increases from 15vh to 25vh
  - Map opacity: 80% (dimmed to emphasize status bar)
  - Only essential info shown: nearest rider name + distance
**And** motion-state detection can auto-enable glance mode:
  - When speed >20 km/h detected (via GPS + accelerometer)
  - Auto-enable after 30 seconds of continuous motion
  - Auto-disable when stationary for 15 seconds
**And** manual toggle always overrides auto-detection
**When** I toggle glance mode off
**Then** UI returns to normal colors and sizes with 300ms fade transition
**And** glance mode preference is saved to localStorage

**Requirements Fulfilled:** FR68, UX-DR36, UX-DR37, UX-DR38, UX-DR39, NFR-A4 (7:1 contrast), NFR-U5 (readable at-a-glance), NFR-U6 (high-contrast colors)

---

### Story 10.3: Implement Audio Narration for Group Status

As a **rider**,
I want **audio narration of group status for hands-free awareness**,
So that **I can stay informed without looking at my phone**.

**Acceptance Criteria:**

**Given** I have enabled audio narration in Settings → Accessibility
**When** significant group events occur
**Then** audio announcements are spoken via Web Speech API (Text-to-Speech):
  - Rider joins: "Rider [Name] joined the trip"
  - Rider leaves: "Rider [Name] left the trip"
  - SOS alert: "Emergency alert from [Name], [distance] away"
  - Falling behind: "You are [distance] behind the group"
  - Approaching rider: "[Name] is [distance] ahead"
  - Low battery: "Battery at 10%. Consider ending trip."
**And** narration respects motion state:
  - While moving (>20 km/h): only critical alerts (SOS, low battery)
  - While stationary: all events narrated
**And** narration works with helmet Bluetooth systems (Sena, Cardo):
  - Audio routes to Bluetooth audio output if connected
  - Volume adjustable in Settings (low, medium, high)
**And** visual alternatives accompany audio:
  - Toast notifications appear with same text
  - Ensures accessibility for hearing-impaired users
**When** Web Speech API is unsupported
**Then** audio narration is disabled gracefully
**And** Settings shows: "Audio narration not available on this device"

**Requirements Fulfilled:** FR69, NFR-U10 (helmet Bluetooth support), NFR-A9 (visual alternatives)

---

### Story 10.4: Implement Keyboard Navigation for Desktop Observer Mode

As a **desktop user** (observer mode),
I want **to navigate the interface using keyboard shortcuts**,
So that **I can manage trips efficiently without mouse interaction**.

**Acceptance Criteria:**

**Given** I am using SyncRide on desktop (viewport ≥1024px)
**When** keyboard navigation is enabled
**Then** all interactive elements are reachable via Tab key:
  - Tab order: Map controls → Member list → Settings → Bottom nav → FABs
  - Shift+Tab: reverse tab order
  - Focus indicators: 2px solid blue ring with 2px offset (highly visible)
**And** keyboard shortcuts are available:
  - **ESC**: Close any open modal/sheet
  - **Space**: Play/Pause trip replay (if on replay screen)
  - **G**: Toggle Group View (auto-zoom to fit all riders)
  - **M**: Open/close Member List
  - **/** (forward slash): Focus search/filter in Member List
  - **Arrow Keys**: Navigate member list items when focused
  - **Enter**: Activate focused button/link
**And** keyboard shortcuts are documented in Settings → Keyboard Shortcuts
**When** I press Tab repeatedly
**Then** focus moves logically through interactive elements
**And** focus is never trapped (can always escape via Tab or ESC)
**And** currently focused element is clearly visible (focus ring)

**Requirements Fulfilled:** FR70, NFR-A8 (keyboard navigation support), UX-DR31 (logical tab order)

---

### Story 10.5: Respect Reduced Motion Preferences

As a **user with motion sensitivity**,
I want **the app to respect my reduced motion preferences**,
So that **I don't experience discomfort from animations**.

**Acceptance Criteria:**

**Given** I have enabled "Reduce Motion" in my OS accessibility settings
**When** the app loads
**Then** the system detects the preference via CSS media query:
  - `@media (prefers-reduced-motion: reduce)`
**And** all animations are disabled or simplified:
  - No pulsing animations on markers (static colors only)
  - No slide/fade transitions (instant show/hide)
  - No smooth scrolling (instant scroll jumps)
  - No marker movement interpolation (teleport to new position)
  - No bottom sheet slide animations (instant open/close)
**And** essential motion for functionality is retained:
  - Map pan/zoom (user-controlled, not auto-animated)
  - Loading spinners (necessary for feedback)
**When** reduced motion is not set (default)
**Then** full animations are enabled as designed
**And** users can manually disable animations in Settings → Accessibility
**And** manual setting overrides system preference

**Requirements Fulfilled:** FR71, UX-DR46 (prefers-reduced-motion support)

---

### Story 10.6: Implement Screen Reader Support for Observer Mode

As a **visually impaired user** (observer mode),
I want **full screen reader support with VoiceOver (iOS) and TalkBack (Android)**,
So that **I can monitor trip progress through audio descriptions**.

**Acceptance Criteria:**

**Given** I am using a screen reader (VoiceOver or TalkBack)
**When** I navigate the app
**Then** all UI elements have proper ARIA attributes:
  - `role` attributes: button, link, navigation, region, alert
  - `aria-label`: descriptive labels for icons and images
  - `aria-expanded`: state for collapsible elements (member list sheet)
  - `aria-hidden`: decorative elements excluded from reading order
  - `aria-live="polite"`: status updates announced
  - `aria-live="assertive"`: critical alerts announced immediately (SOS)
**And** dynamic content is announced:
  - New rider joins: "Rider [Name] joined"
  - Location updates: "Rider [Name] is now [distance] away"
  - SOS alerts: "Emergency alert from [Name]" (immediate interruption)
  - Connection status: "Reconnecting, attempt 2 of 5"
**And** screen reader navigation order is logical:
  - Header/Title → Main content (map) → Member list → Bottom nav → Settings
**And** all buttons have descriptive labels:
  - Not: "Button" → Instead: "Create trip button"
  - Not: "Icon" → Instead: "Voice status button, tap to record"
**When** I interact with the map
**Then** rider markers announce: "[Rider Name], [distance] away, [status]"
**And** map controls announce: "Zoom in button", "Center on group button"

**Requirements Fulfilled:** FR72, NFR-A14, NFR-A15, UX-DR33, UX-DR34 (VoiceOver/TalkBack compatibility)

---

### Story 10.7: Implement Visible Focus Indicators for All Interactive Elements

As a **keyboard user**,
I want **clear visible focus indicators on all interactive elements**,
So that **I always know which element is currently focused**.

**Acceptance Criteria:**

**Given** all interactive elements are implemented
**When** I navigate using Tab key
**Then** focused elements display a prominent focus ring:
  - Style: 2px solid border
  - Color: primary blue (#3B82F6)
  - Offset: 2px outset (separates from element edge)
  - Border-radius: matches element shape
**And** focus indicators are visible in all themes:
  - Standard mode: blue ring (#3B82F6)
  - Glance mode: white ring (#FFFFFF) for contrast on black background
**And** focus indicators are never hidden by CSS (`outline: none` is forbidden)
**And** custom focus styles replace default browser outlines consistently
**When** I focus on buttons
**Then** button also receives hover state styling (scale, shadow)
**And** focus is distinct from hover (focus ring vs shadow)
**When** I focus on input fields
**Then** input receives focus ring and label animates (if applicable)
**And** placeholder text becomes more visible

**Requirements Fulfilled:** UX-DR32 (2px solid blue ring with 2px offset), NFR-A8, NFR-A11 (consistent UI patterns)

---

### Story 10.8: Ensure WCAG 2.1 Level AA Compliance Across All Components

As a **product team**,
I want **the entire app to meet WCAG 2.1 Level AA compliance**,
So that **the app is accessible to users with disabilities and meets legal standards**.

**Acceptance Criteria:**

**Given** all features are implemented
**When** accessibility audit is performed
**Then** the app meets all WCAG 2.1 Level AA success criteria:
  - **1.4.3 Contrast (Minimum)**: All text meets 4.5:1 contrast ratio (verified via tools)
  - **1.4.5 Images of Text**: No text embedded in images (except trip QR code, which is functional)
  - **1.4.10 Reflow**: Content functional at 200% zoom without horizontal scroll
  - **2.1.1 Keyboard**: All functionality accessible via keyboard
  - **2.1.2 No Keyboard Trap**: Focus can always escape
  - **2.4.3 Focus Order**: Logical tab order throughout app
  - **2.4.7 Focus Visible**: All focused elements have visible indicator
  - **2.5.5 Target Size**: All interactive elements ≥44x44px (we exceed with 80x80px)
  - **3.2.1 On Focus**: Focusing elements doesn't change context
  - **3.2.2 On Input**: Input doesn't trigger context change without warning
  - **3.3.1 Error Identification**: Errors described in text, not color-only
  - **3.3.2 Labels or Instructions**: All inputs have visible labels
**And** automated accessibility testing passes:
  - Axe DevTools: 0 violations
  - Lighthouse Accessibility score: ≥95
  - WAVE tool: 0 errors
**And** manual testing confirms:
  - Screen reader usability (VoiceOver, TalkBack)
  - Keyboard-only navigation successful
  - Color contrast verified with colorimeter
**And** accessibility statement is published at `/accessibility`

**Requirements Fulfilled:** NFR-A1, NFR-A2, NFR-A3, NFR-A11, NFR-A12, NFR-A13, UX-DR7 (WCAG 2.1 Level AA)

---

## Epic 10 Summary

**Stories Created:** 8
**Requirements Covered:**
- FRs: FR67, FR68, FR69, FR70, FR71, FR72 (6 FRs)
- UX Design: UX-DR7, UX-DR31, UX-DR32, UX-DR33, UX-DR34, UX-DR36, UX-DR37, UX-DR38, UX-DR39, UX-DR46
- NFRs: NFR-A1 through NFR-A15, NFR-U1, NFR-U5, NFR-U6, NFR-U7, NFR-U10

**Epic 10 Status:** ✅ Complete
