import { nanoid } from 'nanoid';
import { Url, IUrl } from '../models/Url';
import { Analytics } from '../models/Analytics';
import { CreateUrlRequest, UrlData } from '@url-shortener/types';
import { QrService } from './qrService';
import { CleanupService } from './cleanupService';

export class UrlService {
  // Helper method to enrich URLs with analytics data
  private static async enrichUrlsWithAnalytics(urls: IUrl[]): Promise<UrlData[]> {
    const urlIds = urls.map(url => url._id.toString());
    
    // Get click counts for all URLs in one query
    const clickCounts = await Analytics.aggregate([
      { $match: { urlId: { $in: urlIds } } },
      { $group: { _id: '$urlId', clicks: { $sum: 1 } } }
    ]);
    
    // Create a map for quick lookup
    const clickMap = new Map<string, number>();
    clickCounts.forEach(item => {
      clickMap.set(item._id, item.clicks);
    });
    
    // Enrich URLs with click data
    return urls.map(url => {
      const urlData = url.toJSON() as UrlData & { clicks?: number };
      urlData.clicks = clickMap.get(url._id.toString()) || 0;
      return urlData as UrlData;
    });
  }

  static async create(
    data: CreateUrlRequest, 
    userId?: string, 
    registeredUserId?: string,
    userType: 'anonymous' | 'free' | 'premium' = 'anonymous'
  ): Promise<UrlData> {
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

    // Calculate auto expiration based on user type
    const autoExpiresAt = CleanupService.calculateAutoExpiration(userType);

    // Create URL record
    const urlData = new Url({
      originalUrl: data.originalUrl,
      shortCode,
      shortUrl,
      title: data.title,
      description: data.description,
      expiresAt: data.expiresAt,
      userId: userId || null,
      registeredUserId: registeredUserId || null,
      userType,
      autoExpiresAt,
      lastAccessedAt: new Date(),
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
    return await this.enrichUrlsWithAnalytics(urls);
  }

  static async getAllByRegisteredUser(registeredUserId: string): Promise<UrlData[]> {
    const urls = await Url.find({ registeredUserId, isActive: true })
      .sort({ createdAt: -1 });
    return await this.enrichUrlsWithAnalytics(urls);
  }

  static async getByShortCodeAndUpdateAccess(shortCode: string): Promise<UrlData | null> {
    const url = await Url.findOne({ shortCode, isActive: true });
    if (url) {
      // Update last accessed time
      await CleanupService.updateLastAccessed(url._id);
      return url.toJSON() as UrlData;
    }
    return null;
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
