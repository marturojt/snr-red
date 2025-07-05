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
  Mail, 
  Crown,
  LogOut,
  UserPlus,
  LogIn,
  Settings
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
  isAdmin?: boolean; // Make optional for backward compatibility
}

interface AuthComponentProps {
  user: User | null;
  onAuthChange: (user: User | null) => void;
}

export default function AuthComponent({ user, onAuthChange }: AuthComponentProps) {
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
      toast.success('Login successful!');
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
      toast.success('Registration successful!');
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
      toast.success('Plan upgraded to Premium!');
    } catch (error) {
      console.error('Plan upgrade error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    // User is logged in - show user profile
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Manage your account and subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
              </div>
              <span className="font-medium">{user.email}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Name:</span>
              </div>
              <span className="font-medium">{user.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Plan:</span>
              </div>
              <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                {user.plan === 'premium' ? 'Premium' : 'Free'}
              </Badge>
            </div>
            
            {user.lastLoginAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last login:</span>
                <span className="text-sm text-gray-800">
                  {new Date(user.lastLoginAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Plan Benefits */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Plan Benefits:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {user.plan === 'free' ? (
                <>
                  <li>• URLs expire after 3 months</li>
                  <li>• URLs deleted after 1 month of inactivity</li>
                  <li>• Basic analytics</li>
                </>
              ) : (
                <>
                  <li>• URLs never expire (with activity)</li>
                  <li>• URLs deleted only after 1 year of inactivity</li>
                  <li>• Advanced analytics</li>
                  <li>• Premium support</li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {user.isAdmin && (
              <Button
                onClick={() => window.location.href = '/admin'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Button>
            )}
            
            {user.plan === 'free' && (
              <Button
                onClick={handleUpgradePlan}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User is not logged in - show login/register form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Account
        </CardTitle>
        <CardDescription>
          Login or create an account to manage your URLs permanently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
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
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Your full name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                  required
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
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  minLength={6}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Plan</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={registerForm.plan === 'free' ? 'default' : 'outline'}
                    onClick={() => setRegisterForm(prev => ({ ...prev, plan: 'free' }))}
                    className="justify-start"
                  >
                    Free Plan
                  </Button>
                  <Button
                    type="button"
                    variant={registerForm.plan === 'premium' ? 'default' : 'outline'}
                    onClick={() => setRegisterForm(prev => ({ ...prev, plan: 'premium' }))}
                    className="justify-start"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    Premium
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
