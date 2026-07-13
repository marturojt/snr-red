import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService, LoginRequest, RegisterRequest } from '../services/authService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '@url-shortener/types';

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('plan')
    .optional()
    .isIn(['free', 'premium'])
    .withMessage('Plan must be either free or premium')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const registrationData: RegisterRequest = req.body;

  try {
    const result = await AuthService.register(registrationData);
    
    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        token: result.token
      },
      message: 'User registered successfully'
    };

    res.status(201).json(response);
  } catch (error: any) {
    if (error.message === 'User already exists with this email') {
      throw createError(409, error.message);
    }
    throw error;
  }
}));

// Login
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const loginData: LoginRequest = req.body;

  try {
    const result = await AuthService.login(loginData);
    
    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        token: result.token
      },
      message: 'Login successful'
    };

    res.json(response);
  } catch (error: any) {
    throw createError(401, error.message);
  }
}));

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await AuthService.getUserById(req.user!.id);
  
  if (!user) {
    throw createError(404, 'User not found');
  }

  const response: ApiResponse = {
    success: true,
    data: user
  };

  res.json(response);
}));

// NOTE: Self-service plan changes were removed. A user must never be able to
// upgrade themselves to `premium` for free. Plan changes are performed by an
// admin via `PUT /api/admin/users/:id`, and in Fase 3 will be driven by the
// Stripe billing webhook. See docs/development/API-V1-REFERENCE.md.

// Deactivate account
router.delete('/account', authenticateToken, asyncHandler(async (req, res) => {
  const success = await AuthService.deactivateUser(req.user!.id);

  if (!success) {
    throw createError(404, 'User not found');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Account deactivated successfully'
  };

  res.json(response);
}));

export default router;
