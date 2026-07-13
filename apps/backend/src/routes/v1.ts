import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { UrlService } from '../services/urlService';
import { AnalyticsService } from '../services/analyticsService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { authenticateApiKey, requireScope } from '../middleware/apiKeyAuth';
import { CreateUrlRequest, ApiResponse } from '@url-shortener/types';

const router = express.Router();

// Every /api/v1 request must present a valid API key.
router.use(authenticateApiKey);

// Rate limit per API key (not per IP), so one project can't exhaust another's budget.
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.API_RATE_LIMIT_MAX || '120'),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.apiUser?.keyId || req.ip || 'unknown',
  message: { success: false, error: 'Rate limit exceeded for this API key. Please slow down.' }
});
router.use(apiLimiter);

const validateCreate = [
  body('originalUrl')
    .isURL({ require_protocol: true })
    .withMessage('Please provide a valid URL with protocol (http/https)'),
  body('customCode')
    .optional()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Custom code must be 3-20 chars: letters, numbers, hyphens, underscores'),
  body('title').optional().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('expiresAt').optional().isISO8601(),
  body('generateQr').optional().isBoolean()
];

// POST /api/v1/urls — shorten a URL owned by the API key's user.
router.post('/urls', requireScope('urls:write'), validateCreate, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const urlData: CreateUrlRequest = req.body;

  if (urlData.expiresAt && new Date(urlData.expiresAt) <= new Date()) {
    throw createError(400, 'Expiration date must be in the future');
  }

  try {
    const result = await UrlService.create(
      urlData,
      undefined,
      req.apiUser!.userId,
      req.apiUser!.plan
    );
    const response: ApiResponse = { success: true, data: result, message: 'URL shortened successfully' };
    res.status(201).json(response);
  } catch (error: any) {
    if (error.message === 'Custom short code already exists') {
      throw createError(409, error.message);
    }
    throw error;
  }
}));

// GET /api/v1/urls — list the caller's URLs.
router.get('/urls', requireScope('urls:read'), asyncHandler(async (req, res) => {
  const urls = await UrlService.getAllByRegisteredUser(req.apiUser!.userId);
  const response: ApiResponse = { success: true, data: urls };
  res.json(response);
}));

const validateShortCode = [
  param('shortCode').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_-]+$/)
];

// GET /api/v1/urls/:shortCode — detail (ownership enforced).
router.get('/urls/:shortCode', requireScope('urls:read'), validateShortCode, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, 'Invalid short code format');
  }

  const url = await UrlService.getByShortCode(req.params.shortCode);
  if (!url || url.registeredUserId !== req.apiUser!.userId) {
    throw createError(404, 'URL not found');
  }

  const response: ApiResponse = { success: true, data: url };
  res.json(response);
}));

// DELETE /api/v1/urls/:shortCode — soft-delete (ownership enforced).
router.delete('/urls/:shortCode', requireScope('urls:write'), validateShortCode, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, 'Invalid short code format');
  }

  const url = await UrlService.getByShortCode(req.params.shortCode);
  if (!url || url.registeredUserId !== req.apiUser!.userId) {
    throw createError(404, 'URL not found');
  }

  await UrlService.delete(url.id);
  const response: ApiResponse = { success: true, message: 'URL deleted successfully' };
  res.json(response);
}));

// GET /api/v1/urls/:shortCode/analytics — stats (ownership enforced).
router.get('/urls/:shortCode/analytics', requireScope('analytics:read'), validateShortCode, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, 'Invalid short code format');
  }

  const url = await UrlService.getByShortCode(req.params.shortCode);
  if (!url || url.registeredUserId !== req.apiUser!.userId) {
    throw createError(404, 'URL not found');
  }

  const stats = await AnalyticsService.getUrlStats(url.id);
  const response: ApiResponse = { success: true, data: stats };
  res.json(response);
}));

export default router;
