import mongoose, { Schema, Document } from 'mongoose';
import { UrlAnalytics } from '@url-shortener/types';

export interface IAnalytics extends Omit<UrlAnalytics, 'id'>, Document {
  _id: string;
}

const analyticsSchema = new Schema<IAnalytics>({
  urlId: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null,
    index: true
  },
  referer: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null,
    index: true
  },
  city: {
    type: String,
    default: null
  },
  device: {
    type: String,
    default: null,
    index: true
  },
  browser: {
    type: String,
    default: null,
    index: true
  },
  os: {
    type: String,
    default: null,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for analytics queries
analyticsSchema.index({ urlId: 1, timestamp: -1 });
analyticsSchema.index({ urlId: 1, country: 1 });
analyticsSchema.index({ urlId: 1, device: 1 });
analyticsSchema.index({ urlId: 1, browser: 1 });

// TTL index for data retention
const retentionDays = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365');
analyticsSchema.index(
  { timestamp: 1 }, 
  { expireAfterSeconds: retentionDays * 24 * 60 * 60 }
);

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
