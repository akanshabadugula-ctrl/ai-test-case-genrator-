import type { RequestHandler } from 'express';
import type { AppEnv } from '../config/env.js';
import { HttpError } from './errors.js';
import { verifySessionToken } from '../services/auth/token.js';

declare global {
  namespace Express {
    interface Request { auth?: { userId: string; email: string } }
  }
}

export function authenticate(env: AppEnv): RequestHandler {
  return (req, _res, next) => {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) return next(new HttpError(401, 'UNAUTHENTICATED', 'Authentication is required'));
    try {
      const claims = verifySessionToken(token, env.JWT_SECRET);
      req.auth = { userId: claims.sub, email: claims.email };
      next();
    } catch {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Session is invalid or expired'));
    }
  };
}
