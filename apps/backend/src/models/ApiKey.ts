import mongoose, { Schema, Document } from 'mongoose';
import { ApiKeyScope } from '@url-shortener/types';

export interface IApiKey extends Document {
  _id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: ApiKeyScope[];
  lastUsedAt?: Date;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // Human-readable, non-secret prefix shown in the dashboard to identify a key.
  keyPrefix: {
    type: String,
    required: true
  },
  // SHA-256 of the full token. The raw token is shown once at creation and never stored.
  keyHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  scopes: {
    type: [String],
    enum: ['urls:read', 'urls:write', 'analytics:read'],
    default: ['urls:read', 'urls:write', 'analytics:read']
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  revoked: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.keyHash; // Never expose the hash
      return ret;
    }
  }
});

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
