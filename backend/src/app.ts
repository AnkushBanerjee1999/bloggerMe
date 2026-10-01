import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { config } from './config/index.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    }),
  );
  app.use(cookieParser());

  // Body parsing with size limits
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Compression
  app.use(compression());

  // Rate limiting
  app.use('/api', apiRateLimiter);

  // Request logging
  app.use(requestLogger);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1', apiRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}
