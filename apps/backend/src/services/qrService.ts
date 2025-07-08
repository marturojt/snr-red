import QRCode from 'qrcode';
import { QrCodeOptions } from '@url-shortener/types';
import * as fs from 'fs';
import * as path from 'path';

export class QrService {
  private static uploadsDir = path.join(process.cwd(), 'uploads', 'qr');

  private static applyStyleToSvg(svgString: string, style: string, color: { dark?: string; light?: string }): string {
    if (!style || style === 'square') {
      return svgString;
    }

    const darkColor = color.dark || '#000000';
    const lightColor = color.light || '#FFFFFF';

    // Parse the SVG to apply custom styles
    let modifiedSvg = svgString;

    // Replace rectangles based on style
    if (style === 'rounded') {
      // Add rounded corners to rectangles
      modifiedSvg = modifiedSvg.replace(
        /<rect([^>]*?)\/>/g, 
        '<rect$1 rx="0.5" ry="0.5"/>'
      );
    } else if (style === 'dots') {
      // Convert rectangles to circles
      modifiedSvg = modifiedSvg.replace(
        /<rect\s+x="([^"]*?)"\s+y="([^"]*?)"\s+width="([^"]*?)"\s+height="([^"]*?)"[^>]*?\/>/g,
        (match, x, y, width, height) => {
          const cx = parseFloat(x) + parseFloat(width) / 2;
          const cy = parseFloat(y) + parseFloat(height) / 2;
          const r = Math.min(parseFloat(width), parseFloat(height)) * 0.4;
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${darkColor}"/>`;
        }
      );
    } else if (style === 'circles') {
      // Convert rectangles to smaller circles
      modifiedSvg = modifiedSvg.replace(
        /<rect\s+x="([^"]*?)"\s+y="([^"]*?)"\s+width="([^"]*?)"\s+height="([^"]*?)"[^>]*?\/>/g,
        (match, x, y, width, height) => {
          const cx = parseFloat(x) + parseFloat(width) / 2;
          const cy = parseFloat(y) + parseFloat(height) / 2;
          const r = Math.min(parseFloat(width), parseFloat(height)) * 0.3;
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${darkColor}"/>`;
        }
      );
    }

    return modifiedSvg;
  }

  static async generateQrCode(
    data: string, 
    options: QrCodeOptions = {}
  ): Promise<string> {
    try {
      // Ensure uploads directory exists
      await this.ensureUploadsDir();

      const {
        size = 200,
        format = 'png',
        errorCorrectionLevel = 'M',
        margin = 4,
        color = { dark: '#000000', light: '#FFFFFF' },
        style // Accept style but ignore for now since qrcode lib doesn't support it
      } = options;

      const filename = `qr-${Date.now()}-${Math.random().toString(36).substring(7)}.${format}`;
      const filepath = path.join(this.uploadsDir, filename);

      const qrOptions = {
        errorCorrectionLevel,
        type: 'png' as const,
        quality: 0.92,
        margin,
        color,
        width: size
      };

      if (format === 'svg') {
        let svgString = await QRCode.toString(data, {
          ...qrOptions,
          type: 'svg'
        });
        
        // Apply custom style to SVG
        svgString = this.applyStyleToSvg(svgString, style || 'square', color);
        
        await fs.promises.writeFile(filepath.replace('.png', '.svg'), svgString);
        return `/api/qr/${filename.replace('.png', '.svg')}`;
      } else {
        // For PNG format, first generate as SVG, apply style, then convert to PNG
        if (style && style !== 'square') {
          let svgString = await QRCode.toString(data, {
            ...qrOptions,
            type: 'svg'
          });
          
          // Apply custom style to SVG
          svgString = this.applyStyleToSvg(svgString, style, color);
          
          // Save as SVG and return SVG path instead
          const svgFilename = filename.replace('.png', '.svg');
          const svgFilepath = path.join(this.uploadsDir, svgFilename);
          await fs.promises.writeFile(svgFilepath, svgString);
          return `/api/qr/${svgFilename}`;
        } else {
          // Standard PNG generation
          await QRCode.toFile(filepath, data, qrOptions);
          return `/api/qr/${filename}`;
        }
      }
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async generateQrCodeBuffer(
    data: string, 
    options: QrCodeOptions = {}
  ): Promise<Buffer> {
    const {
      size = 200,
      errorCorrectionLevel = 'M',
      margin = 4,
      color = { dark: '#000000', light: '#FFFFFF' },
      style // Accept style but ignore for now
    } = options;

    const qrOptions = {
      errorCorrectionLevel,
      type: 'png' as const,
      quality: 0.92,
      margin,
      color,
      width: size
    };

    return await QRCode.toBuffer(data, qrOptions);
  }

  static async generateQrCodeDataURL(
    data: string, 
    options: QrCodeOptions = {}
  ): Promise<string> {
    const {
      size = 200,
      errorCorrectionLevel = 'M',
      margin = 4,
      color = { dark: '#000000', light: '#FFFFFF' },
      style
    } = options;

    const qrOptions = {
      errorCorrectionLevel,
      type: 'image/png' as const,
      quality: 0.92,
      margin,
      color,
      width: size
    };

    // If custom style is requested, generate as SVG and return as data URL
    if (style && style !== 'square') {
      let svgString = await QRCode.toString(data, {
        ...qrOptions,
        type: 'svg'
      });
      
      // Apply custom style to SVG
      svgString = this.applyStyleToSvg(svgString, style, color);
      
      // Convert SVG to data URL
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
    } else {
      // Standard PNG data URL generation
      return QRCode.toDataURL(data, qrOptions);
    }
  }

  static getQrCodePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }

  private static async ensureUploadsDir(): Promise<void> {
    try {
      await fs.promises.access(this.uploadsDir);
    } catch {
      await fs.promises.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  static async deleteQrCode(filename: string): Promise<boolean> {
    try {
      const filepath = path.join(this.uploadsDir, filename);
      await fs.promises.unlink(filepath);
      return true;
    } catch {
      return false;
    }
  }
}
