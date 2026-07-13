import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import urlRoutes from './routes/urls';
import analyticsRoutes from './routes/analytics';
import qrRoutes from './routes/qr';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import vcardRoutes from './routes/vcard';
import keysRoutes from './routes/keys';
import v1Routes from './routes/v1';
import { CleanupService } from './services/cleanupService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy when behind reverse proxy (Apache)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'development' ? '1000' : '100')),
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for development if on localhost
    if (process.env.NODE_ENV === 'development' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.includes('localhost'))) {
      return true;
    }
    return false;
  }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vcard', vcardRoutes);

// API key management (dashboard, JWT-protected) and public programmatic API (X-API-Key)
app.use('/api/keys', keysRoutes);
app.use('/api/v1', v1Routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// vCard page handler (before URL redirect to avoid conflicts)
app.get('/v/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Import here to avoid circular dependency
    const { vcardService } = await import('./services/vcardService');
    
    const vcard = await vcardService.getVCardByShortCode(shortCode);
    
    if (!vcard || !vcard.isActive) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>vCard Not Found</title>
        </head>
        <body>
          <h1>vCard Not Found</h1>
          <p>The requested vCard could not be found.</p>
        </body>
        </html>
      `);
    }

    // Redirect to frontend vCard page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/vcard/${shortCode}`);
  } catch (error) {
    console.error('Error serving vCard:', error);
    res.status(500).send('Internal Server Error');
  }
});

// URL redirect handler
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Import here to avoid circular dependency
    const { UrlService } = await import('./services/urlService');
    const { AnalyticsService } = await import('./services/analyticsService');

    // Update lastAccessedAt so inactivity-based cleanup counts from last click
    const url = await UrlService.getByShortCodeAndUpdateAccess(shortCode);

    if (!url || !url.isActive) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ error: 'URL has expired' });
    }

    // Track analytics
    await AnalyticsService.trackClick(url.id, req);

    res.redirect(301, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Specific redirect route for Apache proxy
app.get('/redirect/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Import here to avoid circular dependency
    const { UrlService } = await import('./services/urlService');
    const { AnalyticsService } = await import('./services/analyticsService');

    // Update lastAccessedAt so inactivity-based cleanup counts from last click
    const url = await UrlService.getByShortCodeAndUpdateAccess(shortCode);

    if (!url || !url.isActive) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>URL Not Found - snr.red</title></head>
        <body>
          <h1>URL Not Found</h1>
          <p>The short URL you're looking for doesn't exist or has been removed.</p>
          <p><a href="https://snr.red">Create a new short URL</a></p>
        </body>
        </html>
      `);
    }
    
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head><title>URL Expired - snr.red</title></head>
        <body>
          <h1>URL Expired</h1>
          <p>This short URL has expired and is no longer available.</p>
          <p><a href="https://snr.red">Create a new short URL</a></p>
        </body>
        </html>
      `);
    }
    
    // Track analytics
    await AnalyticsService.trackClick(url.id, req);
    
    res.redirect(301, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error - snr.red</title></head>
      <body>
        <h1>Something went wrong</h1>
        <p>We're experiencing technical difficulties. Please try again later.</p>
        <p><a href="https://snr.red">Go to snr.red</a></p>
      </body>
      </html>
    `);
  }
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Fail fast in production if critical secrets are missing or left at insecure defaults
function validateEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  const insecureSecrets = [
    'your-secret-key-change-this-in-production',
    'your-super-secret-jwt-key-change-this-in-production',
    'dev-only-insecure-secret-change-me',
    'super-secure-random-jwt-secret-32-chars-minimum'
  ];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || insecureSecrets.includes(jwtSecret) || jwtSecret.length < 32) {
    console.error(
      '❌ FATAL: JWT_SECRET must be set to a unique random value of at least 32 characters in production.'
    );
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ FATAL: MONGODB_URI must be set in production.');
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    validateEnv();
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });

    // Start cleanup service
    startCleanupService();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Cleanup service
function startCleanupService() {
  // Run cleanup every 24 hours
  const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  setInterval(async () => {
    try {
      console.log('🧹 Starting URL cleanup...');
      const result = await CleanupService.cleanupExpiredUrls();
      console.log(`✅ Cleanup completed: ${result.deletedCount} URLs deleted`);
      console.log(`   - Anonymous: ${result.anonymousDeleted}`);
      console.log(`   - Free: ${result.freeDeleted}`);
      console.log(`   - Premium: ${result.premiumDeleted}`);
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }, cleanupInterval);

  // Run initial cleanup after 5 minutes
  setTimeout(async () => {
    try {
      console.log('🧹 Running initial cleanup...');
      const result = await CleanupService.cleanupExpiredUrls();
      console.log(`✅ Initial cleanup completed: ${result.deletedCount} URLs deleted`);
    } catch (error) {
      console.error('❌ Initial cleanup failed:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

startServer();

export default app;
