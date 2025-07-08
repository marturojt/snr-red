'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, 
  Crown,
  LogOut,
  UserPlus,
  LogIn,
  Settings,
  Shield,
  Calendar,
  CheckCircle,
  Star,
  Zap,
  Gift,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { authApi } from '@/lib/api';

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

interface AuthComponentProps {
  user: User | null;
  onAuthChange: (user: User | null) => void;
}

export default function EnhancedAuthComponent({ user, onAuthChange }: AuthComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    plan: 'free' as 'free' | 'premium' 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login(loginForm);
      authApi.saveAuth(response);
      onAuthChange(response.user);
      toast.success('Welcome back! Login successful');
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.email || !registerForm.password || !registerForm.name) {
      toast.error('Please fill in all fields');
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register(registerForm);
      authApi.saveAuth(response);
      onAuthChange(response.user);
      toast.success('Account created successfully! Welcome to SNR.red');
      setRegisterForm({ email: '', password: '', name: '', plan: 'free' });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    onAuthChange(null);
    toast.success('Logged out successfully');
  };

  const handleUpgradePlan = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await authApi.updatePlan('premium');
      onAuthChange(updatedUser);
      toast.success('🎉 Plan upgraded to Premium! Enjoy your new features');
    } catch (error) {
      console.error('Plan upgrade error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    // User is logged in - show enhanced user profile
    return (
      <div className="space-y-6">
        {/* User Profile Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Badge 
                variant={user.plan === 'premium' ? 'default' : 'secondary'}
                className={user.plan === 'premium' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
              >
                {user.plan === 'premium' ? (
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </div>
                ) : (
                  'Free Plan'
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-sm text-gray-600">Member since</p>
                <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-sm text-gray-600">Last login</p>
                <p className="font-semibold">
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Today'
                  }
                </p>
              </div>
            </div>

            {/* Current Plan Benefits */}
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Current Plan Benefits
              </h4>
              <div className="space-y-2">
                {user.plan === 'free' ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>URL shortening & QR codes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Basic analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>3-month URL retention</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Unlimited URL shortening</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Advanced analytics & insights</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Permanent URL storage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Custom domains (coming soon)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Priority support</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              {user.plan === 'free' && (
                <Button
                  onClick={handleUpgradePlan}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </Button>
              )}
              
              {user.isAdmin && (
                <Button
                  onClick={() => window.location.href = '/admin'}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Button>
              )}
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Upgrade CTA for Free Users */}
        {user.plan === 'free' && (
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Unlock Premium Features</h3>
                  <p className="text-purple-100 text-sm">
                    Get unlimited URLs, advanced analytics, and priority support for just $9.99/month
                  </p>
                </div>
                <Button
                  onClick={handleUpgradePlan}
                  disabled={isLoading}
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // User is not logged in - show enhanced login/register form
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
      <CardHeader className="relative">
        <CardTitle className="text-center">Join SNR.red</CardTitle>
        <CardDescription className="text-center">
          Create an account to manage your URLs and unlock premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Choose a strong password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Benefits Preview */}
        <div className="mt-6 bg-white/50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Why Join SNR.red?
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Manage all your URLs in one place</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Track clicks and analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Generate QR codes instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Premium features available</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
