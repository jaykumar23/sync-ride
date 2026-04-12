import mongoose, { Schema, Document } from 'mongoose';
import { Coordinates } from 'shared-types';

interface LocationPoint {
  coordinates: Coordinates;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface ITripReplayDocument extends Document {
  tripCode: string;
  riderId: string;
  displayName: string;
  locationHistory: LocationPoint[];
  consentGranted: boolean;
  consentTimestamp: Date;
  consentDeviceId: string;
  tripStartedAt: Date;
  tripEndedAt: Date;
  createdAt: Date;
}

const LocationPointSchema = new Schema<LocationPoint>({
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    altitude: { type: Number },
    altitudeAccuracy: { type: Number },
    heading: { type: Number },
    speed: { type: Number },
  },
  timestamp: { type: Date, required: true },
  speed: { type: Number },
  heading: { type: Number },
}, { _id: false });

const TripReplaySchema = new Schema<ITripReplayDocument>({
  tripCode: {
    type: String,
    required: true,
    uppercase: true,
  },
  riderId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  locationHistory: {
    type: [LocationPointSchema],
    default: [],
  },
  consentGranted: {
    type: Boolean,
    required: true,
    default: false,
  },
  consentTimestamp: {
    type: Date,
    required: true,
  },
  consentDeviceId: {
    type: String,
    required: true,
  },
  tripStartedAt: {
    type: Date,
    required: true,
  },
  tripEndedAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 604800, // 7-day TTL (in seconds)
  },
});

// Indexes
TripReplaySchema.index({ tripCode: 1, riderId: 1 }, { unique: true });
TripReplaySchema.index({ riderId: 1 });
TripReplaySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7-day TTL

export const TripReplay = mongoose.model<ITripReplayDocument>('TripReplay', TripReplaySchema);
