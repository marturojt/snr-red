import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { vcardService } from '../services/vcardService';
import { createError } from '../middleware/errorHandler';
import { ApiResponse } from '@url-shortener/types';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Create vCard
router.post('/create',
  [
    body('personalInfo.firstName')
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 100 })
      .withMessage('First name must be less than 100 characters'),
    body('personalInfo.lastName')
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 100 })
      .withMessage('Last name must be less than 100 characters'),
    body('personalInfo.company')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Company must be less than 200 characters'),
    body('personalInfo.title')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('contact.email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email'),
    body('contact.phone')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Phone must be less than 50 characters'),
    body('contact.website')
      .optional()
      .isURL()
      .withMessage('Must be a valid URL'),
    body('theme')
      .optional()
      .isIn(['professional', 'creative', 'minimal'])
      .withMessage('Theme must be professional, creative, or minimal')
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // Get user ID from header (for anonymous users) or auth token
      const userId = req.headers['x-user-id'] as string || req.user?.id;
      
      const vcard = await vcardService.createVCard({
        userId,
        ...req.body
      });

      const response: ApiResponse<typeof vcard> = {
        success: true,
        data: vcard
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get vCard by short code (public route)
router.get('/:shortCode',
  [
    param('shortCode')
      .isLength({ min: 6, max: 12 })
      .withMessage('Invalid short code format')
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { shortCode } = req.params;
      const vcard = await vcardService.getVCardByShortCode(shortCode);

      if (!vcard) {
        throw createError(404, 'vCard not found');
      }

      // Increment views (don't await to avoid blocking)
      vcardService.incrementViews(vcard.id).catch(console.error);

      const response: ApiResponse<typeof vcard> = {
        success: true,
        data: vcard
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get user's vCards
router.get('/user/:userId',
  [
    param('userId')
      .notEmpty()
      .withMessage('User ID is required')
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { userId } = req.params;
      
      // Check if user can access these vCards
      const requestUserId = req.headers['x-user-id'] as string || req.user?.id;
      if (userId !== requestUserId) {
        throw createError(403, 'Access denied');
      }

      const vcards = await vcardService.getVCardsByUserId(userId);

      const response: ApiResponse<typeof vcards> = {
        success: true,
        data: vcards
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Download vCard as .vcf file
router.get('/:shortCode/download',
  [
    param('shortCode')
      .isLength({ min: 6, max: 12 })
      .withMessage('Invalid short code format')
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { shortCode } = req.params;
      const vcard = await vcardService.getVCardByShortCode(shortCode);

      if (!vcard) {
        throw createError(404, 'vCard not found');
      }

      // Increment saves (don't await to avoid blocking)
      vcardService.incrementSaves(vcard.id).catch(console.error);

      // Generate VCF content
      const vcfContent = vcardService.generateVCardFile(vcard);
      const fileName = `${vcard.personalInfo.firstName}_${vcard.personalInfo.lastName}.vcf`;

      res.set({
        'Content-Type': 'text/vcard',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      });

      res.send(vcfContent);
    } catch (error) {
      next(error);
    }
  }
);

// Update vCard
router.put('/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid vCard ID'),
    body('personalInfo.firstName')
      .optional()
      .isLength({ max: 100 })
      .withMessage('First name must be less than 100 characters'),
    body('personalInfo.lastName')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Last name must be less than 100 characters'),
    body('contact.email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email'),
    body('contact.website')
      .optional()
      .isURL()
      .withMessage('Must be a valid URL')
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string || req.user?.id;

      if (!userId) {
        throw createError(401, 'Authentication required');
      }

      const vcard = await vcardService.updateVCard(id, userId, req.body);

      if (!vcard) {
        throw createError(404, 'vCard not found or access denied');
      }

      const response: ApiResponse<typeof vcard> = {
        success: true,
        data: vcard
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Delete vCard
router.delete('/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid vCard ID')
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string || req.user?.id;

      if (!userId) {
        throw createError(401, 'Authentication required');
      }

      const deleted = await vcardService.deleteVCard(id, userId);

      if (!deleted) {
        throw createError(404, 'vCard not found or access denied');
      }

      const response: ApiResponse<{ deleted: boolean }> = {
        success: true,
        data: { deleted: true }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
