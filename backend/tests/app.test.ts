import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/app';

describe('GET /', () => {
  it('returns API message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Repas Planner API');
  });
});
