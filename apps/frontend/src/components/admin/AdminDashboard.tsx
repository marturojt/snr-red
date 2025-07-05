'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Link, 
  BarChart3, 
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  urls: {
    total: number;
    active: number;
    expired: number;
    today: number;
    week: number;
    month: number;
  };
  users: {
    total: number;
    active: number;
    free: number;
    premium: number;
    today: number;
    week: number;
    month: number;
  };
  clicks: {
    total: number;
  };
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const result = await response.json();
      setStats({
        urls: {
          total: result.data.totalUrls,
          active: result.data.activeUrls,
          expired: result.data.expiredUrls,
          today: result.data.urlsToday,
          week: result.data.urlsThisWeek,
          month: result.data.urlsThisMonth
        },
        users: {
          total: result.data.totalUsers,
          active: result.data.activeUsers,
          free: result.data.freeUsers,
          premium: result.data.premiumUsers,
          today: result.data.usersToday,
          week: result.data.usersThisWeek,
          month: result.data.usersThisMonth
        },
        clicks: {
          total: result.data.totalClicks
        },
        topUrls: result.data.topUrls
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to SNR.red Admin Panel</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total URLs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urls.total.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Active: {stats.urls.active}</span>
              <span>•</span>
              <span>Expired: {stats.urls.expired}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Free: {stats.users.free}</span>
              <span>•</span>
              <span>Premium: {stats.users.premium}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Clicks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicks.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time clicks</p>
          </CardContent>
        </Card>

        {/* Growth Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.urls.today + stats.users.today}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>URLs: {stats.urls.today}</span>
              <span>•</span>
              <span>Users: {stats.users.today}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* URLs Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              URL Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Today</span>
                <Badge variant="outline">{stats.urls.today}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Week</span>
                <Badge variant="outline">{stats.urls.week}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Month</span>
                <Badge variant="outline">{stats.urls.month}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Today</span>
                <Badge variant="outline">{stats.users.today}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Week</span>
                <Badge variant="outline">{stats.users.week}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Month</span>
                <Badge variant="outline">{stats.users.month}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top URLs by Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topUrls.length > 0 ? (
              stats.topUrls.map((url, index) => (
                <div key={url._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-800">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {url.originalUrl}
                      </div>
                      <div className="text-xs text-gray-500">
                        /{url.shortCode}
                        {url.registeredUserId && (
                          <span className="ml-2">• {url.registeredUserId.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {url.clicks.toLocaleString()} clicks
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No URLs with clicks yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
