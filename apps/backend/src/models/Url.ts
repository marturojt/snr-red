import mongoose, { Schema, Document } from 'mongoose';
import { UrlData } from '@url-shortener/types';

export interface IUrl extends Omit<UrlData, 'id'>, Document {
  _id: string;
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

export const Url = mongoose.model<IUrl>('Url', urlSchema);
