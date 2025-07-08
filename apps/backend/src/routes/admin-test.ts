import express from 'express';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '@url-shortener/types';

const router = express.Router();

// Test endpoint to check admin functionality (temporary - remove in production)
router.get('/test', asyncHandler(async (req, res) => {
  const adminUsers = await User.find({ isAdmin: true }).select('-password');
  const totalUsers = await User.countDocuments();
  
  const response: ApiResponse = {
    success: true,
    data: {
      message: 'Admin test endpoint working',
      adminUsers,
      totalUsers,
      timestamp: new Date()
    }
  };

  res.json(response);
}));

export default router;
