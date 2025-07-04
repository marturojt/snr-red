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
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/qr', qrRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// URL redirect handler
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Import here to avoid circular dependency
    const { UrlService } = await import('./services/urlService');
    const { AnalyticsService } = await import('./services/analyticsService');
    
    const url = await UrlService.getByShortCode(shortCode);
    
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
    
    const url = await UrlService.getByShortCode(shortCode);
    
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

// Start server
async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
