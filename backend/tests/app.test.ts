import request from 'supertest';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';

vi.mock('../src/db', () => {
  return {
    default: { query: vi.fn() }
  };
});

let app: typeof import('../src/app').default;
import db from '../src/db';

const mockedQuery = (db as { query: vi.Mock }).query;

beforeEach(() => {
  mockedQuery.mockReset();
});

let tempDir: string;

beforeAll(async () => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'front-'));
  writeFileSync(path.join(tempDir, 'index.html'), 'hello');
  process.env.FRONTEND_PATH = tempDir;
  app = (await import('../src/app')).default;
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('Frontend serving', () => {
  it('serves index.html at root', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello');
  });

  it('serves index.html for other paths', async () => {
    const res = await request(app).get('/random');
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello');
  });
});

describe('GET /recipes/:id/ingredients', () => {
  it('returns list of ingredients', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: '1', nom: 'Tomate', quantite: '2', unite: 'pcs' }] });
    const res = await request(app).get('/recipes/123/ingredients');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: '1', nom: 'Tomate', quantite: '2', unite: 'pcs' }]);
    expect(mockedQuery).toHaveBeenCalled();
  });
});

describe('GET /unites', () => {
  it('searches units', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'u1', nom: 'kg' }] });
    const res = await request(app).get('/unites?search=k');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'u1', nom: 'kg' }]);
    expect(mockedQuery).toHaveBeenCalled();
  });
});

describe('GET /menus/:week/shopping-list', () => {
  it('returns aggregated ingredients', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'i1', nom: 'Beurre', quantite: '700', unite: 'g' }] });
    const res = await request(app).get('/menus/2024-W01/shopping-list');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'i1', nom: 'Beurre', quantite: '700', unite: 'g' }]);
  });

  it('handles errors', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).get('/menus/2024-W01/shopping-list');
    expect(res.status).toBe(500);
  });
});

describe('Static frontend', () => {
  it('serves index.html', async () => {
    const res = await request(app).get('/index.html');
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello');
  });
});

