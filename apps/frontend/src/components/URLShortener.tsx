'use client';

import { useState, useCallback } from 'react';
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
  Trash2,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import { urlApi, qrApi } from '@/lib/api';
import { copyToClipboard, isValidUrl, generateRandomString } from '@/lib/utils';
import QRCodeDisplay from './QRCodeDisplay';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserUrls from './UserUrls';

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

export default function URLShortener() {
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

          {/* Main Form */}
          <Card className="mb-8 shadow-lg">
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
                            placeholder="my-custom-code"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                            pattern="[a-zA-Z0-9_-]+"
                            title="Only letters, numbers, hyphens, and underscores allowed"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
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

                    {/* Title and Description */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title (Optional)</Label>
                        <Input
                          id="title"
                          placeholder="My awesome link"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          maxLength={100}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          placeholder="A brief description of this link"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          maxLength={500}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
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

          {/* Results */}
          {shortenedUrl && (
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Link className="w-5 h-5" />
                      Your Shortened URL
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Short URL */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Input
                      value={shortenedUrl.shortUrl}
                      readOnly
                      className="bg-transparent border-none shadow-none text-green-800 font-medium"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(shortenedUrl.shortUrl, 'Short URL')}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(shortenedUrl.shortUrl, '_blank')}
                      className="shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Original URL */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Original URL:</Label>
                    <p className="text-sm break-all text-foreground">{shortenedUrl.originalUrl}</p>
                  </div>

                  {/* Metadata */}
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
        </div>
      </div>
    </div>
  );
}
