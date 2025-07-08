import Image from 'next/image';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  QrCode, 
  Download, 
  Copy, 
  RefreshCw, 
  Sparkles,
  Share2,
  Zap,
  Check,
  ExternalLink
} from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { qrApi } from '@/lib/api';

interface QRCodeDisplayProps {
  url: string;
  qrCodeDataUrl?: string | null;
  qrCodeUrl?: string;
}

export default function EnhancedQRCodeDisplay({ url, qrCodeDataUrl }: Omit<QRCodeDisplayProps, 'qrCodeUrl'>) {
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string | null>(qrCodeDataUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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
      toast.success('🎉 QR code generated successfully!');
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

  const handleCopy = async () => {
    if (!localQrDataUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(localQrDataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setCopied(true);
      toast.success('QR code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback to copying URL
      await copyToClipboard(url);
      toast.success('URL copied to clipboard!');
    }
  };

  const shareQrCode = async () => {
    if (!localQrDataUrl) return;
    
    try {
      const response = await fetch(localQrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for ${url}`,
          files: [file]
        });
        toast.success('QR code shared!');
      } else {
        // Fallback - copy URL
        await copyToClipboard(url);
        toast.success('URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share QR code');
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-purple-600" />
          QR Code Generator
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </CardTitle>
        <CardDescription>
          Generate a QR code for your shortened URL to share easily
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* URL Display */}
        <div className="bg-white/70 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              TARGET URL
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-purple-700 truncate">
              {url}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(url, '_blank')}
              className="hover:bg-purple-50 hover:text-purple-600"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* QR Code Display */}
        {localQrDataUrl ? (
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-xl opacity-20"></div>
              <div className="relative bg-white p-4 rounded-lg shadow-lg">
                <Image 
                  src={localQrDataUrl} 
                  alt="QR Code" 
                  width={256}
                  height={256}
                  className="mx-auto"
                />
              </div>
            </div>
            
            <div className="flex justify-center gap-2 flex-wrap">
              <Button
                onClick={downloadQrCode}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              
              <Button
                onClick={handleCopy}
                variant="outline"
                className="hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
              
              <Button
                onClick={shareQrCode}
                variant="outline"
                className="hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              
              <Button
                onClick={generateQrCode}
                disabled={isGenerating}
                variant="ghost"
                className="hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20"></div>
              <QrCode className="relative w-16 h-16 text-purple-600 mx-auto mb-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generate QR Code
              </h3>
              <p className="text-gray-600 mb-6">
                Create a scannable QR code for your shortened URL
              </p>
              <Button
                onClick={generateQrCode}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </div>
          </div>
        )}

        {/* QR Code Info */}
        <div className="bg-white/70 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            QR Code Benefits
          </h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Scan with any smartphone camera</li>
            <li>• Perfect for print materials and presentations</li>
            <li>• High-quality PNG format</li>
            <li>• Error correction for reliable scanning</li>
            <li>• Customizable size and format</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
