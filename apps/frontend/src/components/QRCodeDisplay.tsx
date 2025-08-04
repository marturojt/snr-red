'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { qrApi } from '@/lib/api';

interface QRCodeDisplayProps {
  url: string;
  qrCodeDataUrl?: string | null;
  qrCodeUrl?: string;
}

export default function QRCodeDisplay({ url, qrCodeDataUrl, qrCodeUrl }: QRCodeDisplayProps) {
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string | null>(qrCodeDataUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (qrCodeDataUrl) {
      setLocalQrDataUrl(qrCodeDataUrl);
    }
  }, [qrCodeDataUrl]);

  const generateQrCode = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await qrApi.generateDataUrl(url, {
        size: 300,
        format: 'png',
        errorCorrectionLevel: 'M'
      });
      setLocalQrDataUrl(dataUrl);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQrCode = () => {
    if (!localQrDataUrl) return;

    const link = document.createElement('a');
    link.href = localQrDataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const copyQrCode = async () => {
    if (!localQrDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(localQrDataUrl);
      const blob = await response.blob();
      
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        toast.success('QR code copied to clipboard!');
      } else {
        // Fallback: copy the data URL as text
        await copyToClipboard(localQrDataUrl);
        toast.success('QR code data URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error copying QR code:', error);
      toast.error('Failed to copy QR code');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code
        </CardTitle>
        <CardDescription>
          Scan this QR code to quickly access your shortened URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {localQrDataUrl ? (
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="p-4 bg-background border-2 border-border rounded-lg shadow-sm">
                <img
                  src={localQrDataUrl}
                  alt="QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                onClick={downloadQrCode}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={copyQrCode}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={generateQrCode}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Regenerate
              </Button>
            </div>

            {/* URL Display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Encoded URL:</p>
              <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                {url}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="py-12">
              <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No QR code generated</p>
              <Button
                onClick={generateQrCode}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <QrCode className="w-4 h-4" />
                )}
                Generate QR Code
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
