import request from 'supertest';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';

vi.mock('../src/db', () => {
  const query = vi.fn();
  return {
    default: {
      query,
      connect: vi.fn(() => ({ query, release: vi.fn() }))
    }
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
    const res = await request(app).get('/api/recipes/123/ingredients');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: '1', nom: 'Tomate', quantite: '2', unite: 'pcs' }]);
    expect(mockedQuery).toHaveBeenCalled();
  });
});

describe('GET /unites', () => {
  it('searches units', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'u1', nom: 'kg' }] });
    const res = await request(app).get('/api/unites?search=k');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'u1', nom: 'kg' }]);
    expect(mockedQuery).toHaveBeenCalled();
  });
});

describe('GET /ingredients/all and /unites/all', () => {
  it('lists all items', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'i1', nom: 'Tomate', unite: 'kg' }] });
    const resIng = await request(app).get('/api/ingredients/all');
    expect(resIng.status).toBe(200);
    expect(resIng.body[0].nom).toBe('Tomate');
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'u1', nom: 'kg' }] });
    const resU = await request(app).get('/api/unites/all');
    expect(resU.status).toBe(200);
    expect(resU.body[0].nom).toBe('kg');
  });
});

describe('GET /menus/:week/shopping-list', () => {
  it('returns aggregated ingredients', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'i1', nom: 'Beurre', quantite: '700', unite: 'g', manque: '200' }] });
    const res = await request(app).get('/api/menus/2024-W01/shopping-list');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'i1', nom: 'Beurre', quantite: '700', unite: 'g', manque: '200' }]);
  });

  it('handles errors', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).get('/api/menus/2024-W01/shopping-list');
    expect(res.status).toBe(500);
  });
});

describe('stock routes', () => {
  it('lists stock', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/stock');
    expect(res.status).toBe(200);
  });

  it('updates stock', async () => {
    mockedQuery.mockResolvedValueOnce({});
    const res = await request(app).put('/api/stock/i1').send({ quantite: 1 });
    expect(res.status).toBe(204);
  });
});

describe('POST /menus/:week/:jour/:moment/done', () => {
  it('updates stock based on recipe', async () => {
    mockedQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ recipe_id: 'r' }] })
      .mockResolvedValueOnce({ rows: [{ ingredient_id: 'i', quantite: 1 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
    const res = await request(app).post('/api/menus/2024-W01/lundi/dejeuner/done');
    expect(res.status).toBe(204);
  });
});

describe('Static frontend', () => {
  it('serves index.html', async () => {
    const res = await request(app).get('/index.html');
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello');
  });
});

