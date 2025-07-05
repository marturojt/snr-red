'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Database,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Server,
  Users,
  Link
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [cleanupRunning, setCleanupRunning] = useState(false);

  const handleManualCleanup = async () => {
    if (!confirm('Are you sure you want to run manual cleanup? This will remove expired URLs.')) {
      return;
    }

    setCleanupRunning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to run cleanup');
      }

      const result = await response.json();
      toast.success(`Cleanup completed! Removed ${result.data.deletedCount} expired URLs`);
    } catch (error) {
      toast.error('Failed to run cleanup');
      console.error('Cleanup error:', error);
    } finally {
      setCleanupRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">System configuration and maintenance</p>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">API Server</div>
                <div className="text-xs text-gray-500">Running</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Database</div>
                <div className="text-xs text-gray-500">Connected</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Cleanup Service</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Cleanup Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Anonymous URL Expiration</Label>
                <Input value="30 days" disabled />
                <p className="text-xs text-gray-500">URLs from anonymous users expire after 30 days</p>
              </div>
              <div className="space-y-2">
                <Label>Free User URL Expiration</Label>
                <Input value="3 months" disabled />
                <p className="text-xs text-gray-500">URLs from free users expire after 3 months</p>
              </div>
              <div className="space-y-2">
                <Label>Premium User URL Expiration</Label>
                <Input value="Never (with activity)" disabled />
                <p className="text-xs text-gray-500">URLs from premium users never expire if accessed</p>
              </div>
              <div className="space-y-2">
                <Label>Cleanup Schedule</Label>
                <Input value="Every 4 hours" disabled />
                <p className="text-xs text-gray-500">Automatic cleanup runs every 4 hours</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleManualCleanup}
                disabled={cleanupRunning}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${cleanupRunning ? 'animate-spin' : ''}`} />
                {cleanupRunning ? 'Running Cleanup...' : 'Run Manual Cleanup'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Manually trigger cleanup to remove expired URLs immediately
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            URL Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Short Code Length</Label>
                <Input value="6 characters" disabled />
                <p className="text-xs text-gray-500">Default length for generated short codes</p>
              </div>
              <div className="space-y-2">
                <Label>Custom Code Max Length</Label>
                <Input value="50 characters" disabled />
                <p className="text-xs text-gray-500">Maximum length for custom short codes</p>
              </div>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input value="https://snr.red" disabled />
                <p className="text-xs text-gray-500">Base URL for shortened links</p>
              </div>
              <div className="space-y-2">
                <Label>QR Code Size</Label>
                <Input value="256x256 pixels" disabled />
                <p className="text-xs text-gray-500">Default QR code image size</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration</Label>
                <Badge variant="default">Enabled</Badge>
                <p className="text-xs text-gray-500">Users can create new accounts</p>
              </div>
              <div className="space-y-2">
                <Label>Email Verification</Label>
                <Badge variant="secondary">Disabled</Badge>
                <p className="text-xs text-gray-500">Email verification is not required</p>
              </div>
              <div className="space-y-2">
                <Label>Default Plan</Label>
                <Badge variant="secondary">Free</Badge>
                <p className="text-xs text-gray-500">New users start with free plan</p>
              </div>
              <div className="space-y-2">
                <Label>Premium Features</Label>
                <Badge variant="default">Enabled</Badge>
                <p className="text-xs text-gray-500">Premium plan features are active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Database Type</Label>
                <Badge variant="outline">MongoDB</Badge>
                <p className="text-xs text-gray-500">Document-based database</p>
              </div>
              <div className="space-y-2">
                <Label>Connection Status</Label>
                <Badge variant="default">Connected</Badge>
                <p className="text-xs text-gray-500">Database is responding</p>
              </div>
              <div className="space-y-2">
                <Label>Backup Schedule</Label>
                <Badge variant="outline">Daily</Badge>
                <p className="text-xs text-gray-500">Automated backups every day</p>
              </div>
              <div className="space-y-2">
                <Label>Indexes</Label>
                <Badge variant="default">Optimized</Badge>
                <p className="text-xs text-gray-500">Database indexes are configured</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Configuration changes require server restart to take effect</p>
            <p>• Manual cleanup operations cannot be undone</p>
            <p>• System settings are configured via environment variables</p>
            <p>• Database backups are handled by your hosting provider</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
