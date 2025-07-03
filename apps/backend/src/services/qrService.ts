import QRCode from 'qrcode';
import { QrCodeOptions } from '@url-shortener/types';
import * as fs from 'fs';
import * as path from 'path';

export class QrService {
  private static uploadsDir = path.join(process.cwd(), 'uploads', 'qr');

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
        color = { dark: '#000000', light: '#FFFFFF' }
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
        const svgString = await QRCode.toString(data, {
          ...qrOptions,
          type: 'svg'
        });
        await fs.promises.writeFile(filepath.replace('.png', '.svg'), svgString);
        return `/api/qr/${filename.replace('.png', '.svg')}`;
      } else {
        await QRCode.toFile(filepath, data, qrOptions);
        return `/api/qr/${filename}`;
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
      color = { dark: '#000000', light: '#FFFFFF' }
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
      color = { dark: '#000000', light: '#FFFFFF' }
    } = options;

    const qrOptions = {
      errorCorrectionLevel,
      type: 'image/png' as const,
      quality: 0.92,
      margin,
      color,
      width: size
    };

    return QRCode.toDataURL(data, qrOptions);
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
