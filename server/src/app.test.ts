import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { Generation } from './models/Generation.js';
import type { AppEnv } from './config/env.js';

describe('authentication API', () => {
  let mongo: MongoMemoryServer;
  const env: AppEnv = {
    NODE_ENV: 'test', PORT: 4000, CLIENT_ORIGIN: 'http://localhost:5173',
    MONGODB_URI: 'mongodb://unused', JWT_SECRET: 'test-secret-with-at-least-thirty-two-characters',
    JWT_EXPIRES_IN: '1h', COOKIE_NAME: 'testpilot_session', COOKIE_SAME_SITE: 'lax', COOKIE_SECURE: 'false',
    GROQ_MODEL: 'test-model',
  };
  const app = createApp(env);

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await connectDatabase(mongo.getUri());
  });
  afterAll(async () => {
    await disconnectDatabase();
    await mongo.stop();
  });

  it('requires authentication for protected identity endpoint', async () => {
    const response = await request(app).get('/api/auth/me').expect(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('validates signup, creates an account, sets HttpOnly cookie, and serves authenticated identity', async () => {
    await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'invalid', password: 'weak' }).expect(400);
    const signup = await request(app).post('/api/auth/signup').send({ name: 'Ada Lovelace', email: 'ADA@example.com', password: 'SecurePassWord123' }).expect(201);
    expect(signup.body.data.user).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com' });
    expect(signup.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(signup.headers['set-cookie'][0]).toContain('Max-Age=3600');
    const cookie = signup.headers['set-cookie'][0].split(';')[0];
    await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200).expect(({ body }) => {
      expect(body.data.user.email).toBe('ada@example.com');
      expect(body.data.user).not.toHaveProperty('passwordHash');
    });
  });

  it('rejects duplicate signup and invalid login and clears session on logout', async () => {
    await request(app).post('/api/auth/signup').send({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'SecurePassWord123' }).expect(409);
    await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'wrong' }).expect(401);
    const login = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'SecurePassWord123' }).expect(200);
    expect(login.headers['set-cookie'][0]).toContain('HttpOnly');
    await request(app).post('/api/auth/logout').set('Cookie', login.headers['set-cookie'][0].split(';')[0]).expect(204);
  });

  it('returns a stable not-found response and does not leak internal errors', async () => {
    await request(app).get('/api/does-not-exist').expect(404).expect(({ body }) => expect(body.error.code).toBe('NOT_FOUND'));
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('creates and manages only projects owned by the authenticated user', async () => {
    await request(app).get('/api/projects').expect(401);
    const account = await request(app).post('/api/auth/signup').send({ name: 'Project Owner', email: 'owner@example.com', password: 'SecurePassWord123' }).expect(201);
    const ownerCookie = account.headers['set-cookie'][0].split(';')[0];
    await request(app).post('/api/projects').set('Cookie', ownerCookie).send({ projectName: 'Bad repository', repositoryUrl: 'http://127.0.0.1/private' }).expect(400);
    const created = await request(app).post('/api/projects').set('Cookie', ownerCookie).send({ projectName: 'Checkout API', description: 'Payment workflow', repositoryUrl: '' }).expect(201);
    const projectId = created.body.data.project.id as string;
    const generation = await Generation.create({ projectId, userId: account.body.data.user.id, generationType: 'unit', goal: 'Cover checkout totals', sourceCode: 'function total() { return 2; }', generatedContent: 'test("total", () => {});' });
    expect(created.body.data.project.projectName).toBe('Checkout API');
    await request(app).get('/api/projects').set('Cookie', ownerCookie).expect(200).expect(({ body }) => { expect(body.data.projects).toHaveLength(1); expect(body.data.projects[0].generationCount).toBe(1); });
    await request(app).get('/api/projects/dashboard').set('Cookie', ownerCookie).expect(200).expect(({ body }) => { expect(body.data.projectCount).toBe(1); expect(body.data.generationCount).toBe(1); expect(body.data.dailyActivity).toHaveLength(7); expect(body.data.recentGenerations[0]).toMatchObject({ projectId, goal: 'Cover checkout totals' }); });
    await request(app).get(`/api/projects/${projectId}/generations`).set('Cookie', ownerCookie).expect(200).expect(({ body }) => expect(body.data.generations).toHaveLength(1));
    await request(app).patch(`/api/projects/${projectId}/generations/${generation.id}`).set('Cookie', ownerCookie).send({ generatedContent: 'test("updated checkout", () => {});' }).expect(200).expect(({ body }) => expect(body.data.generation.generatedContent).toContain('updated checkout'));
    await request(app).patch(`/api/projects/${projectId}`).set('Cookie', ownerCookie).send({ description: 'Updated workflow' }).expect(200).expect(({ body }) => expect(body.data.project.description).toBe('Updated workflow'));
    const second = await request(app).post('/api/auth/signup').send({ name: 'Another User', email: 'another@example.com', password: 'SecurePassWord123' }).expect(201);
    await request(app).get(`/api/projects/${projectId}`).set('Cookie', second.headers['set-cookie'][0].split(';')[0]).expect(404);
    await request(app).delete(`/api/projects/${projectId}`).set('Cookie', ownerCookie).expect(204);
    await request(app).get(`/api/projects/${projectId}`).set('Cookie', ownerCookie).expect(404);
  });

  it('returns a clear setup response for real AI features without a provider key', async () => {
    const account = await request(app).post('/api/auth/signup').send({ name: 'AI User', email: 'ai@example.com', password: 'SecurePassWord123' }).expect(201);
    const cookie = account.headers['set-cookie'][0].split(';')[0];
    const created = await request(app).post('/api/projects').set('Cookie', cookie).send({ projectName: 'Tutor Project' }).expect(201);
    await request(app).post(`/api/projects/${created.body.data.project.id}/generations`).set('Cookie', cookie).send({ generationType: 'unit', goal: 'Test validation behavior', sourceCode: 'export function add(a: number, b: number) { return a + b; }' }).expect(503).expect(({ body }) => expect(body.error.code).toBe('AI_NOT_CONFIGURED'));
    await request(app).post(`/api/projects/${created.body.data.project.id}/tutor/messages`).set('Cookie', cookie).send({ threadId: 'f2d94416-b7ef-4b3f-9dd7-7564c235d013', message: 'Explain unit testing.' }).expect(503).expect(({ body }) => expect(body.error.code).toBe('AI_NOT_CONFIGURED'));
  });
});
