'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Monitor, 
  RefreshCw,
  Calendar,
  MousePointer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { formatNumber, formatDate } from '@/lib/utils';

interface UrlStatsResponse {
  url: {
    id: string;
    originalUrl: string;
    shortCode: string;
    shortUrl: string;
    createdAt: Date;
    title?: string;
  };
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: Array<{ date: string; clicks: number }>;
  clicksByCountry: Array<{ country: string; clicks: number }>;
  clicksByDevice: Array<{ device: string; clicks: number }>;
  clicksByBrowser: Array<{ browser: string; clicks: number }>;
}

interface AnalyticsDashboardProps {
  urlId: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];

export default function AnalyticsDashboard({ urlId }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<UrlStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (showRefreshMessage = false) => {
    try {
      if (showRefreshMessage) setRefreshing(true);
      const data = await analyticsApi.getStats(urlId);
      setStats(data);
      if (showRefreshMessage) {
        toast.success('Analytics refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      if (showRefreshMessage) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [urlId]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Track performance and engagement for your shortened URL
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Clicks */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MousePointer className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700">
                {formatNumber(stats.totalClicks)}
              </div>
              <div className="text-sm text-blue-600">Total Clicks</div>
            </div>

            {/* Unique Clicks */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-700">
                {formatNumber(stats.uniqueClicks)}
              </div>
              <div className="text-sm text-green-600">Unique Visitors</div>
            </div>

            {/* Countries */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-700">
                {stats.clicksByCountry.length}
              </div>
              <div className="text-sm text-purple-600">Countries</div>
            </div>

            {/* Devices */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Monitor className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-700">
                {stats.clicksByDevice.length}
              </div>
              <div className="text-sm text-orange-600">Device Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Info */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            URL Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">Short URL:</span>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all">
              {stats.url.shortUrl}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Original URL:</span>
            <p className="text-sm bg-gray-100 p-2 rounded mt-1 break-all">
              {stats.url.originalUrl}
            </p>
          </div>
          {stats.url.title && (
            <div>
              <span className="text-sm font-medium text-gray-600">Title:</span>
              <p className="text-sm mt-1">{stats.url.title}</p>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-600">Created:</span>
            <p className="text-sm mt-1">{formatDate(stats.url.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks Over Time */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Clicks Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clicksByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.clicksByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [value, 'Clicks']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No click data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clicksByDevice.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.clicksByDevice}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ device, clicks }) => `${device}: ${clicks}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="clicks"
                  >
                    {stats.clicksByDevice.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No device data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clicksByCountry.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.clicksByCountry.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No country data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Browsers */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Top Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clicksByBrowser.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.clicksByBrowser.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="browser" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No browser data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
