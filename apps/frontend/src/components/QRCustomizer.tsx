'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Square, 
  Circle, 
  Sparkles, 
  Download, 
  Eye, 
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface QRCustomizerProps {
  url: string;
  onGenerate: (options: QROptions) => void;
  onClose: () => void;
  embedded?: boolean;
  onGenerateComplete?: () => void; // New prop for embedded mode
}

export interface QROptions {
  size: number;
  format: 'png' | 'svg' | 'jpeg' | 'webp';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  style: 'square' | 'rounded' | 'dots' | 'circles';
  logoUrl?: string;
  logoSize?: number;
}

const QR_PRESETS = {
  classic: {
    color: { dark: '#000000', light: '#FFFFFF' },
    style: 'square' as const,
    name: 'Classic',
    description: 'Traditional black and white QR code'
  },
  modern: {
    color: { dark: '#1f2937', light: '#f8fafc' },
    style: 'rounded' as const,
    name: 'Modern',
    description: 'Rounded corners for a modern look'
  },
  vibrant: {
    color: { dark: '#3b82f6', light: '#ffffff' },
    style: 'dots' as const,
    name: 'Vibrant',
    description: 'Blue dots for a vibrant feel'
  },
  elegant: {
    color: { dark: '#6366f1', light: '#f1f5f9' },
    style: 'rounded' as const,
    name: 'Elegant',
    description: 'Purple theme with rounded style'
  },
  nature: {
    color: { dark: '#059669', light: '#f0fdf4' },
    style: 'square' as const,
    name: 'Nature',
    description: 'Green inspired by nature'
  },
  sunset: {
    color: { dark: '#dc2626', light: '#fef2f2' },
    style: 'circles' as const,
    name: 'Sunset',
    description: 'Warm red with circular patterns'
  },
  professional: {
    color: { dark: '#374151', light: '#f9fafb' },
    style: 'square' as const,
    name: 'Professional',
    description: 'Business-friendly gray theme'
  },
  ocean: {
    color: { dark: '#0891b2', light: '#f0f9ff' },
    style: 'dots' as const,
    name: 'Ocean',
    description: 'Cool blue ocean vibes'
  }
};

