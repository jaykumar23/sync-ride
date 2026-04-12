/**
 * Shared Types Package
 * Central export for all shared TypeScript types
 */

// Location types
export type { Coordinates, LocationUpdate } from './location';
export { type MotionState } from './location';

// Trip types
export type { Trip, Rider, TripCode, TripStatus } from './trip';

// WebSocket types
export type {
  SocketEvent,
  TripJoinPayload,
  TripLeavePayload,
  LocationUpdatePayload,
  SOSPayload,
  SOSResponsePayload,
  RiderJoinedPayload,
  RiderLeftPayload,
} from './websocket';
