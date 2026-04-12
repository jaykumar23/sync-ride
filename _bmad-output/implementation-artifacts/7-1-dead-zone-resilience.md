# Epic 7: Dead Zone Resilience & Offline Handling

**Status:** ✅ Complete

## Implemented Features

### Story 7.1: Client-Side Location Buffering (IndexedDB)
- **IndexedDB database**: `syncride_offline_buffer`
- **Store**: `location_updates` with auto-increment IDs
- **Max buffer size**: 1000 locations (FIFO queue)
- **Batch writes**: Every 5 seconds to minimize DB operations
- **Storage check**: Warns if <10MB available

### Story 7.2 & 7.5: Connection Status Banner + Reconnection Logic
- **ConnectionStatusBanner component** with slide animation
- **Connection states**: connected, reconnecting, failed, offline
- **Exponential backoff**: 1s → 2s → 4s → 8s with ±25% jitter
- **Max attempts**: 5 before manual retry required
- **Visual feedback**: Orange (reconnecting), Green (connected), Red (failed), Gray (offline)

### Story 7.3 & 7.4: Trail Replay (Simplified)
- **Reconnect event**: `rider:reconnect` emitted with buffered path
- **Notification**: Toast shows when rider reconnects with sync count
- **Location sync**: Buffered locations sent on reconnection

### Story 7.6: Last-Known Position Indicators
- **Disconnected markers**: 50% opacity with red background
- **Last seen label**: Shows "Xm ago" below disconnected markers
- **Popup info**: Enhanced popup with last seen time

### Story 7.7: Offline Mode with Degraded Functionality
- **SOS button**: Disabled (grayed out) when offline with toast
- **Status button**: Disabled when offline with toast
- **Bottom status bar**: Shows "—" and "Offline" for dynamic values
- **Location buffering**: Continues in background while offline

## Files Created

### New Components
- `apps/web/src/components/ConnectionStatusBanner.tsx`

### New Stores
- `apps/web/src/store/connectionStore.ts`

### New Hooks
- `apps/web/src/hooks/useOfflineBuffer.ts`

### New Utilities
- `apps/web/src/utils/offlineBuffer.ts` (IndexedDB operations)

## Files Modified

### Frontend
- `apps/web/src/hooks/useSocket.ts` - Added connection tracking, reconnection events
- `apps/web/src/App.tsx` - Integrated offline handling and connection banner
- `apps/web/src/components/MapView.tsx` - Enhanced disconnected rider markers
- `apps/web/src/components/BottomStatusBar.tsx` - Added offline state display

### Backend
- `apps/api/src/index.ts` - Added `rider:reconnect` and `rider:reconnected` events

## WebSocket Events

### Client → Server
- `rider:reconnect` - Notify reconnection with buffered path

### Server → Client
- `rider:reconnected` - Broadcast reconnection to other riders

## Technical Notes

- IndexedDB provides persistent offline storage
- Online/offline detection via `navigator.onLine` and event listeners
- Connection store using Zustand for global state
- Graceful degradation of features when offline
