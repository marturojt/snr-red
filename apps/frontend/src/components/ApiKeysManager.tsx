'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react';
import { keysApi } from '@/lib/api';
import type { ApiKey } from '@url-shortener/types';

export default function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = async () => {
    try {
      setLoading(true);
      const data = await keysApi.list();
      setKeys(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name for the key');
      return;
    }
    setCreating(true);
    try {
      const created = await keysApi.create(newName.trim());
      setCreatedToken(created.token);
      setNewName('');
      await loadKeys();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Revoke this API key? Any project using it will stop working immediately.')) {
      return;
    }
    try {
      await keysApi.revoke(id);
      toast.success('API key revoked');
      await loadKeys();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke API key');
    }
  };

  const copyToken = async () => {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeCreateDialog = () => {
    setCreateOpen(false);
    setCreatedToken(null);
    setNewName('');
    setCopied(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Use API keys to create and manage short URLs from your own projects via the{' '}
              <code className="text-xs">/api/v1</code> endpoints. Send the key in the{' '}
              <code className="text-xs">X-API-Key</code> header.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No API keys yet. Create one to start using the API from your projects.
          </p>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{k.name}</span>
                    {k.revoked && <Badge variant="destructive">Revoked</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{k.keyPrefix}…</div>
                  <div className="text-xs text-muted-foreground">
                    {k.scopes.join(', ')}
                    {k.lastUsedAt
                      ? ` · last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                      : ' · never used'}
                  </div>
                </div>
                {!k.revoked && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(k.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={(open) => (open ? setCreateOpen(true) : closeCreateDialog())}>
        <DialogContent>
          {createdToken ? (
            <>
              <DialogHeader>
                <DialogTitle>API key created</DialogTitle>
                <DialogDescription>
                  Copy this token now — for security it will not be shown again.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                <code className="text-xs break-all flex-1">{createdToken}</code>
                <Button variant="outline" size="sm" onClick={copyToken}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={closeCreateDialog}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>
                  Give the key a name so you can recognize which project uses it.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="e.g. my-blog-backend"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <DialogFooter>
                <Button variant="outline" onClick={closeCreateDialog}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
