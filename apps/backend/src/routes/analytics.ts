import express from 'express';
import { param, validationResult } from 'express-validator';
import { AnalyticsService } from '../services/analyticsService';
import { UrlService } from '../services/urlService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { optionalCombinedAuth } from '../middleware/apiKeyAuth';
import { ApiResponse, UrlData } from '@url-shortener/types';

const router = express.Router();

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid URL ID format')
];

// Ownership: analytics for a URL are only accessible to that URL's owner
// (registered principal via registeredUserId, or anonymous via x-user-id).
function ownsUrl(url: UrlData, req: express.Request): boolean {
  const principalId = req.principal?.id;
  if (principalId && url.registeredUserId && url.registeredUserId === principalId) {
    return true;
  }
  const anonId = req.headers['x-user-id'] as string | undefined;
  if (anonId && url.userId && url.userId === anonId) {
    return true;
  }
  return false;
}

// Get URL analytics
router.get('/:id', validateId, optionalCombinedAuth, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { id } = req.params;

  const url = await UrlService.getById(id);
  if (!url) {
    throw createError(404, 'URL not found');
  }
  if (!ownsUrl(url, req)) {
    throw createError(403, 'Not authorized to view these analytics');
  }

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
router.delete('/:id', validateId, optionalCombinedAuth, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { id } = req.params;

  const url = await UrlService.getById(id);
  if (!url) {
    throw createError(404, 'URL not found');
  }
  if (!ownsUrl(url, req)) {
    throw createError(403, 'Not authorized to delete these analytics');
  }

  const deletedCount = await AnalyticsService.deleteUrlAnalytics(id);

  const response: ApiResponse = {
    success: true,
    data: { deletedCount },
    message: `Deleted ${deletedCount} analytics records`
  };

  res.json(response);
}));

export default router;