export default function QRCustomizer({ url, onGenerate, onClose, embedded = false, onGenerateComplete }: QRCustomizerProps) {
  const { t } = useLanguage();
  const [options, setOptions] = useState<QROptions>({
    size: 300,
    format: 'png',
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    style: 'square'
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('classic');
  const [isGenerating, setIsGenerating] = useState(false);

  // Demo preview function - generates SVG demo without API calls
  const generateDemoPreview = () => {
    const { color, style, size: previewSize = 120 } = options;
    
    const modules = 21;
    const moduleSize = previewSize / modules;
    const { dark, light } = color;
    
    // Create a demo pattern (simplified QR structure)
    const demoPattern = Array(modules).fill(null).map((_, row) => 
      Array(modules).fill(null).map((_, col) => {
        // Create finder patterns (corners)
        if ((row < 7 && col < 7) || (row < 7 && col >= modules - 7) || (row >= modules - 7 && col < 7)) {
          return (row === 0 || row === 6 || col === 0 || col === 6) ||
                 (row >= 2 && row <= 4 && col >= 2 && col <= 4);
        }
        
        // Create some random pattern for demo
        return Math.random() > 0.5;
      })
    );
    
    const svgElements = demoPattern.map((row, rowIndex) =>
      row.map((filled, colIndex) => {
        if (!filled) return null;
        
        const x = colIndex * moduleSize;
        const y = rowIndex * moduleSize;
        
        if (style === 'rounded') {
          return `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${moduleSize * 0.2}" fill="${dark}"/>`;
        } else if (style === 'dots') {
          const centerX = x + moduleSize / 2;
          const centerY = y + moduleSize / 2;
          const radius = moduleSize * 0.4;
          return `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${dark}"/>`;
        } else if (style === 'circles') {
          const centerX = x + moduleSize / 2;
          const centerY = y + moduleSize / 2;
          const radius = moduleSize * 0.3;
          return `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${dark}"/>`;
        } else {
          return `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${dark}"/>`;
        }
      }).filter(Boolean).join('')
    ).join('');
    
    const svgContent = `
      <svg width="${previewSize}" height="${previewSize}" viewBox="0 0 ${previewSize} ${previewSize}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${light}"/>
        ${svgElements}
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(options);
      // Call onGenerateComplete if in embedded mode
      if (embedded && onGenerateComplete) {
        onGenerateComplete();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresetChange = (presetKey: string) => {
    const preset = QR_PRESETS[presetKey as keyof typeof QR_PRESETS];
    if (preset) {
      setSelectedPreset(presetKey);
      setOptions(prev => ({
        ...prev,
        color: preset.color,
        style: preset.style
      }));
    }
  };

  const handleCustomColorChange = (colorType: 'dark' | 'light', value: string) => {
    setSelectedPreset('custom');
    setOptions(prev => ({
      ...prev,
      color: {
        ...prev.color,
        [colorType]: value
      }
    }));
  };

  return (
    <div className={embedded ? "w-full" : "w-full max-w-2xl mx-auto"}>
      {/* Header */}
      {!embedded && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {t('qrCustomizer.title')}
          </CardTitle>
          <CardDescription>
            {t('qrCustomizer.description')}
          </CardDescription>
        </CardHeader>
      )}
      {embedded && (
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">{t('qrCustomizer.title')}</h3>
          <p className="text-sm text-gray-600">{t('qrCustomizer.description')}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('qrCustomizer.presets')}
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {t('qrCustomizer.colors')}
          </TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {Object.entries(QR_PRESETS).map(([key, preset]) => (
              <div
                key={key}
                className={`cursor-pointer transition-all border-2 rounded-lg p-3 text-center hover:shadow-md ${
                  selectedPreset === key 
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePresetChange(key)}
              >
                <div 
                  className="w-12 h-12 mx-auto mb-2 rounded-md flex items-center justify-center shadow-sm"
                  style={{ 
                    backgroundColor: preset.color.light,
                    border: `2px solid ${preset.color.dark}20`
                  }}
                >
                  <div 
                    className={`w-6 h-6 ${
                      preset.style === 'rounded' ? 'rounded-md' : 
                      preset.style === 'dots' ? 'rounded-full' : 
                      preset.style === 'circles' ? 'rounded-full' : 'rounded-sm'
                    }`}
                    style={{ backgroundColor: preset.color.dark }}
                  />
                </div>
                <h3 className="font-medium text-xs mb-1">{preset.name}</h3>
                {selectedPreset === key && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Show description for selected preset */}
          {selectedPreset && QR_PRESETS[selectedPreset as keyof typeof QR_PRESETS] && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                {QR_PRESETS[selectedPreset as keyof typeof QR_PRESETS].description}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dark-color">{t('qrCustomizer.foregroundColor')}</Label>
              <div className="flex gap-2">
                <input
                  id="dark-color"
                  type="color"
                  value={options.color.dark}
                  onChange={(e) => handleCustomColorChange('dark', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={options.color.dark}
                  onChange={(e) => handleCustomColorChange('dark', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="light-color">{t('qrCustomizer.backgroundColor')}</Label>
              <div className="flex gap-2">
                <input
                  id="light-color"
                  type="color"
                  value={options.color.light}
                  onChange={(e) => handleCustomColorChange('light', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={options.color.light}
                  onChange={(e) => handleCustomColorChange('light', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('qrCustomizer.style')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'square', icon: Square, label: t('qrCustomizer.square') },
                { value: 'rounded', icon: Circle, label: t('qrCustomizer.rounded') },
                { value: 'dots', icon: Sparkles, label: t('qrCustomizer.dots') },
                { value: 'circles', icon: Circle, label: 'Circles' }
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={options.style === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedPreset('custom');
                    setOptions(prev => ({ ...prev, style: value as QROptions['style'] }));
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-4 h-4" />
            {t('qrCustomizer.preview')}
          </CardTitle>
          <CardDescription>
            {t('qrCustomizer.previewDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div 
              className="inline-block p-6 rounded-xl shadow-lg transition-all duration-300"
              style={{ backgroundColor: options.color.light }}
            >
              <div className="relative">
                <Image 
                  src={generateDemoPreview()} 
                  alt="QR Code Demo Preview"
                  width={120}
                  height={120}
                  className="w-32 h-32 mx-auto rounded-lg"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  DEMO
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 break-all font-mono bg-gray-100 px-3 py-2 rounded">
                {url}
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>{options.size}×{options.size}px</span>
                <span>{options.format.toUpperCase()}</span>
                <span>Margin: {options.margin}px</span>
                <Badge variant="outline" className="text-xs">
                  {options.errorCorrectionLevel} ({
                    options.errorCorrectionLevel === 'L' ? '7%' :
                    options.errorCorrectionLevel === 'M' ? '15%' :
                    options.errorCorrectionLevel === 'Q' ? '25%' : '30%'
                  })
                </Badge>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                📋 {t('qrCustomizer.demoNote')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {!embedded && (
          <Button onClick={onClose} variant="outline" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
        )}
        <Button 
          onClick={handleGenerate} 
          className={`${embedded ? 'w-full' : 'flex-2'} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
          disabled={isGenerating}
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? t('generating') : t('qrCustomizer.generate')}
        </Button>
      </div>
    </div>
  );
}
