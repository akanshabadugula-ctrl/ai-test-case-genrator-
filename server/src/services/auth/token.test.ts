import { describe, expect, it } from 'vitest';
import { issueSessionToken, sessionDurationMs, verifySessionToken } from './token.js';

describe('session tokens', () => {
  const secret = 'test-only-secret-with-more-than-32-characters';
  it('issues and verifies signed claims', () => {
    const token = issueSessionToken({ id: 'user-1', email: 'a@example.com' }, secret, '1h');
    expect(verifySessionToken(token, secret)).toMatchObject({ sub: 'user-1', email: 'a@example.com' });
  });
  it('rejects a token signed with a different secret', () => {
    const token = issueSessionToken({ id: 'user-1', email: 'a@example.com' }, secret, '1h');
    expect(() => verifySessionToken(token, 'another-secret-with-more-than-32-characters')).toThrow();
  });
  it('maps supported JWT durations to matching persistent-cookie lifetimes', () => {
    expect(sessionDurationMs('30m')).toBe(30 * 60 * 1000);
    expect(sessionDurationMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
