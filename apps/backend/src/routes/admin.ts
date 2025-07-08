import express from 'express';
import { CleanupService } from '../services/cleanupService';
import { Url } from '../models/Url';
import { User } from '../models/User';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { ApiResponse } from '@url-shortener/types';

const router = express.Router();

// Temporalmente comentamos la autenticación para diagnosticar
// router.use(adminAuthMiddleware);

// Test route to verify admin routes are working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin routes are working' });
});

// Apply admin authentication to all routes except test
router.use('/users', adminAuthMiddleware);
router.use('/urls', adminAuthMiddleware);
router.use('/analytics', adminAuthMiddleware);
router.use('/stats', adminAuthMiddleware);
router.use('/cleanup', adminAuthMiddleware);
router.use('/cleanup-stats', adminAuthMiddleware);

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

// ==== USER MANAGEMENT ====

// Get all users with pagination
router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const filter = req.query.filter as string;
  const search = req.query.search as string;
  
  let query: any = {};
  
  if (filter) {
    if (filter === 'active') query.isActive = true;
    if (filter === 'inactive') query.isActive = false;
    if (filter === 'free') query.plan = 'free';
    if (filter === 'premium') query.plan = 'premium';
  }
  
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(query);
  
  const response: ApiResponse = {
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  };

  res.json(response);
}));

// Get user by ID
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw createError(404, 'User not found');
  }
  
  // Get user's URLs
  const urls = await Url.find({ registeredUserId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(10);
  
  const response: ApiResponse = {
    success: true,
    data: {
      user,
      urls
    }
  };

  res.json(response);
}));

// Update user (plan, status, etc.)
router.put('/users/:id', asyncHandler(async (req, res) => {
  const { plan, isActive, subscriptionStatus } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 
      ...(plan && { plan }),
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(subscriptionStatus && { subscriptionStatus })
    },
    { new: true }
  ).select('-password');
  
  if (!user) {
    throw createError(404, 'User not found');
  }
  
  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User updated successfully'
  };

  res.json(response);
}));

// Delete user
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    throw createError(404, 'User not found');
  }
  
  // Also delete user's URLs
  await Url.deleteMany({ registeredUserId: req.params.id });
  
  const response: ApiResponse = {
    success: true,
    message: 'User and associated URLs deleted successfully'
  };

  res.json(response);
}));

// ==== URL MANAGEMENT ====

// Get all URLs with pagination
router.get('/urls', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const filter = req.query.filter as string;
  const search = req.query.search as string;
  
  let query: any = {};
  
  if (filter) {
    if (filter === 'anonymous') query.userType = 'anonymous';
    if (filter === 'registered') query.userType = { $in: ['free', 'premium'] };
    if (filter === 'expired') query.autoExpiresAt = { $lt: new Date() };
    if (filter === 'active') query.autoExpiresAt = { $gte: new Date() };
  }
  
  if (search) {
    query.$or = [
      { originalUrl: { $regex: search, $options: 'i' } },
      { shortCode: { $regex: search, $options: 'i' } }
    ];
  }
  
  const urls = await Url.find(query)
    .populate('registeredUserId', 'email name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Url.countDocuments(query);
  
  const response: ApiResponse = {
    success: true,
    data: {
      urls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  };

  res.json(response);
}));

// Get URL by ID
router.get('/urls/:id', asyncHandler(async (req, res) => {
  const url = await Url.findById(req.params.id)
    .populate('registeredUserId', 'email name plan');
  
  if (!url) {
    throw createError(404, 'URL not found');
  }
  
  const response: ApiResponse = {
    success: true,
    data: url
  };

  res.json(response);
}));

// Update URL
router.put('/urls/:id', asyncHandler(async (req, res) => {
  const { isActive, autoExpiresAt } = req.body;
  
  const url = await Url.findByIdAndUpdate(
    req.params.id,
    {
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(autoExpiresAt && { autoExpiresAt: new Date(autoExpiresAt) })
    },
    { new: true }
  ).populate('registeredUserId', 'email name plan');
  
  if (!url) {
    throw createError(404, 'URL not found');
  }
  
  const response: ApiResponse = {
    success: true,
    data: url,
    message: 'URL updated successfully'
  };

  res.json(response);
}));

// Delete URL
router.delete('/urls/:id', asyncHandler(async (req, res) => {
  const url = await Url.findByIdAndDelete(req.params.id);
  
  if (!url) {
    throw createError(404, 'URL not found');
  }
  
  const response: ApiResponse = {
    success: true,
    message: 'URL deleted successfully'
  };

  res.json(response);
}));

// ==== ANALYTICS ====

// Get detailed analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const analytics = {
    // URL statistics
    totalUrls: await Url.countDocuments(),
    activeUrls: await Url.countDocuments({ isActive: true }),
    expiredUrls: await Url.countDocuments({ autoExpiresAt: { $lt: new Date() } }),
    urlsToday: await Url.countDocuments({ createdAt: { $gte: today } }),
    urlsThisWeek: await Url.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    urlsThisMonth: await Url.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    
    // User statistics
    totalUsers: await User.countDocuments(),
    activeUsers: await User.countDocuments({ isActive: true }),
    freeUsers: await User.countDocuments({ plan: 'free', isActive: true }),
    premiumUsers: await User.countDocuments({ plan: 'premium', isActive: true }),
    usersToday: await User.countDocuments({ createdAt: { $gte: today } }),
    usersThisWeek: await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    usersThisMonth: await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    
    // Click statistics
    totalClicks: await Url.aggregate([
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]).then(result => result[0]?.total || 0),
    
    // Top URLs by clicks
    topUrls: await Url.find({ clicks: { $gt: 0 } })
      .sort({ clicks: -1 })
      .limit(10)
      .populate('registeredUserId', 'email name')
  };
  
  const response: ApiResponse = {
    success: true,
    data: analytics
  };

  res.json(response);
}));

export default router;
