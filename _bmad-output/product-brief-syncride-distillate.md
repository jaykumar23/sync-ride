---
title: "Product Brief Distillate: SyncRide"
type: llm-distillate
source: "product-brief-syncride.md"
created: "2026-04-10"
purpose: "Token-efficient context for downstream PRD and Technical Design Doc creation"
---

# SyncRide Product Brief Distillate

**Purpose:** Preserves detailed context captured during product brief discovery that's valuable for PRD creation but doesn't fit in executive summary. Structured for LLM consumption.

---

## Core Context

### Market Validation
- $130B cycling/motorcycle tourism market (2026), growing in APAC
- India Mumbai-Goa corridor example: known pain point for scattered riders in heavy traffic and long highway stretches
- User research shows separation as leading cause of incidents: rushed catch-up riding, missed turns, inability to distinguish lost signal from actual emergency

### Target User Insight
- Primary: 5-20 rider groups on day/weekend/multi-day tours
- Real-world validation: Mumbai-Goa run, Thailand Mae Hong Son Loop, Bangalore-Ooty as pilot corridors
- Secondary: Road cycling clubs (same scatter problem, different speed)
- Tertiary: Commercial tour operators (10-30 clients, need duty-of-care documentation)
- Future: Urban commuter convoy coordination (daily volume, habit formation potential)

### Positioning Clarity
- "Map-first, not chat-first" — location IS the interface (not messaging with map add-on)
- "Ephemeral privacy-forward" — no permanent accounts, no location graph, session-based only
- "Glove-friendly for speed" — voice, haptic, one-tap interactions designed for 100 km/h with neoprene gloves
- "Companion to planners" — "Plan in Komoot, coordinate in SyncRide" (integration > competition)

---

## Technical Architecture Context

### Performance Targets (Must Be Instrumented)
- **Sub-500ms P95 latency:** Measured per network class (4G/LTE/5G), not assumed
- **60-80% battery savings:** vs fixed 5s polling baseline on reference devices (iPhone 14, Samsung Galaxy S23)
- **Claims tied to milestones:** Phase 2 starts with fixed 5s polling; adaptive optimizations validated before public claims

### Adaptive GPS Polling Strategy (From Brainstorming #1-5)
- **Stationary mode:** GPS off, accelerometer monitoring only (checks every 30-60s or motion detect)
- **Predictable motion (highway):** 10-15s polls with linear interpolation using last velocity vector
- **Dynamic motion (city):** 2-3s polls for unpredictable trajectories
- **Velocity-based:** At 100 km/h with 15s poll = 416m between samples (acceptable map fidelity)
- **Battery impact:** Fixed 5s baseline = ~30% drain per hour; adaptive target = 60-80% savings
- **Implementation:** Motion-state detection, velocity threshold triggers, battery level override (<20% battery forces ultra-low power mode)

### Redis-Backed State Synchronization
- **TTL-based presence:** Each location update resets 30s TTL; expired keys = automatic ghost/disconnect detection (eliminates separate heartbeat protocol)
- **Geospatial indexing:** Redis GEOADD/GEORADIUS for O(log N) "who's within 5km" queries
- **Geographic partitioning:** Broadcast only to riders in local cell + adjacent cells; 50km+ separation = reduced update frequency

### Differential Broadcasting (Brainstorming #6)
- Full coordinate payload: ~40 bytes (lat/lng/timestamp/userId)
- Delta payload: ~8 bytes (heading uint16, speed uint8, delta-time uint8)
- 80% bandwidth reduction; send full coordinates every 10th update or on large deviation
- Clients reconstruct position mathematically between keyframes

### Offline/Dead Zone Resilience
- **Client-side buffering:** Continue GPS polling (10s) in dead zone, write to IndexedDB/SQLite
- **Trail replay:** When reconnected, upload compressed batch, other riders see "ghost replay" at 10x speed
- **Uncertainty visualization:** Disconnected rider shown at last position with expanding radius (distance = last_speed × time_elapsed)
- **P2P mesh fallback (deferred):** Bluetooth LE / WiFi Direct for <100m proximity when server unavailable

### Platform Constraints & Decisions
- **PWA-first:** Zero-install friction, cross-platform
- **iOS risk:** Background GPS and lock-screen SOS likely blocked for web apps — MUST test Week 1 of Phase 1
- **Native fallback:** Lightweight native shell scoped if PWA blocked (Phase 2 pivot point)
- **Speech-to-text:** English + Hindi for India launch; on-device vs cloud STT decision in Phase 1
- **Mapbox vs MapLibre:** Start Mapbox (faster MVP); consider MapLibre at scale to eliminate $5-10k/month licensing

---

