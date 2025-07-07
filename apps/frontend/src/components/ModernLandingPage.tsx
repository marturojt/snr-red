'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Play
} from 'lucide-react';
import { urlApi, qrApi, authApi } from '@/lib/api';
import { copyToClipboard, isValidUrl } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import EnhancedQRCodeDisplay from './EnhancedQRCodeDisplay';
import AuthComponent from './AuthComponent';
import ModernDashboard from './ModernDashboard';
import EnhancedUserUrls from './EnhancedUserUrls';
import LanguageSelector from './LanguageSelector';

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
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<UrlData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAnonymousUrls, setShowAnonymousUrls] = useState(false);

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
  }, [originalUrl, t]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SNR.red</span>
              </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('user.myUrls')}</h1>
            <EnhancedUserUrls user={null} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Link className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SNR.red</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                      {user.plan === 'premium' ? (
                        <Crown className="w-3 h-3 mr-1" />
                      ) : null}
                      {user.plan.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">Hi, {user.name}</span>
                  </div>
                  <Button onClick={() => setShowDashboard(true)} size="sm">
                    Dashboard
                  </Button>
                  {user.isAdmin && (
                    <Button 
                      onClick={() => window.location.href = '/admin'} 
                      size="sm" 
                      variant="outline"
                    >
                      Admin
                    </Button>
                  )}
                  <Button 
                    onClick={() => {
                      authApi.logout();
                      setUser(null);
                      toast.success(t('messages.loggedOut'));
                    }} 
                    size="sm" 
                    variant="ghost"
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => setShowAnonymousUrls(true)} 
                    size="sm" 
                    variant="outline"
                  >
                    {t('nav.myUrls')}
                  </Button>
                  <Button onClick={() => setShowAuthModal(true)} size="sm">
                    {t('nav.login')}
                  </Button>
                </div>
              )}
              <div className="ml-4">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('hero.badge')}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('hero.title')}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('hero.description')}
              </p>
            </div>

            {/* URL Shortener Form */}
            <Card className="max-w-2xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-md">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder={t('hero.placeholder')}
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      className="h-14 text-lg pr-32 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="absolute right-2 top-2 h-10 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg"
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
                  
                  {!user && (
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                      <Shield className="w-4 h-4 mr-1" />
                      {t('hero.anonymous')} 
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setShowAuthModal(true)}
                        className="text-blue-600 p-0 ml-1"
                      >
                        {t('hero.signup')}
                      </Button>
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            {shortenedUrl && (
              <Card className="max-w-2xl mx-auto mt-8 shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    {t('results.ready')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">{t('results.shortUrl')}</p>
                      <p className="text-lg font-mono text-blue-600">{shortenedUrl.shortUrl}</p>
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{t('features.analytics.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.analytics.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{t('features.qr.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.qr.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{t('features.security.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.security.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-blue-100">{t('stats.urls')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">250K+</div>
              <div className="text-blue-100">{t('stats.users')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-100">{t('stats.uptime')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">{t('stats.support')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t('pricing.free')}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <CardDescription>{t('pricing.freeDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>100 {t('features.urlsPerMonth')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.basicAnalytics')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.qrGeneration')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
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

            <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-purple-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">{t('pricing.mostPopular')}</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  {t('pricing.premium')}
                </CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
                <CardDescription>{t('pricing.premiumDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.unlimited')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.advancedAnalytics')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.customDomains')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.passwordProtection')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.apiAccess')}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span>{t('features.prioritySupport')}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowAuthModal(true)} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {t('pricing.startTrial')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAuthModal(true)} 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              {t('cta.startTrial')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-gray-900"
            >
              <Play className="w-4 h-4 mr-2" />
              {t('cta.watchDemo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SNR.red</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t('footer.description')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('footer.product')}</h3>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.features')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.pricing')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.api')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.integrations')}</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('footer.company')}</h3>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.about')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.blog')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.careers')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.contact')}</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('footer.support')}</h3>
              <div className="space-y-2">
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.helpCenter')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.status')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.privacy')}</a>
                <a href="#" className="text-gray-400 hover:text-white block">{t('footer.terms')}</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
