import mongoose, { Schema, Document } from 'mongoose';
import { UrlData } from '@url-shortener/types';

export interface IUrl extends Omit<UrlData, 'id'>, Document {
  _id: string;
  registeredUserId?: string;
  userType: 'anonymous' | 'free' | 'premium';
  lastAccessedAt: Date;
  autoExpiresAt?: Date;
}

const urlSchema = new Schema<IUrl>({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  qrCodeUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  userId: {
    type: String,
    default: null,
    index: true
  },
  registeredUserId: {
    type: String,
    default: null,
    index: true
  },
  userType: {
    type: String,
    enum: ['anonymous', 'free', 'premium'],
    default: 'anonymous',
    index: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  title: {
    type: String,
    default: null,
    trim: true
  },
  description: {
    type: String,
    default: null,
    trim: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  autoExpiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for expired URLs cleanup
urlSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { expiresAt: { $ne: null } }
});

// Index for auto-expiration based on user type and inactivity
urlSchema.index({ autoExpiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { autoExpiresAt: { $ne: null } }
});

// Compound indexes for cleanup queries
urlSchema.index({ userType: 1, lastAccessedAt: 1 });
urlSchema.index({ userType: 1, createdAt: 1 });
urlSchema.index({ registeredUserId: 1, isActive: 1 });

export const Url = mongoose.model<IUrl>('Url', urlSchema);
