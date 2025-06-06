import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchShoppingList } from './api'

const data = [{ id: 'i1', nom: 'Beurre', quantite: '700', unite: 'g' }]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchShoppingList', () => {
  it('returns ingredients', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) }))
    const res = await fetchShoppingList('w')
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/menus/w/shopping-list')
    expect(res).toEqual(data)
  })

  it('throws on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchShoppingList('w')).rejects.toThrow('Failed to fetch shopping list')
  })
})
