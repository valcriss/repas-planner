import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/db', () => {
  return {
    default: { query: vi.fn() }
  };
});

import app from '../src/app';
import db from '../src/db';

const mockedQuery = (db as { query: vi.Mock }).query;

beforeEach(() => {
  mockedQuery.mockReset();
});

describe('GET /', () => {
  it('returns API message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Repas Planner API');
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

