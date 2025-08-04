'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Link, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  userType: 'anonymous' | 'free' | 'premium';
  isActive: boolean;
  createdAt: string;
  lastAccessedAt?: string;
  autoExpiresAt?: string;
  registeredUserId?: {
    _id: string;
    email: string;
    name: string;
  };
}

interface UrlDetailsProps {
  url: Url;
  onUpdate: (url: Url) => void;
  onDelete: (urlId: string) => void;
}

function UrlDetails({ url, onUpdate, onDelete }: UrlDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(url.isActive);
  const [expiresAt, setExpiresAt] = useState(
    url.autoExpiresAt ? new Date(url.autoExpiresAt).toISOString().split('T')[0] : ''
  );

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/urls/${url._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          isActive, 
          ...(expiresAt && { autoExpiresAt: expiresAt })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update URL');
      }

      const result = await response.json();
      onUpdate(result.data);
    } catch (error) {
      console.error('Error updating URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/urls/${url._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }

      onDelete(url._id);
    } catch (error) {
      console.error('Error deleting URL:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Original URL
          </label>
          <div className="flex items-center space-x-2">
            <Input value={url.originalUrl} disabled className="flex-1" />
            <Button variant="outline" size="sm" asChild>
              <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Short Code
          </label>
          <Input value={url.shortCode} disabled />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              User Type
            </label>
            <Input value={url.userType} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Clicks
            </label>
            <Input value={url.clicks.toString()} disabled />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <Select value={isActive ? 'active' : 'inactive'} onValueChange={(value) => setIsActive(value === 'active')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Expires At
            </label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
      </div>

      {url.registeredUserId && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Owner
          </label>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium text-foreground">{url.registeredUserId.name}</div>
            <div className="text-sm text-muted-foreground">{url.registeredUserId.email}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Created At
          </label>
          <Input value={new Date(url.createdAt).toLocaleString()} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Last Accessed
          </label>
          <Input value={url.lastAccessedAt ? new Date(url.lastAccessedAt).toLocaleString() : 'Never'} disabled />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete URL
        </Button>
        <Button onClick={handleUpdate} disabled={loading}>
          <Edit className="h-4 w-4 mr-2" />
          Update URL
        </Button>
      </div>
    </div>
  );
}

export default function UrlManagement() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUrl, setSelectedUrl] = useState<Url | null>(null);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(filter !== 'all' && { filter })
      });

      const response = await fetch(`/api/admin/urls?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }

      const result = await response.json();
      setUrls(result.data.urls);
      setTotalPages(result.data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlUpdate = (updatedUrl: Url) => {
    setUrls(urls.map(u => u._id === updatedUrl._id ? updatedUrl : u));
    setSelectedUrl(null);
  };

  const handleUrlDelete = (urlId: string) => {
    setUrls(urls.filter(u => u._id !== urlId));
    setSelectedUrl(null);
  };

  useEffect(() => {
    fetchUrls();
  }, [page, search, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  if (loading && urls.length === 0) {
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
          <h2 className="text-lg font-semibold text-foreground mb-2">Error Loading URLs</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchUrls}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">URL Management</h1>
          <p className="text-muted-foreground">Manage shortened URLs and their settings</p>
        </div>
        <Button onClick={fetchUrls} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by URL or short code..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All URLs</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URLs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            URLs ({urls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">URL</th>
                  <th className="text-left py-2 px-4">Short Code</th>
                  <th className="text-left py-2 px-4">User Type</th>
                  <th className="text-left py-2 px-4">Clicks</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Created</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url._id} className="border-b hover:bg-muted">
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-foreground truncate">{url.originalUrl}</div>
                        {url.registeredUserId && (
                          <div className="text-sm text-muted-foreground">{url.registeredUserId.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        /{url.shortCode}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={url.userType === 'premium' ? 'default' : 'secondary'}>
                        {url.userType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {url.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={url.isActive ? 'default' : 'destructive'}>
                        {url.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUrl(url)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>URL Details</DialogTitle>
                          </DialogHeader>
                          {selectedUrl && (
                            <UrlDetails
                              url={selectedUrl}
                              onUpdate={handleUrlUpdate}
                              onDelete={handleUrlDelete}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
