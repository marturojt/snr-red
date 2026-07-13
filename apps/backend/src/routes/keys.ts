import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { ApiKeyService } from '../services/apiKeyService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse, ApiKeyScope, CreateApiKeyResponse } from '@url-shortener/types';

const router = express.Router();

const VALID_SCOPES: ApiKeyScope[] = ['urls:read', 'urls:write', 'analytics:read'];

// All key-management routes require a logged-in dashboard user (JWT).
router.use(authenticateToken);

const validateCreate = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be at most 100 characters'),
  body('scopes')
    .optional()
    .isArray()
    .withMessage('scopes must be an array'),
  body('scopes.*')
    .optional()
    .isIn(VALID_SCOPES)
    .withMessage(`scopes must be any of: ${VALID_SCOPES.join(', ')}`)
];

// Create a new API key. The raw token is returned ONCE here and never again.
router.post('/', validateCreate, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { name, scopes } = req.body as { name: string; scopes?: ApiKeyScope[] };
  const { apiKey, token } = await ApiKeyService.generate(req.user!.id, name, scopes || []);

  const data: CreateApiKeyResponse = { ...(apiKey.toJSON() as any), token };
  const response: ApiResponse<CreateApiKeyResponse> = {
    success: true,
    data,
    message: 'API key created. Copy the token now — it will not be shown again.'
  };

  res.status(201).json(response);
}));

// List the caller's API keys (no secrets).
router.get('/', asyncHandler(async (req, res) => {
  const keys = await ApiKeyService.list(req.user!.id);
  const response: ApiResponse = {
    success: true,
    data: keys.map(k => k.toJSON())
  };
  res.json(response);
}));

// Revoke one of the caller's API keys.
router.delete('/:id', param('id').isMongoId(), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, 'Invalid API key id');
  }

  const revoked = await ApiKeyService.revoke(req.user!.id, req.params.id);
  if (!revoked) {
    throw createError(404, 'API key not found');
  }

  const response: ApiResponse = {
    success: true,
    message: 'API key revoked'
  };
  res.json(response);
}));

export default router;
