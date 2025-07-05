'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Copy, 
  ExternalLink, 
  Trash2,
  QrCode,
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';
import { urlApi, authApi } from '@/lib/api';
import { getUserId, copyToClipboard, formatDate } from '@/lib/utils';

interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  qrCodeUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  title?: string;
  description?: string;
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

interface UserUrlsProps {
  user: User | null;
}

export default function UserUrls({ user }: UserUrlsProps) {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUserUrls = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (user) {
        // Authenticated user - get their registered URLs
        const userUrls = await authApi.getMyUrls();
        setUrls(userUrls);
      } else {
        // Anonymous user - get URLs by browser ID
        const userId = getUserId();
        if (!userId) {
          setUrls([]);
          return;
        }
        const userUrls = await urlApi.getUserUrls(userId);
        setUrls(userUrls);
      }
    } catch (error) {
      console.error('Error loading user URLs:', error);
      toast.error('Failed to load your URLs');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserUrls();
  }, [loadUserUrls]);

  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await copyToClipboard(text);
      toast.success(`${type} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      setDeletingId(id);
      await urlApi.delete(id);
      setUrls(prev => prev.filter(url => url.id !== id));
      toast.success('URL deleted successfully');
    } catch (error) {
      console.error('Error deleting URL:', error);
      toast.error('Failed to delete URL');
    } finally {
      setDeletingId(null);
    }
  }, []);

  const openUrl = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Your URLs
          </CardTitle>
          <CardDescription>
            Loading your shortened URLs...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (urls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Your URLs
          </CardTitle>
          <CardDescription>
            {user 
              ? `You haven&apos;t created any URLs yet with your account`
              : `You haven&apos;t created any URLs yet with this browser`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Start by creating your first shortened URL!
            </p>
            {!user && (
              <p className="text-sm text-gray-400">
                💡 Tip: Create an account to manage your URLs permanently and get extended storage.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Your URLs
          <Badge variant="secondary">{urls.length}</Badge>
          {user && (
            <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
              {user.plan === 'premium' ? 'Premium' : 'Free'} Plan
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {user 
            ? `Manage and track your shortened URLs (${user.plan === 'premium' ? 'Premium features enabled' : 'Free plan - URLs expire after 3 months'})`
            : 'Manage and track your shortened URLs (Anonymous - URLs expire after 3 months)'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {urls.map((url) => (
            <div key={url.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title and description */}
                  {url.title && (
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {url.title}
                    </h3>
                  )}
                  {url.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {url.description}
                    </p>
                  )}
                  
                  {/* URLs */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Short:</span>
                      <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {url.shortUrl}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(url.shortUrl, 'Short URL')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUrl(url.shortUrl)}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Original:</span>
                      <code className="text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded truncate flex-1">
                        {url.originalUrl}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUrl(url.originalUrl)}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDate(url.createdAt)}</span>
                    </div>
                    {url.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Expires {formatDate(url.expiresAt)}</span>
                      </div>
                    )}
                    <Badge variant={url.isActive ? "default" : "secondary"}>
                      {url.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-4">
                  {url.qrCodeUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUrl(url.qrCodeUrl!)}
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(url.id)}
                    disabled={deletingId === url.id}
                    title="Delete URL"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Refresh button */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={loadUserUrls}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
