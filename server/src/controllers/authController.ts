import type { RequestHandler } from 'express';
import type { AppEnv } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from '../middlewares/errors.js';
import { hashPassword, verifyPassword } from '../services/auth/password.js';
import { issueSessionToken, sessionDurationMs } from '../services/auth/token.js';

function setSessionCookie(res: Parameters<RequestHandler>[1], env: AppEnv, token: string): void {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE === 'true',
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api',
    maxAge: sessionDurationMs(env.JWT_EXPIRES_IN),
  });
}

export function createAuthController(env: AppEnv) {
  const signup: RequestHandler = async (req, res, next) => {
    try {
      const email = String(req.body.email).toLowerCase();
      const exists = await User.exists({ email });
      if (exists) throw new HttpError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
      const user = await User.create({ name: req.body.name, email, passwordHash: await hashPassword(req.body.password) });
      setSessionCookie(res, env, issueSessionToken({ id: user.id, email: user.email }, env.JWT_SECRET, env.JWT_EXPIRES_IN));
      res.status(201).json({ data: { user: { id: user.id, name: user.name, email: user.email } } });
    } catch (error) { next(error); }
  };

  const login: RequestHandler = async (req, res, next) => {
    try {
      const email = String(req.body.email).toLowerCase();
      const user = await User.findOne({ email }).select('+passwordHash');
      const valid = user ? await verifyPassword(req.body.password, user.passwordHash) : false;
      if (!user || !valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
      setSessionCookie(res, env, issueSessionToken({ id: user.id, email: user.email }, env.JWT_SECRET, env.JWT_EXPIRES_IN));
      res.json({ data: { user: { id: user.id, name: user.name, email: user.email } } });
    } catch (error) { next(error); }
  };

  const logout: RequestHandler = (_req, res) => {
    res.clearCookie(env.COOKIE_NAME, { httpOnly: true, secure: env.COOKIE_SECURE === 'true', sameSite: env.COOKIE_SAME_SITE, path: '/api' });
    res.status(204).send();
  };

  const me: RequestHandler = async (req, res, next) => {
    try {
      const user = await User.findById(req.auth?.userId).select('name email');
      if (!user) throw new HttpError(401, 'UNAUTHENTICATED', 'Authentication is required');
      res.json({ data: { user: { id: user.id, name: user.name, email: user.email } } });
    } catch (error) { next(error); }
  };

  return { signup, login, logout, me };
}
