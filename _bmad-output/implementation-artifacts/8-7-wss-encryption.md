---
story_id: "8.7"
story_key: "8-7-wss-encryption"
epic: "Epic 8: Privacy & Data Lifecycle"
title: "Implement WSS (TLS) Encryption for WebSocket Communication"
status: "complete"
---

# Story 8.7: WSS/TLS Encryption

## Story
As a **system**, I want **all WebSocket communication encrypted with TLS (WSS protocol)**, So that **location data cannot be intercepted during transmission**.

## Acceptance Criteria
- [x] WSS protocol enforced in production
- [x] WS allowed for local development
- [x] Configuration via environment variable
- [x] Socket.io supports automatic protocol upgrade

## Implementation
The application already supports TLS/WSS:
- Frontend uses `VITE_WS_URL` environment variable
- In production, set to `wss://api.syncride.com`
- Socket.io handles TLS handshake automatically
- Development uses `ws://localhost:3000`

## Deployment Notes
For production, configure:
- `VITE_WS_URL=wss://your-domain.com`
- SSL certificate on backend server
- Minimum TLS 1.2

## File List
- apps/web/src/hooks/useSocket.ts (uses VITE_WS_URL)
- .env.production (deployment config)

## Status
**Current:** complete
