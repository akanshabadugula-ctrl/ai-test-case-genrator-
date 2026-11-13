import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

const valid = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017/testpilot_ai',
  JWT_SECRET: 'a-secret-value-longer-than-thirty-two-characters',
};

describe('environment validation', () => {
  it('requires a long JWT secret', () => {
    expect(() => loadEnv({ ...valid, JWT_SECRET: 'too-short' })).toThrow('JWT_SECRET');
  });
  it('requires secure cookies in production', () => {
    expect(() => loadEnv({ ...valid, NODE_ENV: 'production' })).toThrow('COOKIE_SECURE');
    expect(loadEnv({ ...valid, NODE_ENV: 'production', COOKIE_SECURE: 'true' }).COOKIE_SECURE).toBe('true');
  });
  it('requires secure cookies for SameSite=None', () => {
    expect(() => loadEnv({ ...valid, COOKIE_SAME_SITE: 'none' })).toThrow('COOKIE_SECURE');
  });
});
