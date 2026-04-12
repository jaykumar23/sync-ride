/**
 * Location Types
 * Used for GPS coordinates, motion states, and location updates
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  timestamp: Date;
}

export type MotionState = 'stationary' | 'predictable' | 'dynamic';

export interface LocationUpdate {
  riderId: string;
  coordinates: Coordinates;
  motionState: MotionState;
  heading?: number; // degrees (0-360)
  speed?: number;   // meters per second
}
