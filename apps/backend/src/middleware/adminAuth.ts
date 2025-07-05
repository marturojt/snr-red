import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { createError } from './errorHandler';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const adminAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw createError(401, 'Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Find user and check if admin
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw createError(401, 'Invalid token.');
    }
    
    if (!user.isAdmin) {
      throw createError(403, 'Access denied. Admin privileges required.');
    }
    
    if (!user.isActive) {
      throw createError(401, 'Account is deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError(401, 'Invalid token.'));
    }
    next(error);
  }
};
