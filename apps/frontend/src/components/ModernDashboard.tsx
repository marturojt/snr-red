'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Link, 
  QrCode, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  Plus,
  TrendingUp,
  Crown,
  Shield,
  Eye
} from 'lucide-react';
import { authApi } from '@/lib/api';
import EnhancedUserUrls from './EnhancedUserUrls';
import EnhancedAuthComponent from './EnhancedAuthComponent';

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

interface DashboardProps {
  user: User;
  onBack: () => void;
  onUserUpdate: (user: User | null) => void;
}

export default function ModernDashboard({ user, onBack, onUserUpdate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    authApi.logout();
    onUserUpdate(null);
    toast.success('Logged out successfully');
  };

  const handlePlanUpgrade = () => {
    toast.info('Plan upgrade coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SNR.red</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                  {user.plan === 'premium' ? (
                    <Crown className="w-3 h-3 mr-1" />
                  ) : null}
                  {user.plan.toUpperCase()}
                </Badge>
              </div>
              {user.isAdmin && (
                <Button 
                  onClick={() => window.location.href = '/admin'} 
                  size="sm" 
                  variant="outline"
                >
                  Admin Panel
                </Button>
              )}
              <Button onClick={handleLogout} size="sm" variant="ghost">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600">
                  Manage your URLs, view analytics, and grow your reach
                </p>
              </div>
              {user.plan === 'free' && (
                <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">Upgrade to Premium</h3>
                        <p className="text-sm text-purple-100">
                          Unlock unlimited URLs and advanced features
                        </p>
                      </div>
                      <Button 
                        onClick={handlePlanUpgrade} 
                        className="bg-white text-purple-600 hover:bg-purple-50"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total URLs</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                    <Link className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Clicks</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">QR Codes</p>
                    <p className="text-2xl font-bold">18</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold">+89%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="urls" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                My URLs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Link className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Created new URL</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <Badge variant="secondary">+12 clicks</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <QrCode className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">QR Code generated</p>
                            <p className="text-xs text-gray-500">1 day ago</p>
                          </div>
                        </div>
                        <Badge variant="secondary">+5 scans</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Analytics milestone</p>
                            <p className="text-xs text-gray-500">3 days ago</p>
                          </div>
                        </div>
                        <Badge variant="secondary">1K clicks</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Plan</span>
                        <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                          {user.plan === 'premium' ? (
                            <Crown className="w-3 h-3 mr-1" />
                          ) : null}
                          {user.plan.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">URLs this month</span>
                        <span className="text-sm text-gray-600">
                          {user.plan === 'premium' ? 'Unlimited' : '12/100'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Member since</span>
                        <span className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {user.plan === 'free' && (
                        <Button 
                          onClick={handlePlanUpgrade} 
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* URLs Tab */}
            <TabsContent value="urls" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your URLs</CardTitle>
                      <CardDescription>
                        Manage and track your shortened URLs
                      </CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New URL
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <EnhancedUserUrls user={user} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription>
                    Detailed insights into your URL performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a URL to view analytics
                    </h3>
                    <p className="text-gray-600">
                      Choose a URL from your list to see detailed performance metrics
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EnhancedAuthComponent 
                      user={user} 
                      onAuthChange={onUserUpdate} 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">API Keys</p>
                          <p className="text-sm text-gray-600">Manage your API access</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Export Data</p>
                          <p className="text-sm text-gray-600">Download your account data</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
