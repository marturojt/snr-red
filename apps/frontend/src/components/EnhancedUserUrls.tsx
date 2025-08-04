'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RefreshCw,
  Download,
  Palette
} from 'lucide-react';
import { urlApi, authApi, qrApi } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getUserId, copyToClipboard, formatDate } from '@/lib/utils';
import QRCustomizer, { QROptions } from '@/components/QRCustomizer';

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
  const { t } = useLanguage();
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'clicks'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyticsUrl, setAnalyticsUrl] = useState<UrlData | null>(null);
  const [qrUrl, setQrUrl] = useState<UrlData | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [showQrCustomizer, setShowQrCustomizer] = useState(false);
  const [qrCustomizerUrl, setQrCustomizerUrl] = useState<UrlData | null>(null);
  const [qrTabValue, setQrTabValue] = useState<'display' | 'customize'>('display');
  const loadingRef = useRef(false);

  const loadUserUrls = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
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
      loadingRef.current = false;
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

  const handleShowQR = async (url: UrlData) => {
    try {
      console.log('Generating QR for URL:', url.shortUrl);
      
      // Generate basic QR code first (fast)
      const qrDataUrl = await qrApi.generateDataUrl(url.shortUrl);
      console.log('QR generated successfully');
      
      // Show basic QR in modal
      setQrUrl(url);
      setQrCustomizerUrl(url);
      setQrCodeData(qrDataUrl);
      setQrTabValue('display'); // Always start with display tab
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleQrCustomizerGenerate = async (options: QROptions) => {
    if (!qrCustomizerUrl) return;
    
    try {
      console.log('Generating customized QR for URL:', qrCustomizerUrl.shortUrl, 'with options:', options);
      
      // Import qrApi here to avoid circular dependency
      const { qrApi } = await import('@/lib/api');
      
      // Convert QROptions to QrCodeOptions (backend compatible)
      const backendOptions = {
        size: options.size,
        format: options.format === 'jpeg' || options.format === 'webp' ? 'png' : options.format,
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        color: options.color,
        style: options.style,
      };
      
      // Generate QR code data URL with custom options
      const qrDataUrl = await qrApi.generateDataUrl(qrCustomizerUrl.shortUrl, backendOptions);
      console.log('Customized QR generated successfully');
      
      // Update QR code data and switch to display tab
      setQrCodeData(qrDataUrl);
      setQrTabValue('display');
      
      toast.success('Custom QR code generated successfully!');
    } catch (error) {
      console.error('Error generating customized QR code:', error);
      toast.error('Failed to generate customized QR code');
    }
  };

  const handleQrCustomizerComplete = () => {
    // Switch to display tab when customization is complete
    setQrTabValue('display');
  };

  const handleDownloadQR = async () => {
    if (!qrCodeData || !qrUrl) return;
    
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = qrCodeData;
      link.download = `qr-code-${qrUrl.shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handleQrCustomizerClose = () => {
    setShowQrCustomizer(false);
    setQrCustomizerUrl(null);
  };

  const handleShowAnalytics = (url: UrlData) => {
    setAnalyticsUrl(url);
  };

  useEffect(() => {
    // Add a small delay to prevent multiple calls in development
    const timer = setTimeout(() => {
      loadUserUrls();
    }, 10);
    
    return () => clearTimeout(timer);
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
              <div className="h-4 bg-border rounded w-3/4"></div>
              <div className="h-3 bg-border rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-border rounded"></div>
                <div className="h-3 bg-border rounded w-4/5"></div>
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
            <Globe className="w-5 h-5 text-primary" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full blur-xl opacity-20"></div>
              <Link2 className="relative w-16 h-16 text-primary mx-auto mb-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to get started?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first shortened URL and start tracking clicks, generating QR codes, and analyzing your links.
            </p>
            {!user && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
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
              <Link2 className="w-8 h-8 text-primary" />
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
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {url.title}
                        </h3>
                      )}
                      {url.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {url.description}
                        </p>
                      )}
                      
                      {/* URLs */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            SHORT
                          </Badge>
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">
                            {url.shortUrl}
                          </code>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            ORIGINAL
                          </Badge>
                          <span className="text-sm text-muted-foreground truncate">
                            {url.originalUrl}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
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
                        className="hover:bg-blue-50 hover:text-primary"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(url.shortUrl, '_blank')}
                        title="Open URL"
                        className="hover:bg-green-50 hover:text-green-600 dark:text-green-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShowQR(url)}
                        title="View QR Code"
                        className="hover:bg-purple-50 hover:text-purple-600"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShowAnalytics(url)}
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
                        className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50"
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
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No URLs match your search criteria</p>
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

      {/* Analytics Modal */}
      <Dialog open={!!analyticsUrl} onOpenChange={() => setAnalyticsUrl(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              URL Analytics
            </DialogTitle>
            <DialogDescription>
              Analytics data for {analyticsUrl?.title || analyticsUrl?.shortUrl}
            </DialogDescription>
          </DialogHeader>
          
          {analyticsUrl && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Total Clicks</p>
                  <p className="text-2xl font-bold text-blue-900">{analyticsUrl.clicks || 0}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Status</p>
                  <p className="text-sm font-bold text-green-900">
                    {analyticsUrl.isActive ? 'Active' : 'Expired'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(analyticsUrl.createdAt)}</p>
                </div>
                
                {analyticsUrl.title && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Title</p>
                    <p className="text-sm text-muted-foreground">{analyticsUrl.title}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-foreground">Short URL</p>
                  <p className="text-sm text-muted-foreground break-all">{analyticsUrl.shortUrl}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Original URL</p>
                  <p className="text-sm text-muted-foreground break-all">{analyticsUrl.originalUrl}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopy(analyticsUrl.shortUrl, 'Short URL')}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(analyticsUrl.shortUrl, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal with Tabs */}
      <Dialog open={!!qrUrl} onOpenChange={() => { setQrUrl(null); setQrCodeData(null); setQrCustomizerUrl(null); setQrTabValue('display'); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {t('qrCode')}
            </DialogTitle>
            <DialogDescription>
              {t('qrCodeDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {qrUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">
                  {qrUrl.title || t('qrCode')}
                </h3>
                <p className="text-sm text-muted-foreground break-all mb-4">
                  {qrUrl.shortUrl}
                </p>
              </div>

              {/* Tabs for QR Display and Customization */}
              <Tabs value={qrTabValue} onValueChange={(value) => setQrTabValue(value as 'display' | 'customize')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="display" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {t('qrTabs.display')}
                  </TabsTrigger>
                  <TabsTrigger value="customize" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {t('qrTabs.customize')}
                  </TabsTrigger>
                </TabsList>

                {/* Display Tab */}
                <TabsContent value="display" className="space-y-4">
                  {qrCodeData && (
                    <div className="bg-muted p-4 rounded-lg">
                      <Image 
                        src={qrCodeData} 
                        alt="QR Code" 
                        width={250}
                        height={250}
                        className="w-full max-w-[250px] mx-auto border-2 border-border rounded-lg bg-background p-2"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(qrUrl.shortUrl, t('shortUrl'))}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('copyUrl')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadQR}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('download')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Customize Tab */}
                <TabsContent value="customize" className="space-y-4">
                  <QRCustomizer
                    url={qrUrl.shortUrl}
                    onGenerate={handleQrCustomizerGenerate}
                    onClose={() => {}}
                    embedded={true}
                    onGenerateComplete={handleQrCustomizerComplete}
                  />
                </TabsContent>
              </Tabs>

              <p className="text-xs text-muted-foreground text-center">
                {t('qrCodeInstructions')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Customizer */}
      {showQrCustomizer && qrCustomizerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <QRCustomizer
              url={qrCustomizerUrl.shortUrl}
              onGenerate={handleQrCustomizerGenerate}
              onClose={handleQrCustomizerClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
