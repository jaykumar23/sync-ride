/**
 * Trip Session Types
 * Used for trip management, rider info, and trip codes
 */

export type TripCode = string; // 6-character alphanumeric

export type TripStatus = 'active' | 'ended';

export interface Rider {
  riderId: string;
  displayName: string;
  joinedAt: Date;
  isHost: boolean;
}

export interface Trip {
  tripCode: TripCode;
  hostId: string;
  createdAt: Date;
  status: TripStatus;
  riders: Rider[];
}
