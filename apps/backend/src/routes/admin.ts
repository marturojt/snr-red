import express from 'express';
import { CleanupService } from '../services/cleanupService';
import { Url } from '../models/Url';
import { User } from '../models/User';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '@url-shortener/types';

const router = express.Router();

// Get system statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const cleanupStats = await CleanupService.getCleanupStats();
  
  const userStats = {
    totalUsers: await User.countDocuments({ isActive: true }),
    freeUsers: await User.countDocuments({ plan: 'free', isActive: true }),
    premiumUsers: await User.countDocuments({ plan: 'premium', isActive: true }),
    inactiveUsers: await User.countDocuments({ isActive: false })
  };

  const response: ApiResponse = {
    success: true,
    data: {
      urls: cleanupStats,
      users: userStats,
      timestamp: new Date()
    }
  };

  res.json(response);
}));

// Manual cleanup trigger
router.post('/cleanup', asyncHandler(async (req, res) => {
  const result = await CleanupService.cleanupExpiredUrls();
  
  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Cleanup completed successfully'
  };

  res.json(response);
}));

// Get cleanup statistics
router.get('/cleanup-stats', asyncHandler(async (req, res) => {
  const stats = await CleanupService.getCleanupStats();
  
  const response: ApiResponse = {
    success: true,
    data: stats
  };

  res.json(response);
}));

export default router;
