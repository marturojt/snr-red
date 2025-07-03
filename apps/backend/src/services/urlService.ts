import { nanoid } from 'nanoid';
import { Url, IUrl } from '../models/Url';
import { CreateUrlRequest, UrlData } from '@url-shortener/types';
import { QrService } from './qrService';

export class UrlService {
  static async create(data: CreateUrlRequest): Promise<UrlData> {
    // Generate short code
    let shortCode = data.customCode;
    if (!shortCode) {
      shortCode = nanoid(8);
      // Ensure uniqueness
      while (await this.getByShortCode(shortCode)) {
        shortCode = nanoid(8);
      }
    } else {
      // Check if custom code is available
      const existing = await this.getByShortCode(shortCode);
      if (existing) {
        throw new Error('Custom short code already exists');
      }
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Create URL record
    const urlData = new Url({
      originalUrl: data.originalUrl,
      shortCode,
      shortUrl,
      title: data.title,
      description: data.description,
      expiresAt: data.expiresAt,
      isActive: true
    });

    const savedUrl = await urlData.save();

    // Generate QR code if requested
    if (data.generateQr) {
      try {
        const qrCodeUrl = await QrService.generateQrCode(shortUrl, {
          size: 200,
          format: 'png'
        });
        savedUrl.qrCodeUrl = qrCodeUrl;
        await savedUrl.save();
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        // Don't fail the entire operation if QR generation fails
      }
    }

    return savedUrl.toJSON() as UrlData;
  }

  static async getByShortCode(shortCode: string): Promise<UrlData | null> {
    const url = await Url.findOne({ shortCode, isActive: true });
    return url ? (url.toJSON() as UrlData) : null;
  }

  static async getById(id: string): Promise<UrlData | null> {
    const url = await Url.findById(id);
    return url ? (url.toJSON() as UrlData) : null;
  }

  static async getAllByUser(userId: string): Promise<UrlData[]> {
    const urls = await Url.find({ userId, isActive: true })
      .sort({ createdAt: -1 });
    return urls.map(url => url.toJSON() as UrlData);
  }

  static async update(id: string, updates: Partial<UrlData>): Promise<UrlData | null> {
    const url = await Url.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    return url ? (url.toJSON() as UrlData) : null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await Url.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
    return !!result;
  }

  static async validateUrl(url: string): Promise<boolean> {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static async isShortCodeAvailable(shortCode: string): Promise<boolean> {
    const existing = await Url.findOne({ shortCode });
    return !existing;
  }

  static async cleanupExpiredUrls(): Promise<number> {
    const result = await Url.updateMany(
      { 
        expiresAt: { $lte: new Date() },
        isActive: true 
      },
      { $set: { isActive: false } }
    );
    return result.modifiedCount;
  }
}
