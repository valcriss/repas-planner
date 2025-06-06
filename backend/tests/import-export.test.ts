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
const mockedConnect = (db as { connect: vi.Mock }).connect

beforeEach(() => {
  mockedQuery.mockReset()
  mockedConnect.mockReset()
})

describe('GET /recipes/export', () => {
  it('returns export data', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const res = await request(app).get('/api/recipes/export')
    expect(res.status).toBe(200)
    expect(mockedQuery).toHaveBeenCalledTimes(4)
  })
})

describe('POST /recipes/import', () => {
  it('imports when not existing', async () => {
    const q = vi.fn()
    mockedConnect.mockResolvedValue({ query: q, release: vi.fn() })
    q.mockResolvedValue({ rows: [] })
    const res = await request(app).post('/api/recipes/import').send({ recipes: [{ nom: 'r', ingredients: [{ nom: 'i', quantite: '1', unite: 'u' }] }] })
    expect(res.status).toBe(500)
    expect(q).toHaveBeenCalled()
  })
  it('rejects invalid data', async () => {
    const res = await request(app).post('/api/recipes/import').send({})
    expect(res.status).toBe(400)
  })
})
