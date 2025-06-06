import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/db', () => {
  const query = vi.fn()
  return {
    default: {
      query,
      connect: vi.fn(() => ({ query, release: vi.fn() }))
    }
  }
})

import app from '../src/app'
import db from '../src/db'

const mockedQuery = (db as { query: vi.Mock }).query

beforeEach(() => {
  mockedQuery.mockReset()
})

describe('PUT /recipes/:id', () => {
  it('cleans unused ingredients and units', async () => {
    mockedQuery
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{}] }) // UPDATE recipes
      .mockResolvedValueOnce({}) // DELETE recipe_ingredients
      .mockResolvedValueOnce({ rows: [{ unite_id: 'u1' }] }) // DELETE ingredients
      .mockResolvedValueOnce({ rows: [] }) // SELECT ingredients
      .mockResolvedValueOnce({}) // DELETE unites
      .mockResolvedValueOnce({}) // COMMIT
    const res = await request(app)
      .put('/recipes/r1')
      .send({ nom: 'r', ingredient_principal_id: 'i1', ingredients: [] })
    expect(res.status).toBe(200)
    const calls = mockedQuery.mock.calls.map(c => c[0])
    expect(calls.some(q => q.includes('DELETE FROM ingredients'))).toBe(true)
    expect(calls.some(q => q.includes('DELETE FROM unites'))).toBe(true)
  })
})
