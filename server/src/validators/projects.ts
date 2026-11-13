import { z } from 'zod';

const optionalRepoUrl = z.string().trim().max(2048).url().refine((value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname === 'github.com' && parsed.username === '' && parsed.password === '';
  } catch { return false; }
}, 'Use a valid HTTPS GitHub repository URL').or(z.literal(''));

export const createProjectSchema = z.object({
  projectName: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().default(''),
  repositoryUrl: optionalRepoUrl.optional().default(''),
}).strict();

export const updateProjectSchema = createProjectSchema.partial().refine((value) => Object.keys(value).length > 0);

export const generateTestsSchema = z.object({
  generationType: z.enum(['unit', 'integration', 'api', 'edge', 'validation']),
  goal: z.string().trim().min(5).max(500),
  sourceCode: z.string().trim().min(8).max(20_000),
}).strict();

export const tutorMessageSchema = z.object({
  threadId: z.string().uuid(),
  mode: z.enum(['tutor', 'voice']).default('tutor'),
  message: z.string().trim().min(1).max(8_000),
  sourceCode: z.string().max(20_000).optional().default(''),
}).strict();

export const updateGenerationSchema = z.object({ generatedContent: z.string().trim().min(1).max(40_000) }).strict();
