'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Link, 
  QrCode, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Crown,
  Play,
  User,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { urlApi, qrApi, authApi } from '@/lib/api';
import { copyToClipboard, isValidUrl } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import EnhancedQRCodeDisplay from './EnhancedQRCodeDisplay';
import AuthComponent from './AuthComponent';
import ModernDashboard from './ModernDashboard';
import EnhancedUserUrls from './EnhancedUserUrls';
import { ErrorBoundary } from './ErrorBoundary';
import LanguageSelector from './LanguageSelector';
import VCardGenerator from './VCardGenerator';
import { ResponsiveHeader } from './ResponsiveHeader';

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
  isAdmin?: boolean;
}

export default function ModernLandingPage() {
  const { t } = useLanguage();
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<UrlData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAnonymousUrls, setShowAnonymousUrls] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'vcard'>('url');

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
      toast.error(t('messages.enterUrl'));
      return;
    }

    if (!isValidUrl(originalUrl)) {
      toast.error(t('messages.validUrl'));
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        originalUrl,
        title: title || undefined,
        customCode: customCode || undefined,
        generateQr: true,
      };

      const result = await urlApi.create(requestData);
      setShortenedUrl(result);

      // If QR code was generated, get the data URL version for display
      if (result.qrCodeUrl) {
        try {
          const dataUrl = await qrApi.generateDataUrl(result.shortUrl);
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('Failed to generate QR data URL:', error);
        }
      }

      toast.success(t('messages.urlShortened'));
    } catch (error) {
      console.error('Error shortening URL:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  }, [originalUrl, title, customCode, t]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await copyToClipboard(text);
      toast.success(t('messages.urlCopied'));
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [t]);

  const resetForm = useCallback(() => {
    setShortenedUrl(null);
    setQrCodeDataUrl(null);
    setOriginalUrl('');
    setTitle('');
    setCustomCode('');
  }, []);

  const generateRandomCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCustomCode(result);
  }, []);

  if (showDashboard && user) {
    return (
      <ModernDashboard 
        user={user}
        onBack={() => setShowDashboard(false)}
        onUserUpdate={setUser}
      />
    );
  }

  if (showAnonymousUrls && !user) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 h-16">
          <div className="container mx-auto px-4 h-full">
            <div className="flex items-center justify-between h-full">
              <button 
                onClick={() => setShowAnonymousUrls(false)}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg flex items-center justify-center">
                  <Link className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold">SNR.red</span>
              </button>
              <Button 
                onClick={() => setShowAnonymousUrls(false)} 
                variant="outline"
                size="sm"
              >
                {t('nav.back')}
              </Button>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('user.myUrls')}</h1>
            <ErrorBoundary>
              <EnhancedUserUrls user={null} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Header */}
      <ResponsiveHeader
        user={user}
        onLogoClick={resetForm}
        onAuthClick={() => setShowAuthModal(true)}
        onDashboardClick={() => setShowDashboard(true)}
        onMyUrlsClick={() => setShowAnonymousUrls(true)}
        onLogout={() => {
          authApi.logout();
          setUser(null);
          toast.success(t('messages.loggedOut'));
        }}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Badge variant="secondary" className="mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('hero.badge')}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                {t('hero.mainTitle')}{' '}
                <span className="text-primary">
                  {t('hero.mainTitleHighlight')}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                {t('hero.mainDescription')}
              </p>
            </div>

            {/* Tabbed Interface */}
            <Card className="max-w-4xl mx-auto border shadow-lg">
              <CardContent className="p-8">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'vcard')}>
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      {t('tabs.url')}
                    </TabsTrigger>
                    <TabsTrigger value="vcard" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('tabs.vcard')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {t('hero.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('hero.description')}
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="relative">
                        <Input
                          type="url"
                          placeholder={t('hero.placeholder')}
                          value={originalUrl}
                          onChange={(e) => setOriginalUrl(e.target.value)}
                          className="h-14 text-lg pr-32 border-2 border-border focus:border-primary rounded-xl"
                          disabled={isLoading}
                        />
                        <Button
                          type="submit"
                          disabled={isLoading}
                          size="sm"
                          className="absolute right-2 top-2 h-10 px-6 rounded-lg"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              {t('hero.shorten')}
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Advanced Options Toggle */}
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Settings className="w-4 h-4" />
                          {t('hero.advancedOptions')}
                          {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>

                      {/* Advanced Options */}
                      {showAdvancedOptions && (
                        <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border">
                          <div>
                            <Input
                              type="text"
                              placeholder={t('hero.titlePlaceholder')}
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="h-12 text-base border-2 border-border focus:border-primary rounded-xl"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder={t('hero.customCodePlaceholder')}
                              value={customCode}
                              onChange={(e) => setCustomCode(e.target.value)}
                              className="h-12 text-base border-2 border-border focus:border-primary rounded-xl"
                              disabled={isLoading}
                              pattern="[a-zA-Z0-9_-]+"
                              title="Only letters, numbers, hyphens, and underscores allowed"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generateRandomCode}
                              className="h-12 px-4 border-2 border-border hover:border-primary rounded-xl"
                              disabled={isLoading}
                              title={t('hero.generateRandom')}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {!user && (
                        <p className="text-sm text-muted-foreground flex items-center justify-center">
                          <Shield className="w-4 h-4 mr-1" />
                          {t('hero.anonymous')} 
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => setShowAuthModal(true)}
                            className="text-primary dark:text-primary/80 p-0 ml-1"
                          >
                            {t('hero.signup')}
                          </Button>
                        </p>
                      )}
                    </form>
                  </TabsContent>

                  <TabsContent value="vcard" className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {t('vcard.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('vcard.description')}
                      </p>
                    </div>
                    
                    <VCardGenerator />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Results */}
            {shortenedUrl && (
              <Card className="max-w-2xl mx-auto mt-8 border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Check className="w-5 h-5" />
                    {t('results.ready')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{t('results.shortUrl')}</p>
                      <p className="text-lg font-mono text-primary">{shortenedUrl.shortUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(shortenedUrl.shortUrl)}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => window.open(shortenedUrl.shortUrl, '_blank')}
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {qrCodeDataUrl && (
                    <div className="flex justify-center">
                      <EnhancedQRCodeDisplay url={shortenedUrl.shortUrl} qrCodeDataUrl={qrCodeDataUrl} />
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button onClick={resetForm} variant="outline">
                      {t('results.createAnother')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border hover:shadow-md transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Link className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{t('features.url.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t('features.url.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border hover:shadow-md transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{t('features.qr.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t('features.qr.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border hover:shadow-md transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{t('features.vcard.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t('features.vcard.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border hover:shadow-md transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{t('features.analytics.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t('features.analytics.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">1M+</div>
              <div className="text-muted-foreground text-sm">{t('stats.urls')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">250K+</div>
              <div className="text-muted-foreground text-sm">{t('stats.users')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">99.9%</div>
              <div className="text-muted-foreground text-sm">{t('stats.uptime')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-muted-foreground text-sm">{t('stats.support')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative border shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold">{t('pricing.free')}</CardTitle>
                <div className="text-4xl font-bold mb-2">$0</div>
                <CardDescription>{t('pricing.freeDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>100 {t('features.urlsPerMonth')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>{t('features.basicAnalytics')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>{t('features.qrGeneration')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>3 {t('features.retention')}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowAuthModal(true)} 
                  className="w-full" 
                  variant="outline"
                >
                  {t('pricing.getStarted')}
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-primary/20 shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">{t('pricing.mostPopular')}</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  {t('pricing.premium')}
                </CardTitle>
                <div className="text-4xl font-bold mb-2">$9.99</div>
                <CardDescription>{t('pricing.premiumDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span className="text-sm">{t('features.unlimited')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span className="text-sm">{t('features.advancedAnalytics')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>{t('features.customDomains')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>{t('features.passwordProtection')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>{t('features.apiAccess')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <span>{t('features.prioritySupport')}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowAuthModal(true)} 
                  className="w-full"
                >
                  {t('pricing.startTrial')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowAuthModal(true)} 
                size="lg"
              >
                {t('cta.startTrial')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {t('cta.watchDemo')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg flex items-center justify-center">
                  <Link className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold">SNR.red</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {t('footer.description')}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">{t('footer.product')}</h3>
              <div className="space-y-2">
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.features')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.pricing')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.api')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.integrations')}</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">{t('footer.company')}</h3>
              <div className="space-y-2">
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.about')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.blog')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.careers')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.contact')}</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">{t('footer.support')}</h3>
              <div className="space-y-2">
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.helpCenter')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.status')}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground block text-sm transition-colors">{t('footer.privacy')}</a>
                <a href="#" className="text-muted-foreground hover:text-white block">{t('footer.terms')}</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-muted-foreground">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('auth.welcome')}</h2>
                <Button 
                  onClick={() => setShowAuthModal(false)} 
                  variant="ghost" 
                  size="sm"
                >
                  {t('auth.close')}
                </Button>
              </div>
              <AuthComponent 
                user={user}
                onAuthChange={(userData) => {
                  setUser(userData);
                  setShowAuthModal(false);
                  if (userData) {
                    toast.success(`${t('messages.welcome')}${userData.name ? `, ${userData.name}` : ''}!`);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
