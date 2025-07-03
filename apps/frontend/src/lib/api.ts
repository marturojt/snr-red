import axios from 'axios';
import { CreateUrlRequest, CreateUrlResponse, UrlData, UrlStatsResponse, ApiResponse } from '@url-shortener/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const urlApi = {
  // Create short URL
  create: async (data: CreateUrlRequest): Promise<UrlData> => {
    const response: ApiResponse<UrlData> = await api.post('/urls/shorten', data);
    return response.data!;
  },

  // Get URL by short code
  getByShortCode: async (shortCode: string): Promise<UrlData> => {
    const response: ApiResponse<UrlData> = await api.get(`/urls/${shortCode}`);
    return response.data!;
  },

  // Check if short code is available
  checkAvailability: async (shortCode: string): Promise<boolean> => {
    const response: ApiResponse<{ available: boolean }> = await api.get(`/urls/check/${shortCode}`);
    return response.data!.available;
  },

  // Get user URLs
  getUserUrls: async (userId: string): Promise<UrlData[]> => {
    const response: ApiResponse<UrlData[]> = await api.get(`/urls/user/${userId}`);
    return response.data!;
  },

  // Update URL
  update: async (id: string, data: Partial<UrlData>): Promise<UrlData> => {
    const response: ApiResponse<UrlData> = await api.put(`/urls/${id}`, data);
    return response.data!;
  },

  // Delete URL
  delete: async (id: string): Promise<void> => {
    await api.delete(`/urls/${id}`);
  },
};

export const analyticsApi = {
  // Get URL statistics
  getStats: async (urlId: string): Promise<UrlStatsResponse> => {
    const response: ApiResponse<UrlStatsResponse> = await api.get(`/analytics/${urlId}`);
    return response.data!;
  },

  // Delete URL analytics
  deleteAnalytics: async (urlId: string): Promise<number> => {
    const response: ApiResponse<{ deletedCount: number }> = await api.delete(`/analytics/${urlId}`);
    return response.data!.deletedCount;
  },
};

export const qrApi = {
  // Generate QR code
  generate: async (data: string, options?: any): Promise<string> => {
    const response: ApiResponse<{ qrCodeUrl: string }> = await api.post('/qr/generate', { data, options });
    return response.data!.qrCodeUrl;
  },

  // Generate QR code as data URL
  generateDataUrl: async (data: string, options?: any): Promise<string> => {
    const response: ApiResponse<{ dataUrl: string }> = await api.post('/qr/generate/dataurl', { data, options });
    return response.data!.dataUrl;
  },

  // Delete QR code
  delete: async (filename: string): Promise<void> => {
    await api.delete(`/qr/${filename}`);
  },
};

export default api;
