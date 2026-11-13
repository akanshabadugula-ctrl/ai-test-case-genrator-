import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { AppEnv } from '../config/env.js';
import { createProjectController } from '../controllers/projectController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validate.js';
import { createProjectSchema, generateTestsSchema, tutorMessageSchema, updateGenerationSchema, updateProjectSchema } from '../validators/projects.js';

export function createProjectRouter(env: AppEnv): Router {
  const router = Router();
  const auth = authenticate(env);
  const controller = createProjectController(env);
  const generationLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 12, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: { code: 'AI_RATE_LIMITED', message: 'Generation limit reached. Try again later.' } } });
  const tutorLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: { code: 'AI_RATE_LIMITED', message: 'Assistant message limit reached. Try again later.' } } });
  router.use(auth);
  router.get('/dashboard', controller.dashboard);
  router.get('/', controller.list);
  router.post('/', validateBody(createProjectSchema), controller.create);
  router.get('/:projectId', controller.get);
  router.patch('/:projectId', validateBody(updateProjectSchema), controller.update);
  router.delete('/:projectId', controller.remove);
  router.get('/:projectId/generations', controller.generations);
  router.post('/:projectId/generations', generationLimit, validateBody(generateTestsSchema), controller.generate);
  router.patch('/:projectId/generations/:generationId', validateBody(updateGenerationSchema), controller.updateGeneration);
  router.get('/:projectId/tutor/messages', controller.tutorHistory);
  router.post('/:projectId/tutor/messages', tutorLimit, validateBody(tutorMessageSchema), controller.tutorReply);
  return router;
}
