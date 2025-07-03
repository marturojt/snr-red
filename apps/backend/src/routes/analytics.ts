import express from 'express';
import { param, validationResult } from 'express-validator';
import { AnalyticsService } from '../services/analyticsService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '@url-shortener/types';

const router = express.Router();

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid URL ID format')
];

// Get URL analytics
router.get('/:id', validateId, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const stats = await AnalyticsService.getUrlStats(id);

  if (!stats) {
    throw createError(404, 'URL not found');
  }

  const response: ApiResponse = {
    success: true,
    data: stats
  };

  res.json(response);
}));

// Delete URL analytics
router.delete('/:id', validateId, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { id } = req.params;
  const deletedCount = await AnalyticsService.deleteUrlAnalytics(id);

  const response: ApiResponse = {
    success: true,
    data: { deletedCount },
    message: `Deleted ${deletedCount} analytics records`
  };

  res.json(response);
}));

export default router;
