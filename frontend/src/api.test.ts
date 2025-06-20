import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchShoppingList, exportRecipes, importRecipes, getApiBaseUrl, checkAuthRequired, login, apiFetch, fetchAllIngredients, fetchAllUnites } from './api'

/* global localStorage */

const data = [{ id: 'i1', nom: 'Beurre', quantite: '700', unite: 'g' }]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchShoppingList', () => {
  it('returns ingredients', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) }))
    const res = await fetchShoppingList('w')
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/api/menus/w/shopping-list', { credentials: 'include' })
    expect(res).toEqual(data)
  })

  it('throws on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchShoppingList('w')).rejects.toThrow('Failed to fetch shopping list')
  })
})

describe('fetchAllIngredients/unites', () => {
  it('returns lists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([{ id: 'i1', nom: 'Tomate' }]) }))
    const resIng = await fetchAllIngredients()
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/api/ingredients/all', { credentials: 'include' })
    expect(resIng[0].nom).toBe('Tomate')
    ;(globalThis.fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve([{ id: 'u1', nom: 'kg' }]) })
    const resU = await fetchAllUnites()
    expect(resU[0].nom).toBe('kg')
  })

  it('throws on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchAllIngredients()).rejects.toThrow('Failed to fetch ingredients')
  })
})

describe('exportRecipes/importRecipes', () => {
  it('calls export and import endpoints', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }))
    await exportRecipes()
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/api/recipes/export', { credentials: 'include' })
    ;(globalThis.fetch as unknown as vi.Mock).mockResolvedValue({ ok: true })
    await importRecipes([])
    const call = (globalThis.fetch as unknown as vi.Mock).mock.calls[1]
    expect(call[0]).toBe('http://localhost:3000/api/recipes/import')
    expect(call[1].method).toBe('POST')
  })
})

describe('getApiBaseUrl', () => {
  it('returns dev url when PROD is false', () => {
    expect(getApiBaseUrl({ PROD: false })).toBe('http://localhost:3000/api')
  })

  it('returns location url when PROD is true', () => {
    vi.stubGlobal('location', { origin: 'https://site.example' })
    expect(getApiBaseUrl({ PROD: true })).toBe('https://site.example/api')
  })
})

describe('auth helpers', () => {
  it('checkAuthRequired fetches flag', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve({ required: true }) }))
    const res = await checkAuthRequired()
    expect(res.required).toBe(true)
  })

  it('login posts credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }))
    await login('a', 'b')
    const call = (globalThis.fetch as unknown as vi.Mock).mock.calls[0]
    expect(call[0]).toBe('http://localhost:3000/api/login')
    expect(call[1].credentials).toBe('include')
  })

  it('apiFetch redirects on 401', async () => {
    const response = { status: 401, ok: false }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    vi.stubGlobal('location', { assign: vi.fn() })
    localStorage.setItem('loggedIn', '1')
    const res = await apiFetch('url')
    expect(res).toBe(response)
    expect(localStorage.getItem('loggedIn')).toBeNull()
    expect(globalThis.location.assign).toHaveBeenCalledWith('/login')
  })
})
