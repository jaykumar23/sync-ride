/**
 * WebSocket Event Types
 * Used for Socket.io event definitions and payloads
 */

import { Coordinates, MotionState } from './location';

export type SocketEvent = 
  | 'trip:join'
  | 'trip:leave'
  | 'trip:end'
  | 'location:update'
  | 'sos:broadcast'
  | 'sos:response'
  | 'rider:joined'
  | 'rider:left';

export interface TripJoinPayload {
  tripCode: string;
  displayName: string;
}

export interface TripLeavePayload {
  riderId: string;
}

export interface LocationUpdatePayload {
  coordinates: Coordinates;
  motionState: MotionState;
  heading?: number;
  speed?: number;
}

export interface SOSPayload {
  riderId: string;
  coordinates: Coordinates;
  message?: string;
}

export interface SOSResponsePayload {
  responderId: string;
  message: string;
  eta?: number; // estimated time to arrival in seconds
}

export interface RiderJoinedPayload {
  riderId: string;
  displayName: string;
  isHost: boolean;
}

export interface RiderLeftPayload {
  riderId: string;
}
