import { describe, expect, it } from 'vitest';
import { loginSchema, signupSchema } from './auth.js';

describe('auth request schemas', () => {
  it('accepts a valid signup and normalizes surrounding whitespace in name/email', () => {
    expect(signupSchema.parse({ name: ' Ada ', email: ' ada@example.com ', password: 'SecurePassWord123' })).toMatchObject({ name: 'Ada', email: 'ada@example.com' });
  });
  it('rejects weak passwords and unexpected input keys', () => {
    expect(signupSchema.safeParse({ name: 'Ada', email: 'ada@example.com', password: 'short' }).success).toBe(false);
    expect(signupSchema.safeParse({ name: 'Ada', email: 'ada@example.com', password: 'SecurePassWord123', role: 'admin' }).success).toBe(false);
  });
  it('rejects malformed login bodies', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
  });
});
