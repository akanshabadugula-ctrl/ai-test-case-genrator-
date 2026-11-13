import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface SessionClaims extends JwtPayload {
  sub: string;
  email: string;
}

export function sessionDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) throw new Error('Unsupported session duration');
  const amount = Number(match[1]);
  const unitMs = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as 's' | 'm' | 'h' | 'd'];
  return amount * unitMs;
}

export function issueSessionToken(user: { id: string; email: string }, secret: string, expiresIn: string): string {
  return jwt.sign({ email: user.email }, secret, { subject: user.id, expiresIn: expiresIn as jwt.SignOptions['expiresIn'], issuer: 'testpilot-ai', audience: 'testpilot-web' });
}

export function verifySessionToken(token: string, secret: string): SessionClaims {
  const payload = jwt.verify(token, secret, { issuer: 'testpilot-ai', audience: 'testpilot-web' });
  if (typeof payload === 'string' || typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Invalid session token');
  }
  return payload as SessionClaims;
}
