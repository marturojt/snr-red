'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Copy, 
  ExternalLink, 
  Trash2,
  QrCode,
  BarChart3,
  Calendar,
  Globe,
  Search,
  Filter,
  SortAsc,
  Eye,
  TrendingUp,
  Zap,
  Link2,
  RefreshCw
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
  clicks?: number;
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

export default function EnhancedUserUrls({ user }: UserUrlsProps) {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'clicks'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDelete = async (urlId: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    try {
      setDeletingId(urlId);
      await urlApi.delete(urlId);
      
      // Remove from state
      setUrls(prev => prev.filter(url => url.id !== urlId));
      
      toast.success('URL deleted successfully');
    } catch (error) {
      console.error('Error deleting URL:', error);
      toast.error('Failed to delete URL');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await copyToClipboard(text);
      toast.success(`${type} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  useEffect(() => {
    loadUserUrls();
  }, [loadUserUrls]);

  // Filter and sort URLs
  const filteredUrls = urls.filter(url => {
    const matchesSearch = searchTerm === '' || 
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && url.isActive) ||
      (filter === 'expired' && !url.isActive);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'clicks':
        return (b.clicks || 0) - (a.clicks || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Your URLs
          </CardTitle>
          <CardDescription>
            {user 
              ? `No URLs created yet. Start shortening your first URL!`
              : 'No URLs created yet. Start shortening your first URL!'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
              <Link2 className="relative w-16 h-16 text-blue-600 mx-auto mb-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to get started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first shortened URL and start tracking clicks, generating QR codes, and analyzing your links.
            </p>
            {!user && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Pro Tip</span>
                </div>
                <p className="text-sm text-blue-700">
                  Create an account to unlock premium features, longer storage, and detailed analytics.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total URLs</p>
                <p className="text-2xl font-bold text-blue-900">{urls.length}</p>
              </div>
              <Link2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active URLs</p>
                <p className="text-2xl font-bold text-green-900">
                  {urls.filter(url => url.isActive).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Plan</p>
                <p className="text-lg font-bold text-purple-900 capitalize">
                  {user?.plan || 'Guest'}
                </p>
              </div>
              <Badge variant={user?.plan === 'premium' ? 'default' : 'secondary'} className="text-xs">
                {user?.plan === 'premium' ? 'Premium' : user ? 'Free' : 'Guest'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Manage URLs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search URLs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'active' | 'expired')}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All URLs</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'clicks')}>
                <SelectTrigger className="w-32">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="clicks">Most Clicks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredUrls.map((url) => (
              <Card key={url.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title and description */}
                      {url.title && (
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
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
                          <Badge variant="outline" className="text-xs">
                            SHORT
                          </Badge>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">
                            {url.shortUrl}
                          </code>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            ORIGINAL
                          </Badge>
                          <span className="text-sm text-gray-600 truncate">
                            {url.originalUrl}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(url.createdAt)}
                        </div>
                        {url.clicks !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {url.clicks} clicks
                          </div>
                        )}
                        {url.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Badge variant={url.isActive ? 'default' : 'destructive'} className="text-xs">
                              {url.isActive ? 'Active' : 'Expired'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(url.shortUrl, 'Short URL')}
                        title="Copy Short URL"
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(url.shortUrl, '_blank')}
                        title="Open URL"
                        className="hover:bg-green-50 hover:text-green-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      
                      {url.qrCodeUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(url.qrCodeUrl, '_blank')}
                          title="View QR Code"
                          className="hover:bg-purple-50 hover:text-purple-600"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Analytics"
                        className="hover:bg-orange-50 hover:text-orange-600"
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
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUrls.length === 0 && urls.length > 0 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No URLs match your search criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={loadUserUrls}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            
            {user?.plan === 'free' && (
              <Badge variant="secondary" className="text-xs">
                Free Plan: {urls.length}/100 URLs
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
