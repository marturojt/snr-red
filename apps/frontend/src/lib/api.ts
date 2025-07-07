import axios from 'axios';
import { CreateUrlRequest, UrlData, UrlStatsResponse, ApiResponse } from '@url-shortener/types';
import { getUserId } from './utils';

// vCard interfaces (temporary until types package is updated)
interface VCardData {
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

interface CreateVCardRequest {
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

// Auth interfaces (temporary until types are updated)
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  plan?: 'free' | 'premium';
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
}

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
    
    // Add user ID for tracking (for non-authenticated users)
    if (!token) {
      const userId = getUserId();
      if (userId) {
        config.headers['x-user-id'] = userId;
      }
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
  generate: async (data: string, options?: Record<string, unknown>): Promise<string> => {
    const response: ApiResponse<{ qrCodeUrl: string }> = await api.post('/qr/generate', { data, options });
    return response.data!.qrCodeUrl;
  },

  // Generate QR code as data URL
  generateDataUrl: async (data: string, options?: Record<string, unknown>): Promise<string> => {
    const response: ApiResponse<{ dataUrl: string }> = await api.post('/qr/generate/dataurl', { data, options });
    return response.data!.dataUrl;
  },

  // Delete QR code
  delete: async (filename: string): Promise<void> => {
    await api.delete(`/qr/${filename}`);
  },
};

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response: ApiResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data!;
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: ApiResponse<AuthResponse> = await api.post('/auth/login', data);
    return response.data!;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response: ApiResponse<User> = await api.get('/auth/me');
    return response.data!;
  },

  // Update user plan
  updatePlan: async (plan: 'free' | 'premium'): Promise<User> => {
    const response: ApiResponse<User> = await api.put('/auth/plan', { plan });
    return response.data!;
  },

  // Get user's URLs (authenticated)
  getMyUrls: async (): Promise<UrlData[]> => {
    const response: ApiResponse<UrlData[]> = await api.get('/urls/my-urls');
    return response.data!;
  },

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
  },

  // Save token and user
  saveAuth: (authResponse: AuthResponse) => {
    localStorage.setItem('auth-token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth-token');
  }
};

// vCard API
export const vcardApi = {
  // Create vCard
  create: async (data: CreateVCardRequest): Promise<VCardData> => {
    const response: ApiResponse<VCardData> = await api.post('/vcard/create', data);
    return response.data!;
  },

  // Get vCard by short code
  getByShortCode: async (shortCode: string): Promise<VCardData> => {
    const response: ApiResponse<VCardData> = await api.get(`/vcard/${shortCode}`);
    return response.data!;
  },

  // Get user vCards
  getUserVCards: async (userId: string): Promise<VCardData[]> => {
    const response: ApiResponse<VCardData[]> = await api.get(`/vcard/user/${userId}`);
    return response.data!;
  },

  // Download vCard as VCF
  download: async (shortCode: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vcard/${shortCode}/download`, {
      headers: {
        'Authorization': localStorage.getItem('auth-token') ? `Bearer ${localStorage.getItem('auth-token')}` : '',
        'x-user-id': getUserId()
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download vCard');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `contact.vcf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Update vCard
  update: async (id: string, data: any): Promise<any> => {
    const response: ApiResponse<any> = await api.put(`/vcard/${id}`, data);
    return response.data!;
  },

  // Delete vCard
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vcard/${id}`);
  }
};

export default api;
