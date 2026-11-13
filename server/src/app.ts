import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import type { AppEnv } from './config/env.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createProjectRouter } from './routes/projectRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errors.js';

export function createApp(env: AppEnv) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' } }));
  app.use('/api/auth', createAuthRouter(env));
  app.use('/api/projects', createProjectRouter(env));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
