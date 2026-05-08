/**
 * Express App Factory
 * Creates and configures the Express application with all middleware
 */

import Express from 'express';
import { loggingMiddleware } from './middleware/logging.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import geminiRouter from './routes/gemini.js';
import { config } from '../config/core.js';

/**
 * Create and configure Express application
 */
export function createApp() {
  const app = new Express();

  // Body parsing middleware
  app.use(Express.json({ limit: '10mb' }));
  app.use(Express.urlencoded({ limit: '10mb', extended: true }));

  // Initialize request state
  app.use((req, res, next) => {
    req.state = {};
    next();
  });

  // Core middleware
  app.use(loggingMiddleware);
  app.use(corsMiddleware(config.corsOrigins));

  // Request timeout
  app.use((req, res, next) => {
    req.setTimeout(config.requestTimeoutMs);
    res.setTimeout(config.requestTimeoutMs);
    next();
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'gemini-flash-api',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: {
          GET: '/health',
          GET_live: '/live',
          GET_ready: '/ready',
          GET_metrics: '/metrics',
        },
        gemini: {
          POST_text: '/gemini/text',
          POST_image: '/gemini/image',
          POST_chat: '/gemini/chat',
          POST_document: '/gemini/document',
          POST_audio: '/gemini/audio',
        },
      },
    });
  });

  // Routes
  app.use(healthRouter);
  app.use('/gemini', geminiRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error_code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
