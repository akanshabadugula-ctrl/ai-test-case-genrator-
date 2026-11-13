import { Router } from 'express';
import type { AppEnv } from '../config/env.js';
import { createAuthController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import { loginSchema, signupSchema } from '../validators/auth.js';

export function createAuthRouter(env: AppEnv): Router {
  const router = Router();
  const controller = createAuthController(env);
  router.post('/signup', validateBody(signupSchema), controller.signup);
  router.post('/login', validateBody(loginSchema), controller.login);
  router.post('/logout', controller.logout);
  router.get('/me', authenticate(env), controller.me);
  return router;
}
