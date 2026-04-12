# RouteBuddies: Real-Time Geospatial Group Coordination

RouteBuddies is a high-performance, real-time location-tracking platform designed for group travelers (bikers, hikers, or convoys) who need to maintain visual contact on a map during long-distance trips.

## 🚀 Overview
When traveling in groups, traffic and different navigation routes often lead to "scattered" riders. SyncRide solves this by providing a unified "Trip Session" where every participant's live location is rendered on a shared map using real-time WebSockets.

## 🛠 Tech Stack
- **Frontend:** React.js, Tailwind CSS, Mapbox GL JS
- **State Management:** Zustand / TanStack Query
- **Backend:** Node.js, Express.js
- **Real-Time:** Socket.io
- **Database:** MongoDB (User Data), Redis (Active Location Caching)
- **Security:** JWT (JSON Web Tokens) & Bcrypt.js

## 🔑 Key Features

### 1. Secure Authentication & Identity
- **JWT-based Auth:** Secure login and registration with protected routes.
- **Dynamic Profiles:** Users can manage basic info (Name, Number, Email) and upload a profile photo.
- **Avatar Markers:** User photos are processed and utilized as custom live markers on the map interface.

### 2. Live Trip Sessions
- **Trip ID Creation:** A host creates a unique "Trip ID"; others join the room via the shared code.
- **Geospatial Sync:** Live GPS coordinates are pushed to a Socket.io server and broadcasted to all session members.
- **Real-time Visualization:** Smooth movement of user avatars across the map with synchronized camera bounds.

### 3. Performance & Reliability
- **Throttled Updates:** Intelligent polling intervals to balance location accuracy with mobile battery preservation.
- **Redis Caching:** Active trip coordinates are stored in-memory for sub-millisecond broadcast speed.

## 🗺 MVP Roadmap

### Phase 1: Foundation
- [ ] Implement JWT Login/Register API and Auth middleware.
- [ ] Build Profile Management (CRUD for user info and photo upload).
- [ ] Integrate Mapbox GL JS and render static user markers.

### Phase 2: Real-Time Engine
- [ ] Setup Socket.io server and room-based communication logic.
- [ ] Implement `JOIN_TRIP` and `LEAVE_TRIP` socket events.
- [ ] Handle real-time coordinate broadcasting and frontend state updates.

### Phase 3: Trip Utility & UX
- [ ] Implement "Group View" (Auto-zoom to fit all riders in the viewport).
- [ ] Integrated "Ping/SOS" system for instant group notifications.
- [ ] Trip history dashboard and session summaries.

## 📈 Engineering Challenges & Solutions
- **Handling Disconnects:** Implemented a heartbeat mechanism to differentiate between a stationary rider and a lost connection.
- **State Management:** Utilized optimized stores to handle high-frequency location updates without triggering unnecessary full-page re-renders.