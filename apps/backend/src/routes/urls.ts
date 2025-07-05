import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { UrlService } from '../services/urlService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { optionalAuth, authenticateToken } from '../middleware/auth';
import { CreateUrlRequest, ApiResponse } from '@url-shortener/types';

const router = express.Router();

// Validation middleware
const validateUrl = [
  body('originalUrl')
    .isURL({ require_protocol: true })
    .withMessage('Please provide a valid URL with protocol (http/https)'),
  body('customCode')
    .optional()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Custom code must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  body('generateQr')
    .optional()
    .isBoolean()
    .withMessage('generateQr must be a boolean value')
];

const validateShortCode = [
  param('shortCode')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid short code format')
];

// Create short URL
router.post('/shorten', optionalAuth, validateUrl, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const urlData: CreateUrlRequest = req.body;
  const anonymousUserId = req.headers['x-user-id'] as string;

  // Determine user type and IDs
  let userId: string | undefined;
  let registeredUserId: string | undefined;
  let userType: 'anonymous' | 'free' | 'premium' = 'anonymous';

  if (req.user) {
    // Authenticated user
    registeredUserId = req.user.id;
    userType = req.user.plan;
  } else if (anonymousUserId) {
    // Anonymous user with browser ID
    userId = anonymousUserId;
    userType = 'anonymous';
  }

  // Additional validation for expiration date
  if (urlData.expiresAt && new Date(urlData.expiresAt) <= new Date()) {
    throw createError(400, 'Expiration date must be in the future');
  }

  try {
    const result = await UrlService.create(urlData, userId, registeredUserId, userType);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'URL shortened successfully'
    };

    res.status(201).json(response);
  } catch (error: any) {
    if (error.message === 'Custom short code already exists') {
      throw createError(409, error.message);
    }
    throw error;
  }
}));

// Get URL details
router.get('/:shortCode', validateShortCode, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { shortCode } = req.params;
  const url = await UrlService.getByShortCode(shortCode);

  if (!url) {
    throw createError(404, 'URL not found');
  }

  const response: ApiResponse = {
    success: true,
    data: url
  };

  res.json(response);
}));

// Check if short code is available
router.get('/check/:shortCode', validateShortCode, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { shortCode } = req.params;
  const isAvailable = await UrlService.isShortCodeAvailable(shortCode);

  const response: ApiResponse = {
    success: true,
    data: { available: isAvailable }
  };

  res.json(response);
}));

// Get user's URLs (if user system is implemented)
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const urls = await UrlService.getAllByUser(userId);

  const response: ApiResponse = {
    success: true,
    data: urls
  };

  res.json(response);
}));

// Get authenticated user's URLs
router.get('/my-urls', authenticateToken, asyncHandler(async (req, res) => {
  const urls = await UrlService.getAllByRegisteredUser(req.user!.id);

  const response: ApiResponse = {
    success: true,
    data: urls
  };

  res.json(response);
}));

// Update URL
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Remove fields that shouldn't be updated
  delete updates.shortCode;
  delete updates.shortUrl;
  delete updates.createdAt;

  const url = await UrlService.update(id, updates);

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
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await UrlService.delete(id);

  if (!deleted) {
    throw createError(404, 'URL not found');
  }

  const response: ApiResponse = {
    success: true,
    message: 'URL deleted successfully'
  };

  res.json(response);
}));

export default router;