## Rejected Ideas (Don't Re-Propose)

### From Brainstorming Session
- **Eliminate user accounts entirely (#81):** Attractive simplicity but conflicts with JWT requirement in current stack; deferred to post-MVP exploration
- **Eliminate historical trip storage (#84):** Zero persistence appealing for privacy but kills trip replay (insurance value, club culture); compromise = opt-in 7-day replay
- **Pure P2P / no server (#87):** Complex NAT traversal, limited to <10 riders, no history; WebRTC mesh deferred to Phase 4+
- **Native apps eliminated (#85):** PWA-only too risky given iOS constraints; native shell fallback scoped if needed
- **Fixed-rate 5s polling (#36):** Explicitly rejected as baseline (wasteful ~30% battery/hour); included only as measurement comparison for adaptive claims

### From Requirements
- **Permanent user profiles:** Brief initially mentioned JWT auth + profiles; revised to ephemeral device-bound sessions (minimal friction positioning)
- **Always-on location history:** Privacy-forward means live data deletion; replay is explicit opt-in only

---

## Requirements Hints (For PRD)

### Must-Have (MVP)
- Trip code generation (6-digit, host controls: kick/ban, expire code)
- Device-bound sessions with optional display name (no signup, no permanent account)
- Real-time WebSocket coordinate broadcasting with <500ms target latency
- Mapbox integration with live avatar rendering
- Redis caching for active location data
- Voice status updates (tap-to-speak, STT, English + Hindi)
- One-tap SOS from lock screen (if PWA permits; native fallback if blocked)
- Group View auto-zoom (fit all riders in viewport)
- Data lifecycle: live deletion on trip end, opt-in 7-day replay with explicit consent
- Post-trip attribution survey ("How did you hear about SyncRide?")

### Should-Have (Phase 2-3)
- Adaptive GPS polling (motion-state detection, velocity-based rates)
- Redis TTL presence detection (30s expiration = disconnect)
- Differential broadcasting (delta payloads for bandwidth savings)
- Exponential backoff reconnection (prevent thundering herd)
- Haptic proximity alerts (distinct vibration patterns)
- Host controls (kick rider, rotate code, ban)
- ToS with SOS limitations and distraction disclaimers

### Could-Have (Phase 4+)
- Offline map tiles
- P2P Bluetooth mesh for dead zones
- Read-only observer roles (families, SAG vehicles)
- Urban commuter convoy optimization
- Advanced route analytics and heatmaps

### Won't-Have (Explicitly Out)
- Permanent accounts with profile management
- Social graph / activity feed
- Route planning (integrate with Komoot/RideWithGPS instead)
- Native-first development (PWA unless blocked)

---

## User Scenarios (Detailed)

### Scenario 1: Weekend Mumbai-Goa Run (15 riders)
**Setup:**  
- Host creates trip Friday evening, shares code in WhatsApp group
- Saturday 6am: 15 riders gather, install PWA in parking lot (30s each)
- Everyone enters code, sees group on map before leaving

**During ride:**  
- Highway NH66: Group spreads 0-3km naturally
- Traffic light splits pack: 8 riders stopped, 7 continue; all see separation on map, no panic
- Lunch stop Ratnagiri: Host checks map, sees 2 riders 15km behind; waits without calling
- Tunnel near Khed: 3 riders lose signal; clients buffer locally, replay trail when emerged
- Fuel stop: One rider taps voice status "Need gas"; group coordinator sees, announces next fuel 10km ahead

**Emergency:**  
- Rider has flat tire, pulls over, taps SOS
- All riders get emergency alert with exact coordinates
- Two nearest riders (map shows 2.1km and 3.8km away) turn back
- Host calls rider to confirm status while others continue to safe regrouping spot

**Post-ride:**  
- Trip ends at Goa hotel; all location data deleted
- Optional: Host opts into 7-day replay for club Facebook post
- Survey: "How'd you hear about SyncRide?" → "Friend recommended" → WOM attribution logged

### Scenario 2: New User (Zero Context)
**Discovery:**  
- Sees friend's Instagram story showing SyncRide map with group trail
- Googles "SyncRide" or clicks link from story

**First use:**  
- Friend sends WhatsApp: "We're riding to Lonavala tomorrow, use this code: 847291"
- User opens link, installs PWA (10s), enters code
- Prompted: "Display name for this trip?" → enters "Rahul" (optional, no signup)
- Sees map with friend's location + 4 other riders
- Simple onboarding: "Tap here to share your status, tap SOS if emergency, map updates automatically"

**During first ride:**  
- User falls behind at traffic light, sees on map: "2.3km behind nearest rider"
- Learns haptic feedback: phone vibrates (2 short pulses = approaching rider ahead)
- At rest stop, tries voice status: taps button, says "Need water break", sees status appear on map for group

**Post-ride:**  
- Trip ends, app shows: "Your location deleted. Join another trip anytime with a new code."
- Survey: "How was your first ride? Would you create your own trip next time?"

---

## Competitive Intelligence (From Research)

### Direct Competitors
**RiderConnect / WheelX / ThrottleTrack:**  
- Motorcycle-native, live maps + chat + voice + clubs
- Gap: Feature-bloated, chat-heavy UX (not map-first), pricing varies
- Differentiation: SyncRide's session simplicity + ephemeral privacy + glove-first minimal UI

**Crew Relay Chat:**  
- P2P shared GPS + group voice, privacy-focused (data between riders only)
- Gap: P2P mesh struggles with highway gaps, less structured session UX
- Differentiation: SyncRide's server-backed reliability + dead zone resilience

**Komoot / Strava / RideWithGPS:**  
- Route planning, discovery, clubs; cycling/fitness-focused
- Gap: Not optimized for real-time "where is everyone now" sessions
- Differentiation: SyncRide owns real-time layer; integration > competition

**REVER / Scenic / Calimoto / MyRoute-app:**  
- Motorcycle trip planning + navigation, some friend tracking
- Gap: Primary job is navigation/logging, not ephemeral group sessions
- Differentiation: SyncRide laser-focused on coordination; "Plan there, coordinate here"

### User Sentiment (From Research)
- Riders cite separation in traffic/highways as core failure mode
- Strong sentiment against phone-heavy chat while moving (unsafe)
- "Accordion" pacing and follow-leader dynamics create frustration and perceived danger
- Privacy-aware riders favor session-based sharing over always-on social graphs

### Timing Factors
- Ubiquitous smartphones + cheaper mobile data + improving corridor coverage make real-time feasible
- Motorcycle tourism growth esp. in APAC aligns with launch
- Category noise (many "real-time" claims) requires crisp differentiation
- Incumbents strong on routes, weak on live coordination = opportunity window

---

## Open Questions & Risks

### Technical
- **iOS background GPS:** Will PWA actually work for always-on tracking? (MUST test Week 1)
- **Battery drain accuracy:** Can we prove 60-80% savings claim with instrumented tests before marketing?
- **Speech recognition in helmet noise:** What failure rate for STT at speed with wind noise? Fallback UX?
- **WebSocket scaling:** At what trip count/rider density does current infrastructure need horizontal scaling?

### Business
- **Unit economics:** Free real-time geospatial at scale may be negative margin before monetization
- **Competitive response:** When will Komoot/RideWithGPS ship live convoy features? What's remaining moat?
- **Insurance partnerships:** What's minimum data + usage density to pilot safe-riding discount program?
- **6-month MVP ambitious:** Auth + realtime + voice + SOS + replay + adaptive polling = high complexity/schedule risk

### Regulatory & Legal
- **Location consent:** India DPDP Act requirements? GDPR for EU expansion?
- **Distraction liability:** Variable phone-use-while-riding laws per state/country; marketing constraints?
- **SOS liability:** Life-safety expectations create legal exposure if feature fails or is misused
- **Abuse vectors:** Stalking/coercion via shared codes; need strong host controls + reporting

### Go-to-Market
- **Critical mass:** How many trips/weekend needed per corridor before network effects compound?
- **Onboarding friction:** Entire group installs mid-parking lot = adoption barrier; mitigation?
- **Attribution measurement:** "50% WOM" metric requires survey infrastructure; build into MVP?
- **Platform fallback timing:** If PWA blocked, when do we pivot to native shell? (Phase 2 = 2-month delay risk)

---

## Scope Signals (In/Out/Maybe)

### Definitely In (MVP Phases 1-3)
- Ephemeral sessions, trip codes, device-bound identity
- Real-time coordinate broadcasting via WebSocket + Redis
- Mapbox map rendering with live avatars
- Voice status updates (tap-to-speak)
- One-tap SOS
- Group View auto-zoom
- Opt-in 7-day trip replay
- Data deletion on trip end
- Adaptive GPS polling (Phase 2 Production-Grade)
- Redis TTL presence (Phase 2 Production-Grade)
- Post-trip attribution survey

### Probably Out (Post-MVP)
- Native mobile apps (unless PWA blocked, then native shell)
- Offline map tiles
- P2P mesh networking
- Observer roles (families/SAG)
- Route planning integration
- Urban commuter features
- Advanced analytics/heatmaps
- Monetization (prove usage first)

### Maybe (Depends on Learnings)
- Native shell fallback (if PWA blocked)
- English + Hindi STT (validated in Phase 1)
- Differential broadcasting (bandwidth optimization if needed)
- Geographic partitioning (if large groups strain infrastructure)
- Commercial tour operator pilot (if consumer traction slow)

---

## Success Metrics (From Brief)

### 3-Month Horizon
- **Completion rate:** >80% of trips end with all original participants connected
- **Return usage:** >40% of hosts create second trip within 30 days
- **Reconnection time:** Median <5s after tunnel/dead zone
- **Glove test:** >90% success rate completing core flows with motorcycle gloves

### 6-Month Horizon
- **Organic growth:** 30% MoM active trips (hypothesis, not target)
- **Geographic concentration:** >60% trips in 2-3 pilot corridors (PMF signal)
- **Word-of-mouth:** >50% new users from rider referral (requires attribution survey)
- **Technical performance:** P95 <500ms latency, <20% battery drain per 2-hour trip

### Learning Metrics
- Trip size distribution (small friend groups vs large rallies)
- Average trip duration/distance (informs polling optimization)
- Disconnect frequency/duration (validates reconnection strategy)
- Feature usage (voice vs manual status, haptic vs visual alerts)

---

## Strategic Partnerships (From Brief)

### Year 1 Priority
**Route Planning Apps (Komoot, RideWithGPS, REVER):**  
- Integration: "Open live group in SyncRide" button from saved routes
- Value: Complementary, not competitive; they lack real-time, we lack route library

**OEMs and Riding Clubs:**  
- Built-in trip codes for dealer demo rides, HOG chapters, owner events
- Trusted distribution, seed network effects

**Insurance + Roadside Assistance:**  
- SOS + location trails map to FNOL and dispatch
- Pilot safe-riding discount (opt-in data for 5-10% premium reduction)
- De-risks Year 3 insurance revenue, validates duty-of-care early

---

## Monetization Options (Year 2+)

### Freemium (Host-Pays)
- Free: Core location tracking, basic features
- $4.99/trip: Convoy Commander (weather overlay, fuel recs, chat, pro recording, observer invites)

### Sponsored POI Marketplace
- Motorcycle-friendly businesses pay $99/month for "Recommended Stop" placement
- Hosts earn 20% referral commission (aligns incentives)

### B2B White-Label
- Commercial tour operators: $199/month (analytics, duty-of-care docs, incident response)
- Delivery fleet management: $499/month for 50 vehicles (same tech, different customer)

### Insurance Partnerships
- Opt-in trip data sharing for safe-riding premium discounts
- Insurers pay for aggregate anonymized risk assessment insights

### Event Broadcasting
- Public trips (rallies, charity rides) as live spectator content
- Organizers pay for broadcasting; sponsor/advertising revenue potential

---

## Vision Expansion Paths

### Year 1: Corridor Domination
- Own "during-ride layer" in 2-3 pilot corridors
- Become default verb: "Just use SyncRide"
- Integration with route planners

### Year 2: Monetization + Surface Area
- Freemium + Sponsored POI + B2B tour operators
- Urban commuter pilot (daily volume, habit formation)
- Observer roles (families, SAG, event organizers)

### Year 3: Platform Expansion
- Delivery fleet management (same real-time stack, different vertical)
- Insurance partnerships (data-for-discount, risk assessment)
- Event broadcasting (public trips as media platform)

### Endgame
- Real-time geospatial coordination platform for ANY moving group
- Technical moat (battery, latency, dead-zone resilience) becomes defensible across verticals
- Not "motorcycle app" but "infrastructure layer for location-as-service"

---

## Key Takeaways for PRD

1. **Resolve accounts immediately:** Ephemeral device-bound sessions with optional display name (no JWT, no profiles) OR minimal signup matching "no friction" positioning
2. **Platform test Week 1:** iOS background GPS will determine PWA-only vs native fallback (2-month schedule impact)
3. **Data retention clarity:** Live deletion + opt-in replay must be consistent across UX and ToS
4. **GTM pilot design:** Seed 5-10 riding clubs, 50 hosts, clear acquisition channels before assuming organic growth
5. **Claims tied to milestones:** Don't market 60-80% battery savings until Phase 2 instrumented validation
6. **Safety positioning:** Frame as risk reduction (duty-of-care), not just convenience, to win B2B faster
7. **Ephemeral privacy:** Lead differentiator vs social tracking apps; elevate in positioning
8. **Integration > competition:** Partner with route planners, don't compete; own real-time layer only

---

**End of Distillate**  
**Total Context Preserved:** 101 brainstorming ideas, competitive research, technical architecture patterns, user scenarios, risks, and requirements hints — ready for PRD and Technical Design Doc creation.
