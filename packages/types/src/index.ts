export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  qrCodeUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  userId?: string;
  registeredUserId?: string;
  userType?: 'anonymous' | 'free' | 'premium';
  lastAccessedAt?: Date;
  autoExpiresAt?: Date;
  title?: string;
  description?: string;
  clicks?: number;
}

export interface UrlAnalytics {
  id: string;
  urlId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  customCode?: string;
  expiresAt?: Date;
  title?: string;
  description?: string;
  generateQr?: boolean;
}

export interface CreateUrlResponse {
  success: boolean;
  data?: UrlData;
  error?: string;
}

export interface UrlStatsResponse {
  url: UrlData;
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: Array<{
    date: string;
    clicks: number;
  }>;
  clicksByCountry: Array<{
    country: string;
    clicks: number;
  }>;
  clicksByDevice: Array<{
    device: string;
    clicks: number;
  }>;
  clicksByBrowser: Array<{
    browser: string;
    clicks: number;
  }>;
}

export interface QrCodeOptions {
  size?: number;
  format?: 'png' | 'svg';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  style?: 'square' | 'rounded' | 'dots' | 'circles';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isAdmin?: boolean;
  subscription?: {
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  plan?: 'free' | 'premium';
}

// API keys (programmatic access from other projects)
export type ApiKeyScope = 'urls:read' | 'urls:write' | 'analytics:read';

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string; // visible prefix, e.g. "snr_live_ab12"
  scopes: ApiKeyScope[];
  lastUsedAt?: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes?: ApiKeyScope[];
}

// Returned only once, at creation time. `token` is never persisted or returned again.
export interface CreateApiKeyResponse extends ApiKey {
  token: string;
}

export interface VCardData {
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

export interface CreateVCardRequest {
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
  social?: {
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
  theme?: 'professional' | 'creative' | 'minimal';
}

export interface VCardStatsResponse {
  vcard: VCardData;
  totalViews: number;
  totalSaves: number;
  viewsThisMonth: number;
  savesThisMonth: number;
  analytics: VCardAnalytics[];
}

export interface VCardAnalytics {
  id: string;
  vcardId: string;
  timestamp: Date;
  action: 'view' | 'save' | 'download';
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
}
