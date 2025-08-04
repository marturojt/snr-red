'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Copy, 
  QrCode, 
  Link, 
  BarChart3, 
  Settings, 
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  User
} from 'lucide-react';
import { urlApi, qrApi, authApi } from '@/lib/api';
import { copyToClipboard, isValidUrl, generateRandomString } from '@/lib/utils';
import QRCodeDisplay from './QRCodeDisplay';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserUrls from './UserUrls';
import AuthComponent from './AuthComponent';

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

export default function URLShortenerWithTabs() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [generateQr, setGenerateQr] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<UrlData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing auth on component mount
  useEffect(() => {
    const storedUser = authApi.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      toast.error('Please enter a URL to shorten');
      return;
    }

    if (!isValidUrl(originalUrl)) {
      toast.error('Please enter a valid URL with protocol (http:// or https://)');
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        originalUrl,
        customCode: customCode || undefined,
        title: title || undefined,
        description: description || undefined,
        generateQr,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      };

      const result = await urlApi.create(requestData);
      setShortenedUrl(result);

      // If QR code was generated, get the data URL version for display
      if (result.qrCodeUrl && generateQr) {
        try {
          const dataUrl = await qrApi.generateDataUrl(result.shortUrl);
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('Failed to generate QR data URL:', error);
        }
      }

      toast.success('URL shortened successfully!');
      
      // Reset form
      setOriginalUrl('');
      setCustomCode('');
      setTitle('');
      setDescription('');
      setExpiresAt('');
      setShowAdvanced(false);
    } catch (error) {
      console.error('Error shortening URL:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  }, [originalUrl, customCode, title, description, generateQr, expiresAt]);

  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await copyToClipboard(text);
      toast.success(`${type} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const generateRandomCode = useCallback(() => {
    setCustomCode(generateRandomString(8));
  }, []);

  const resetForm = useCallback(() => {
    setShortenedUrl(null);
    setQrCodeDataUrl(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-background to-purple-50/30 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              URL Shortener
            </h1>
            <p className="text-lg text-muted-foreground">
              Shorten your URLs and generate QR codes with detailed analytics
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Create URL
              </TabsTrigger>
              <TabsTrigger value="my-urls" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                My URLs
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Create URL Tab */}
            <TabsContent value="create" className="space-y-8">
              {/* Main Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Create Short URL
                  </CardTitle>
                  <CardDescription>
                    Enter a long URL to create a shortened version with optional customization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Original URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor="original-url">Original URL *</Label>
                      <Input
                        id="original-url"
                        type="url"
                        placeholder="https://example.com/very-long-url"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        required
                        className="text-base"
                      />
                    </div>

                    {/* Advanced Options Toggle */}
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Advanced Options
                        {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>

                      <div className="flex items-center gap-2">
                        <Label htmlFor="generate-qr">Generate QR Code</Label>
                        <Switch
                          id="generate-qr"
                          checked={generateQr}
                          onCheckedChange={setGenerateQr}
                        />
                      </div>
                    </div>

                    {/* Advanced Options */}
                    {showAdvanced && (
                      <div className="space-y-4 p-4 bg-muted rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Custom Short Code */}
                          <div className="space-y-2">
                            <Label htmlFor="custom-code">Custom Short Code</Label>
                            <div className="flex gap-2">
                              <Input
                                id="custom-code"
                                type="text"
                                placeholder="my-custom-code"
                                value={customCode}
                                onChange={(e) => setCustomCode(e.target.value)}
                                pattern="[a-zA-Z0-9_-]+"
                                title="Only letters, numbers, hyphens, and underscores allowed"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={generateRandomCode}
                                title="Generate random code"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Expiration Date */}
                          <div className="space-y-2">
                            <Label htmlFor="expires-at">Expiration Date</Label>
                            <Input
                              id="expires-at"
                              type="datetime-local"
                              value={expiresAt}
                              onChange={(e) => setExpiresAt(e.target.value)}
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                          <Label htmlFor="title">Title (Optional)</Label>
                          <Input
                            id="title"
                            type="text"
                            placeholder="Give your shortened URL a title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Input
                            id="description"
                            type="text"
                            placeholder="Add a description for your URL"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                          />
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-2" />
                          Shorten URL
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Result Section */}
              {shortenedUrl && (
                <div className="space-y-6">
                  <Card className="shadow-lg border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Link className="w-5 h-5" />
                        URL Shortened Successfully!
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetForm}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Create Another
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Short URL */}
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Shortened URL:</Label>
                        <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                          <code className="flex-1 text-primary font-mono text-sm">
                            {shortenedUrl.shortUrl}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(shortenedUrl.shortUrl, 'Short URL')}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(shortenedUrl.shortUrl, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Visit
                          </Button>
                        </div>
                      </div>

                      {/* Original URL */}
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Original URL:</Label>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                          <code className="flex-1 text-foreground font-mono text-sm truncate">
                            {shortenedUrl.originalUrl}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(shortenedUrl.originalUrl, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Visit
                          </Button>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {(shortenedUrl.title || shortenedUrl.description) && (
                        <div className="space-y-2">
                          {shortenedUrl.title && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Title:</Label>
                              <p className="text-sm text-foreground">{shortenedUrl.title}</p>
                            </div>
                          )}
                          {shortenedUrl.description && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Description:</Label>
                              <p className="text-sm text-foreground">{shortenedUrl.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tabs for QR Code and Analytics */}
                  <Tabs defaultValue="qr" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="qr" className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        QR Code
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="qr">
                      <QRCodeDisplay
                        url={shortenedUrl.shortUrl}
                        qrCodeDataUrl={qrCodeDataUrl}
                        qrCodeUrl={shortenedUrl.qrCodeUrl}
                      />
                    </TabsContent>

                    <TabsContent value="analytics">
                      <AnalyticsDashboard urlId={shortenedUrl.id} />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </TabsContent>

            {/* My URLs Tab */}
            <TabsContent value="my-urls">
              <UserUrls user={user} />
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <AuthComponent user={user} onAuthChange={setUser} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
