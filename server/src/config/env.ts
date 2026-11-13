import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters'),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'Use a duration such as 30m, 1h, or 7d').default('1h'),
  COOKIE_NAME: z.string().min(1).default('testpilot_session'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  if (parsed.data.NODE_ENV === 'production' && parsed.data.COOKIE_SECURE !== 'true') {
    throw new Error('COOKIE_SECURE must be true in production');
  }
  if (parsed.data.COOKIE_SAME_SITE === 'none' && parsed.data.COOKIE_SECURE !== 'true') {
    throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE is none');
  }
  return parsed.data;
}
