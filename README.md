# SyncRide 🏍️

**Real-Time Geospatial Group Coordination for Motorcycle Riders**

SyncRide is a privacy-first web application that enables motorcycle riders to share their real-time location with their group, send emergency SOS alerts, and stay coordinated during rides.

![Node.js](https://img.shields.io/badge/Node.js-≥20.19-green)
![pnpm](https://img.shields.io/badge/pnpm-≥9.0-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

- 📍 **Real-time Location Sharing** - See all riders on a live map
- 🚨 **SOS Emergency Alerts** - Long-press to broadcast emergency to all riders
- 📢 **Quick Status Messages** - "Pit stop", "Fuel needed", "Slow down" etc.
- 🗺️ **Interactive Map** - Leaflet-based map with rider markers
- 📱 **Offline Support** - Continue tracking when connection drops, sync when back online
- 🔐 **Privacy-First** - 30-second location TTL, device ID rotation, GDPR/DPDP compliant
- 🌙 **Dark/Light Theme** - Automatic theme switching
- 📊 **Trip Summary** - Statistics at end of ride (distance, speed, duration)
- 💾 **Trip Replay** - Save your route for 7 days (with consent)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS, Leaflet, Zustand |
| **Backend** | Node.js, Express 5, Socket.IO 4 |
| **Database** | MongoDB (Mongoose 9) |
| **Cache** | Redis (ioredis 5) |
| **Monorepo** | pnpm workspaces, Turborepo |

---

## Project Structure

```
syncride-monorepo/
├── apps/
│   ├── api/                 # Express + Socket.IO backend
│   │   ├── src/
│   │   │   ├── models/      # MongoDB schemas
│   │   │   ├── routes/      # REST API endpoints
│   │   │   ├── services/    # Business logic
│   │   │   ├── cache/       # Redis client
│   │   │   └── db/          # MongoDB connection
│   │   └── package.json
│   │
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── hooks/       # Custom hooks (useSocket, useGeolocation)
│       │   ├── store/       # Zustand stores
│       │   └── App.tsx      # Main app
│       └── package.json
│
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   └── config/              # Environment validation schemas
│
├── docs/                    # Documentation
│   └── PROJECT_DOCUMENTATION.md
│
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # Workspace definition
└── turbo.json               # Build pipeline
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.19.0
- **pnpm** ≥ 9.0.0
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/syncride.git
cd syncride

# Install dependencies
pnpm install
```

### Environment Setup

#### Backend (`apps/api/.env`)

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=syncride-dev
REDIS_URL=redis://localhost:6379
```

#### Frontend (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=pk.xxx  # Optional, for Mapbox tiles
```

### Running the Application

```bash
# Start all apps in development mode
pnpm dev

# Or start individually
pnpm --filter api dev      # Backend on :3000
pnpm --filter web dev      # Frontend on :5173
```

### Building for Production

```bash
# Build all packages
pnpm build

# Start production server
pnpm --filter api start
```

---

## How It Works

### Creating a Trip

1. Host opens the app and taps **"Create Trip"**
2. Enters their display name
3. Server generates a unique 6-character trip code (e.g., `ABC123`)
4. Host shares the code with their riding group

### Joining a Trip

1. Rider opens the app and taps **"Join Trip"**
2. Enters the 6-character trip code
3. Optionally enters their display name
4. Joins the trip and sees all riders on the map

### Real-time Updates

- GPS positions broadcast every 3-5 seconds via WebSocket
- Positions cached in Redis (30-second TTL) for late joiners
- Map updates instantly when positions change

### SOS Alerts

- Long-press (3 seconds) the SOS button to send emergency alert
- All riders receive full-screen notification with:
  - Sender's name
  - Distance from your location
  - Option to view on map
- Alerts can be cancelled by the sender

---

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trips` | Create a new trip |
| GET | `/api/trips/:code` | Get trip details |
| POST | `/api/trips/:code/join` | Join an existing trip |
| POST | `/api/trips/:code/end` | End trip (host only) |
| POST | `/api/trips/:code/leave` | Leave trip |
| GET | `/api/trips/:code/summary` | Get trip statistics |
| GET | `/api/privacy/export/:deviceId` | Export user data |
| DELETE | `/api/privacy/delete/:deviceId` | Delete user data |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `trip:join` | Client → Server | Join trip room |
| `location:update` | Client → Server | Send GPS position |
| `location:broadcast` | Server → Client | Receive rider position |
| `sos:send` | Client → Server | Send SOS alert |
| `sos:broadcast` | Server → Client | Receive SOS alert |
| `trip:end` | Client → Server | End the trip |
| `trip:ended` | Server → Client | Trip was ended |

See [PROJECT_DOCUMENTATION.md](./docs/PROJECT_DOCUMENTATION.md) for complete API documentation.

---

## Data & Privacy

### Data Retention

| Data Type | Retention |
|-----------|-----------|
| Live locations | 30 seconds (Redis TTL) |
| Trip metadata | 7 days (MongoDB TTL) |
| Trip replays | 7 days (if consented) |
| Consent logs | 7 years (regulatory) |

### Privacy Features

- **No account required** - Anonymous device-based identity
- **Device ID rotation** - New ID after each trip
- **Explicit consent** - Users choose to save trip replays
- **Data export** - Download all your data (JSON)
- **Data deletion** - Delete all your data anytime
- **Location TTL** - Positions auto-delete after 30 seconds

---

## Development

### Scripts

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm test         # Run tests
```

### Adding Dependencies

```bash
# Add to specific app
pnpm --filter api add express
pnpm --filter web add react-leaflet

# Add to root (dev dependency)
pnpm add -D -w typescript
```

### Shared Types

Types are defined in `packages/shared-types` and used by both frontend and backend:

```typescript
import { Trip, Rider, Coordinates } from 'shared-types'
```

---

## Architecture Decisions

### Why Socket.IO?

- Built-in reconnection with exponential backoff
- Room-based broadcasting (one room per trip)
- Automatic transport fallback (WebSocket → polling)
- Named events for type-safe protocol

### Why Redis?

- Sub-millisecond latency for live location reads
- Native TTL for automatic data expiration
- Solves "late joiner" problem (new riders see existing positions)
- Ephemeral data doesn't need persistence

### Why MongoDB?

- Flexible schema for trip/rider documents
- TTL indexes for automatic data cleanup
- Mongoose for type-safe queries

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Leaflet](https://leafletjs.com/) - Open-source map library
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

<p align="center">
  Made with ❤️ for the riding community
</p>
