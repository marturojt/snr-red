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
    if (error.message === 'Invalid email or password') {
      throw createError(401, error.message);
    }
    throw error;
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

// Update user plan
router.put('/plan', authenticateToken, asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!plan || !['free', 'premium'].includes(plan)) {
    throw createError(400, 'Invalid plan. Must be free or premium');
  }

  const user = await AuthService.updateUserPlan(req.user!.id, plan);

  if (!user) {
    throw createError(404, 'User not found');
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'Plan updated successfully'
  };

  res.json(response);
}));

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
