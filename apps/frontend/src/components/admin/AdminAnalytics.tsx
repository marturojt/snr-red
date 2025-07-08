'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Users,
  Link,
  Globe
} from 'lucide-react';

interface AnalyticsData {
  totalUrls: number;
  activeUrls: number;
  expiredUrls: number;
  urlsToday: number;
  urlsThisWeek: number;
  urlsThisMonth: number;
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  premiumUsers: number;
  usersToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
  totalClicks: number;
  topUrls: Array<{
    _id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    registeredUserId?: {
      email: string;
      name: string;
    };
  }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setAnalytics(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Error Loading Analytics</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const urlGrowthRate = analytics.urlsThisMonth > 0 ? 
    ((analytics.urlsThisWeek / analytics.urlsThisMonth) * 100).toFixed(1) : 0;
  
  const userGrowthRate = analytics.usersThisMonth > 0 ? 
    ((analytics.usersThisWeek / analytics.usersThisMonth) * 100).toFixed(1) : 0;

  const premiumConversionRate = analytics.totalUsers > 0 ? 
    ((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1) : 0;

  const avgClicksPerUrl = analytics.totalUrls > 0 ? 
    (analytics.totalClicks / analytics.totalUrls).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {avgClicksPerUrl} avg per URL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumConversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.premiumUsers} of {analytics.totalUsers} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">URL Growth Rate</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urlGrowthRate}%</div>
            <p className="text-xs text-muted-foreground">
              Weekly vs Monthly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGrowthRate}%</div>
            <p className="text-xs text-muted-foreground">
              Weekly vs Monthly
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              URL Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total URLs</span>
                <Badge variant="outline">{analytics.totalUrls.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active URLs</span>
                <Badge variant="default">{analytics.activeUrls.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expired URLs</span>
                <Badge variant="destructive">{analytics.expiredUrls.toLocaleString()}</Badge>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Today</span>
                  <Badge variant="outline">{analytics.urlsToday}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">This Week</span>
                  <Badge variant="outline">{analytics.urlsThisWeek}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">This Month</span>
                  <Badge variant="outline">{analytics.urlsThisMonth}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Users</span>
                <Badge variant="outline">{analytics.totalUsers.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <Badge variant="default">{analytics.activeUsers.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Free Users</span>
                <Badge variant="secondary">{analytics.freeUsers.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Premium Users</span>
                <Badge variant="default">{analytics.premiumUsers.toLocaleString()}</Badge>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Today</span>
                  <Badge variant="outline">{analytics.usersToday}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">This Week</span>
                  <Badge variant="outline">{analytics.usersThisWeek}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">This Month</span>
                  <Badge variant="outline">{analytics.usersThisMonth}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Top Performing URLs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topUrls.length > 0 ? (
              analytics.topUrls.map((url, index) => (
                <div key={url._id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-800">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {url.originalUrl}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        /{url.shortCode}
                        {url.registeredUserId && (
                          <span className="ml-2">• {url.registeredUserId.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">
                      {url.clicks.toLocaleString()} clicks
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No URLs with clicks yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {((analytics.activeUrls / analytics.totalUrls) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">URL Active Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">User Active Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.totalUrls > 0 ? (analytics.totalClicks / analytics.totalUrls).toFixed(1) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Clicks per URL</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
