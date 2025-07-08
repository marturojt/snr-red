import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { createError } from './errorHandler';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: 'free' | 'premium';
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError(401, 'Access token required');
    }

    const decoded = AuthService.verifyToken(token);
    
    if (typeof decoded === 'string') {
      throw createError(401, 'Invalid token format');
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      plan: decoded.plan
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token);
      
      if (typeof decoded !== 'string') {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          plan: decoded.plan
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

export const requirePlan = (requiredPlan: 'free' | 'premium') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }

    if (requiredPlan === 'premium' && req.user.plan !== 'premium') {
      return next(createError(403, 'Premium plan required'));
    }

    next();
  };
};
