import mongoose, { Document, Schema } from 'mongoose';

export interface IVCard extends Document {
  id: string;
  userId?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    company?: string;
    title?: string;
    photo?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social: {
    linkedin?: string;
    whatsapp?: string;
    instagram?: string;
    twitter?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  theme: 'professional' | 'creative' | 'minimal';
  qrCode: string;
  shortUrl: string;
  shortCode: string;
  views: number;
  saves: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const VCardSchema = new Schema<IVCard>({
  userId: {
    type: String,
    required: false,
    index: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    company: {
      type: String,
      trim: true,
      maxlength: 200
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200
    },
    photo: {
      type: String,
      trim: true
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      maxlength: 50
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  social: {
    linkedin: {
      type: String,
      trim: true,
      maxlength: 500
    },
    whatsapp: {
      type: String,
      trim: true,
      maxlength: 50
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: 500
    },
    twitter: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: 200
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    state: {
      type: String,
      trim: true,
      maxlength: 100
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20
    }
  },
  theme: {
    type: String,
    enum: ['professional', 'creative', 'minimal'],
    default: 'professional'
  },
  qrCode: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  saves: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
VCardSchema.index({ userId: 1, isActive: 1 });
VCardSchema.index({ shortCode: 1, isActive: 1 });
VCardSchema.index({ createdAt: -1 });
VCardSchema.index({ views: -1 });

export const VCard = mongoose.model<IVCard>('VCard', VCardSchema);
