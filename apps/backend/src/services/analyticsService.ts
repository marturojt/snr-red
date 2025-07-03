import { Request } from 'express';
import { Analytics, IAnalytics } from '../models/Analytics';
import { UrlAnalytics, UrlStatsResponse } from '@url-shortener/types';
import * as geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

export class AnalyticsService {
  static async trackClick(urlId: string, req: Request): Promise<void> {
    try {
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = this.getClientIpAddress(req);
      const referer = req.get('Referer') || req.get('Referrer') || '';

      // Parse user agent
      const parser = new UAParser(userAgent);
      const uaResult = parser.getResult();

      // Get geolocation info
      const geoInfo = ipAddress ? geoip.lookup(ipAddress) : null;

      const analyticsData: Partial<IAnalytics> = {
        urlId,
        userAgent,
        ipAddress,
        referer,
        country: geoInfo?.country || null,
        city: geoInfo?.city || null,
        device: uaResult.device.type || 'desktop',
        browser: uaResult.browser.name || null,
        os: uaResult.os.name || null,
        timestamp: new Date()
      };

      await Analytics.create(analyticsData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw error to avoid breaking the redirect
    }
  }

  static async getUrlStats(urlId: string): Promise<UrlStatsResponse | null> {
    try {
      // Import here to avoid circular dependency
      const { UrlService } = await import('./urlService');
      const url = await UrlService.getById(urlId);
      
      if (!url) {
        return null;
      }

      const [
        totalClicks,
        uniqueClicks,
        clicksByDate,
        clicksByCountry,
        clicksByDevice,
        clicksByBrowser
      ] = await Promise.all([
        this.getTotalClicks(urlId),
        this.getUniqueClicks(urlId),
        this.getClicksByDate(urlId),
        this.getClicksByCountry(urlId),
        this.getClicksByDevice(urlId),
        this.getClicksByBrowser(urlId)
      ]);

      return {
        url,
        totalClicks,
        uniqueClicks,
        clicksByDate,
        clicksByCountry,
        clicksByDevice,
        clicksByBrowser
      };
    } catch (error) {
      console.error('Error getting URL stats:', error);
      throw error;
    }
  }

  private static async getTotalClicks(urlId: string): Promise<number> {
    return await Analytics.countDocuments({ urlId });
  }

  private static async getUniqueClicks(urlId: string): Promise<number> {
    const result = await Analytics.aggregate([
      { $match: { urlId } },
      { $group: { _id: '$ipAddress' } },
      { $count: 'uniqueClicks' }
    ]);
    return result[0]?.uniqueClicks || 0;
  }

  private static async getClicksByDate(urlId: string, days: number = 30): Promise<Array<{ date: string; clicks: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await Analytics.aggregate([
      { 
        $match: { 
          urlId,
          timestamp: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return result.map(item => ({
      date: item._id,
      clicks: item.clicks
    }));
  }

  private static async getClicksByCountry(urlId: string): Promise<Array<{ country: string; clicks: number }>> {
    const result = await Analytics.aggregate([
      { $match: { urlId, country: { $ne: null } } },
      {
        $group: {
          _id: '$country',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);

    return result.map(item => ({
      country: item._id,
      clicks: item.clicks
    }));
  }

  private static async getClicksByDevice(urlId: string): Promise<Array<{ device: string; clicks: number }>> {
    const result = await Analytics.aggregate([
      { $match: { urlId, device: { $ne: null } } },
      {
        $group: {
          _id: '$device',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } }
    ]);

    return result.map(item => ({
      device: item._id,
      clicks: item.clicks
    }));
  }

  private static async getClicksByBrowser(urlId: string): Promise<Array<{ browser: string; clicks: number }>> {
    const result = await Analytics.aggregate([
      { $match: { urlId, browser: { $ne: null } } },
      {
        $group: {
          _id: '$browser',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);

    return result.map(item => ({
      browser: item._id,
      clicks: item.clicks
    }));
  }

  private static getClientIpAddress(req: Request): string | null {
    const forwarded = req.get('X-Forwarded-For');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return req.get('X-Real-IP') || 
           req.get('X-Client-IP') || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           null;
  }

  static async deleteUrlAnalytics(urlId: string): Promise<number> {
    const result = await Analytics.deleteMany({ urlId });
    return result.deletedCount;
  }
}
