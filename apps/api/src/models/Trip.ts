import mongoose, { Schema, Document } from 'mongoose';
import { Trip as TripType, Rider, TripStatus } from 'shared-types';

interface ITripDocument extends Omit<TripType, 'createdAt'>, Document {
  createdAt: Date;
  endedAt?: Date;
  riders: Rider[];
}

const RiderSchema = new Schema<Rider>({
  riderId: { type: String, required: true },
  displayName: { type: String, required: true },
  joinedAt: { type: Date, required: true },
  isHost: { type: Boolean, required: true, default: false },
}, { _id: false });

const TripSchema = new Schema<ITripDocument>({
  tripCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6,
  },
  hostId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 604800, // 7 days TTL (in seconds)
  },
  endedAt: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'ended'],
    default: 'active',
  },
  riders: {
    type: [RiderSchema],
    required: true,
    default: [],
  },
});

// Indexes
TripSchema.index({ tripCode: 1 }, { unique: true });
TripSchema.index({ hostId: 1, createdAt: -1 });
TripSchema.index({ status: 1, createdAt: -1 });

export const Trip = mongoose.model<ITripDocument>('Trip', TripSchema);
