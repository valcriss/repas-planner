import request from 'supertest';
import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';

vi.mock('../src/db', () => {
  return { default: { query: vi.fn() } };
});

let app: typeof import('../src/app').default;
import db from '../src/db';
const q = (db as { query: vi.Mock }).query;

let dir: string;

beforeAll(async () => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'front-'));
  writeFileSync(path.join(dir, 'index.html'), '');
  process.env.FRONTEND_PATH = dir;
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

beforeEach(() => {
  q.mockReset();
  delete process.env.AUTH_USERNAME;
  delete process.env.AUTH_PASSWORD;
});

describe('auth disabled', () => {
  beforeEach(async () => {
    app = (await import('../src/app')).default;
  });
  it('allows requests', async () => {
    q.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(200);
  });
});

describe('auth enabled', () => {
  beforeEach(async () => {
    process.env.AUTH_USERNAME = 'u';
    process.env.AUTH_PASSWORD = 'p';
    app = (await import('../src/app')).default;
  });
  it('rejects unauthenticated', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(401);
  });
  it('logs in and accesses route', async () => {
    const login = await request(app).post('/api/login').send({ username: 'u', password: 'p' });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0];
    q.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/recipes').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });
  it('rejects invalid login', async () => {
    const login = await request(app).post('/api/login').send({ username: 'x', password: 'y' });
    expect(login.status).toBe(401);
  });
});
