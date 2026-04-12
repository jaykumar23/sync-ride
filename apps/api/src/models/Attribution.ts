import mongoose, { Schema, Document } from 'mongoose';

export interface IAttribution extends Document {
  deviceIdHash: string;
  attributionSource: string;
  attributionDetails?: string;
  tripCode?: string;
  timestamp: Date;
  appVersion: string;
}

const AttributionSchema = new Schema<IAttribution>({
  deviceIdHash: { type: String, required: true, index: true },
  attributionSource: { 
    type: String, 
    required: true,
    enum: ['google', 'social', 'friend', 'motorcycle', 'news', 'podcast', 'other']
  },
  attributionDetails: { type: String },
  tripCode: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  appVersion: { type: String, default: '1.0.0' },
});

AttributionSchema.index({ timestamp: -1 });
AttributionSchema.index({ attributionSource: 1 });

export const Attribution = mongoose.model<IAttribution>('Attribution', AttributionSchema);
