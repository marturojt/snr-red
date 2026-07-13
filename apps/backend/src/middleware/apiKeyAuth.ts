import { Request, Response, NextFunction } from 'express';
import { ApiKeyService, VerifiedApiKey } from '../services/apiKeyService';
import { AuthService } from '../services/authService';
import { createError } from './errorHandler';
import { ApiKeyScope } from '@url-shortener/types';

// Extend Request with API-key identity and a normalized principal usable by
// endpoints that accept either a JWT (browser) or an API key (server-to-server).
declare global {
  namespace Express {
    interface Request {
      apiUser?: VerifiedApiKey;
      principal?: {
        id: string;
        plan: 'free' | 'premium';
        via: 'jwt' | 'apiKey';
      };
    }
  }
}

function extractApiKey(req: Request): string | undefined {
  const headerKey = req.headers['x-api-key'];
  if (typeof headerKey === 'string' && headerKey.length) {
    return headerKey;
  }
  // Fallback: Authorization: Bearer snr_live_...
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token && token.startsWith('snr_live_')) {
    return token;
  }
  return undefined;
}

/** Require a valid API key. Populates req.apiUser and req.principal. */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = extractApiKey(req);
    if (!rawToken) {
      throw createError(401, 'API key required. Send it in the X-API-Key header.');
    }

    const verified = await ApiKeyService.verify(rawToken);
    if (!verified) {
      throw createError(401, 'Invalid or revoked API key.');
    }

    req.apiUser = verified;
    req.principal = { id: verified.userId, plan: verified.plan, via: 'apiKey' };
    next();
  } catch (error) {
    next(error);
  }
};

/** Guard a route by API-key scope. Must run after authenticateApiKey. */
export const requireScope = (scope: ApiKeyScope) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiUser) {
      return next(createError(401, 'API key required.'));
    }
    if (!req.apiUser.scopes.includes(scope)) {
      return next(createError(403, `API key is missing the required scope: ${scope}`));
    }
    next();
  };
};

/**
 * Populate req.principal from a JWT or API key IF present, but never fail when
 * credentials are absent. Used by browser-facing routes that must still support
 * anonymous callers (who are identified separately via the x-user-id header).
 */
export const optionalCombinedAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawApiKey = extractApiKey(req);
    if (rawApiKey) {
      const verified = await ApiKeyService.verify(rawApiKey);
      if (verified) {
        req.apiUser = verified;
        req.principal = { id: verified.userId, plan: verified.plan, via: 'apiKey' };
      }
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = AuthService.verifyToken(token);
      if (typeof decoded !== 'string') {
        req.user = { id: decoded.userId, email: decoded.email, plan: decoded.plan };
        req.principal = { id: decoded.userId, plan: decoded.plan, via: 'jwt' };
      }
    }
    next();
  } catch (error) {
    // Optional auth: ignore bad credentials and continue as anonymous.
    next();
  }
};

/**
 * Accept EITHER a JWT (browser session) OR an API key (server-to-server) and
 * normalize both to req.principal. Used by endpoints shared by both worlds.
 */
export const combinedAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawApiKey = extractApiKey(req);
    if (rawApiKey) {
      const verified = await ApiKeyService.verify(rawApiKey);
      if (!verified) {
        throw createError(401, 'Invalid or revoked API key.');
      }
      req.apiUser = verified;
      req.principal = { id: verified.userId, plan: verified.plan, via: 'apiKey' };
      return next();
    }

    // Fall back to JWT bearer token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      throw createError(401, 'Authentication required (JWT or API key).');
    }

    const decoded = AuthService.verifyToken(token);
    if (typeof decoded === 'string') {
      throw createError(401, 'Invalid token format');
    }

    req.user = { id: decoded.userId, email: decoded.email, plan: decoded.plan };
    req.principal = { id: decoded.userId, plan: decoded.plan, via: 'jwt' };
    next();
  } catch (error) {
    next(error);
  }
};
