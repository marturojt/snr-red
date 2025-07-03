import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { QrService } from '../services/qrService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, QrCodeOptions } from '@url-shortener/types';
import * as path from 'path';

const router = express.Router();

// Validation for QR generation
const validateQrGeneration = [
  body('data')
    .notEmpty()
    .withMessage('Data is required for QR code generation'),
  body('options.size')
    .optional()
    .isInt({ min: 100, max: 1000 })
    .withMessage('Size must be between 100 and 1000 pixels'),
  body('options.format')
    .optional()
    .isIn(['png', 'svg'])
    .withMessage('Format must be either png or svg'),
  body('options.errorCorrectionLevel')
    .optional()
    .isIn(['L', 'M', 'Q', 'H'])
    .withMessage('Error correction level must be L, M, Q, or H')
];

// Generate QR code
router.post('/generate', validateQrGeneration, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { data, options = {} }: { data: string; options: QrCodeOptions } = req.body;

  try {
    const qrCodeUrl = await QrService.generateQrCode(data, options);
    
    const response: ApiResponse = {
      success: true,
      data: { qrCodeUrl },
      message: 'QR code generated successfully'
    };

    res.json(response);
  } catch (error: any) {
    throw createError(500, error.message || 'Failed to generate QR code');
  }
}));

// Generate QR code as data URL (base64)
router.post('/generate/dataurl', validateQrGeneration, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(400, errors.array()[0].msg);
  }

  const { data, options = {} }: { data: string; options: QrCodeOptions } = req.body;

  try {
    const dataUrl = await QrService.generateQrCodeDataURL(data, options);
    
    const response: ApiResponse = {
      success: true,
      data: { dataUrl },
      message: 'QR code generated successfully'
    };

    res.json(response);
  } catch (error: any) {
    throw createError(500, error.message || 'Failed to generate QR code');
  }
}));

// Serve QR code files
router.get('/:filename', asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent directory traversal
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw createError(400, 'Invalid filename');
  }

  const filepath = QrService.getQrCodePath(filename);
  
  try {
    res.sendFile(path.resolve(filepath));
  } catch (error) {
    throw createError(404, 'QR code not found');
  }
}));

// Delete QR code
router.delete('/:filename', asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Validate filename
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw createError(400, 'Invalid filename');
  }

  const deleted = await QrService.deleteQrCode(filename);

  if (!deleted) {
    throw createError(404, 'QR code not found');
  }

  const response: ApiResponse = {
    success: true,
    message: 'QR code deleted successfully'
  };

  res.json(response);
}));

export default router;
