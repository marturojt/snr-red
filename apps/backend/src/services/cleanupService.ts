import { Url } from '../models/Url';
import { User } from '../models/User';

export class CleanupService {
  
  /**
   * Calculate auto expiration date based on user type
   */
  static calculateAutoExpiration(userType: 'anonymous' | 'free' | 'premium'): Date {
    const now = new Date();
    
    switch (userType) {
      case 'anonymous':
        // Anonymous users: 3 months after creation
        return new Date(now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000);
      
      case 'free':
        // Free users: 3 months after creation
        return new Date(now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000);
      
      case 'premium':
        // Premium users: no auto expiration (will be handled by inactivity)
        return new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years
    }
  }

  /**
   * Calculate inactivity expiration date
   */
  static calculateInactivityExpiration(userType: 'anonymous' | 'free' | 'premium'): Date {
    const now = new Date();
    
    switch (userType) {
      case 'anonymous':
        // Anonymous users: 1 month of inactivity
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      case 'free':
        // Free users: 1 month of inactivity (same as anonymous)
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      case 'premium':
        // Premium users: 1 year of inactivity
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Clean up expired URLs based on business rules
   */
  static async cleanupExpiredUrls(): Promise<{
    deletedCount: number;
    anonymousDeleted: number;
    freeDeleted: number;
    premiumDeleted: number;
  }> {
    const now = new Date();
    
    // Clean anonymous users URLs - 3 months after creation OR 1 month of inactivity
    const anonymousExpired = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago
    const anonymousInactive = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 month ago
    
    const anonymousResult = await Url.deleteMany({
      userType: 'anonymous',
      $or: [
        { createdAt: { $lt: anonymousExpired } },
        { lastAccessedAt: { $lt: anonymousInactive } }
      ]
    });

    // Clean free users URLs - 3 months after creation OR 1 month of inactivity
    const freeExpired = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago
    const freeInactive = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 month ago
    
    const freeResult = await Url.deleteMany({
      userType: 'free',
      $or: [
        { createdAt: { $lt: freeExpired } },
        { lastAccessedAt: { $lt: freeInactive } }
      ]
    });

    // Clean premium users URLs - only 1 year of inactivity
    const premiumInactive = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    
    const premiumResult = await Url.deleteMany({
      userType: 'premium',
      lastAccessedAt: { $lt: premiumInactive }
    });

    // Also clean URLs with explicit expiration dates
    const explicitExpiredResult = await Url.deleteMany({
      expiresAt: { $lt: now }
    });

    const totalDeleted = anonymousResult.deletedCount + freeResult.deletedCount + 
                        premiumResult.deletedCount + explicitExpiredResult.deletedCount;

    return {
      deletedCount: totalDeleted,
      anonymousDeleted: anonymousResult.deletedCount,
      freeDeleted: freeResult.deletedCount,
      premiumDeleted: premiumResult.deletedCount
    };
  }

  /**
   * Update last accessed time for a URL
   */
  static async updateLastAccessed(urlId: string): Promise<void> {
    await Url.findByIdAndUpdate(urlId, {
      lastAccessedAt: new Date()
    });
  }

  /**
   * Clean up inactive users (optional - for complete cleanup)
   */
  static async cleanupInactiveUsers(): Promise<number> {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    
    const result = await User.deleteMany({
      plan: 'free',
      lastLoginAt: { $lt: oneYearAgo },
      isActive: false
    });

    return result.deletedCount;
  }

  /**
   * Get cleanup statistics
   */
  static async getCleanupStats(): Promise<{
    totalUrls: number;
    urlsByType: {
      anonymous: number;
      free: number;
      premium: number;
    };
    expiringSoon: {
      anonymous: number;
      free: number;
      premium: number;
    };
  }> {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const totalUrls = await Url.countDocuments({ isActive: true });
    
    const urlsByType = {
      anonymous: await Url.countDocuments({ userType: 'anonymous', isActive: true }),
      free: await Url.countDocuments({ userType: 'free', isActive: true }),
      premium: await Url.countDocuments({ userType: 'premium', isActive: true })
    };

    // URLs expiring in the next week
    const expiringSoon = {
      anonymous: await Url.countDocuments({
        userType: 'anonymous',
        isActive: true,
        $or: [
          { expiresAt: { $lt: oneWeekFromNow } },
          { autoExpiresAt: { $lt: oneWeekFromNow } }
        ]
      }),
      free: await Url.countDocuments({
        userType: 'free',
        isActive: true,
        $or: [
          { expiresAt: { $lt: oneWeekFromNow } },
          { autoExpiresAt: { $lt: oneWeekFromNow } }
        ]
      }),
      premium: await Url.countDocuments({
        userType: 'premium',
        isActive: true,
        $or: [
          { expiresAt: { $lt: oneWeekFromNow } },
          { autoExpiresAt: { $lt: oneWeekFromNow } }
        ]
      })
    };

    return {
      totalUrls,
      urlsByType,
      expiringSoon
    };
  }
}
