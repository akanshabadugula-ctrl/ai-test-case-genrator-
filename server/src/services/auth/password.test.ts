import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password security', () => {
  it('hashes passwords and verifies only the matching value', async () => {
    const hash = await hashPassword('CorrectHorseBattery9');
    expect(hash).not.toBe('CorrectHorseBattery9');
    expect(await verifyPassword('CorrectHorseBattery9', hash)).toBe(true);
    expect(await verifyPassword('incorrect-password', hash)).toBe(false);
  });
});
