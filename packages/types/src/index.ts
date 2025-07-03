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
  title?: string;
  description?: string;
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
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
