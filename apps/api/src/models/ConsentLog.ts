import mongoose, { Schema, Document } from 'mongoose';

type ConsentType = 'location_tracking' | 'trip_replay' | 'terms_of_service' | 'data_collection' | 'data_deletion';
type ConsentAction = 'granted' | 'denied' | 'withdrawn' | 'requested';

interface IConsentLogDocument extends Document {
  deviceId: string;
  consentType: ConsentType;
  action: ConsentAction;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  consentText: string;
  appVersion: string;
  anonymizedAt?: Date;
}

const ConsentLogSchema = new Schema<IConsentLogDocument>({
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  consentType: {
    type: String,
    required: true,
    enum: ['location_tracking', 'trip_replay', 'terms_of_service', 'data_collection', 'data_deletion'],
  },
  action: {
    type: String,
    required: true,
    enum: ['granted', 'denied', 'withdrawn', 'requested'],
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  consentText: {
    type: String,
    required: true,
  },
  appVersion: {
    type: String,
    required: true,
  },
  anonymizedAt: {
    type: Date,
    required: false,
  },
}, {
  // Immutable - no updates allowed after creation
  strict: true,
});

// Indexes for querying
ConsentLogSchema.index({ deviceId: 1, timestamp: -1 });
ConsentLogSchema.index({ consentType: 1, timestamp: -1 });
ConsentLogSchema.index({ action: 1, timestamp: -1 });

// 7-year retention (regulatory requirement)
// Note: We don't set TTL here because consent logs must be retained for 7 years
// This would need manual cleanup after 7 years or a separate job

export const ConsentLog = mongoose.model<IConsentLogDocument>('ConsentLog', ConsentLogSchema);
