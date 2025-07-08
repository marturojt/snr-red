'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Link, 
  Crown, 
  Menu, 
  X
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

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

interface ResponsiveHeaderProps {
  user: User | null;
  onLogoClick: () => void;
  onAuthClick: () => void;
  onDashboardClick: () => void;
  onMyUrlsClick: () => void;
  onLogout: () => void;
}

export function ResponsiveHeader({
  user,
  onLogoClick,
  onAuthClick,
  onDashboardClick,
  onMyUrlsClick,
  onLogout
}: ResponsiveHeaderProps) {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 h-16">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <button 
            onClick={() => {
              onLogoClick();
              closeMobileMenu();
            }}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg flex items-center justify-center">
              <Link className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold">SNR.red</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                    {user.plan === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                    {user.plan.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{t('user.hi')}, {user.name}</span>
                </div>
                <Button onClick={onDashboardClick} size="sm">
                  {t('nav.dashboard')}
                </Button>
                {user.isAdmin && (
                  <Button 
                    onClick={() => window.location.href = '/admin'} 
                    size="sm" 
                    variant="outline"
                  >
                    {t('nav.admin')}
                  </Button>
                )}
                <Button 
                  onClick={onLogout} 
                  size="sm" 
                  variant="ghost"
                >
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={onMyUrlsClick} 
                  size="sm" 
                  variant="outline"
                >
                  {t('nav.myUrls')}
                </Button>
                <Button onClick={onAuthClick} size="sm">
                  {t('nav.login')}
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-2 ml-4">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="h-8 w-8 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                        {user.plan === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                        {user.plan.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{t('user.hi')}, {user.name}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      onDashboardClick();
                      closeMobileMenu();
                    }} 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    {t('nav.dashboard')}
                  </Button>
                  {user.isAdmin && (
                    <Button 
                      onClick={() => {
                        window.location.href = '/admin';
                        closeMobileMenu();
                      }} 
                      size="sm" 
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {t('nav.admin')}
                    </Button>
                  )}
                  <Button 
                    onClick={() => {
                      onLogout();
                      closeMobileMenu();
                    }} 
                    size="sm" 
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => {
                      onMyUrlsClick();
                      closeMobileMenu();
                    }} 
                    size="sm" 
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {t('nav.myUrls')}
                  </Button>
                  <Button 
                    onClick={() => {
                      onAuthClick();
                      closeMobileMenu();
                    }} 
                    size="sm"
                    className="w-full justify-start"
                  >
                    {t('nav.login')}
                  </Button>
                </>
              )}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Language:</span>
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
