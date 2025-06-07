import { describe, it, expect, vi, beforeEach } from 'vitest'
import { routes } from './router'
let router: typeof import('./router').default
import * as api from './api'

/* global localStorage */

vi.mock('./api')

describe('router', () => {
  beforeEach(async () => {
    vi.resetModules()
    router = (await import('./router')).default
  })
  it('should have recipe and menu routes', () => {
    const paths = routes.map(r => r.path)
    expect(paths).toContain('/recipes')
    expect(paths).toContain('/recipes/:id')
    expect(paths).toContain('/recipes/:id/edit')
    expect(paths).toContain('/recipes/add')
    expect(paths).toContain('/menu')
    expect(paths).toContain('/stock')
    expect(paths).toContain('/login')
  })

  it('redirects to login when auth required', async () => {
    ;(api.checkAuthRequired as unknown as vi.Mock).mockResolvedValue({ required: true })
    router.push('/')
    await router.isReady()
    localStorage.removeItem('loggedIn')
    await router.push('/recipes')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows login page when auth required', async () => {
    ;(api.checkAuthRequired as unknown as vi.Mock).mockResolvedValue({ required: true })
    router.push('/')
    await router.isReady()
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows when auth not required', async () => {
    ;(api.checkAuthRequired as unknown as vi.Mock).mockResolvedValue({ required: false })
    router.push('/')
    await router.isReady()
    await router.push('/recipes')
    expect(router.currentRoute.value.path).toBe('/recipes')
  })

  it('allows when logged in', async () => {
    ;(api.checkAuthRequired as unknown as vi.Mock).mockResolvedValue({ required: true })
    localStorage.setItem('loggedIn', '1')
    router.push('/')
    await router.isReady()
    await router.push('/recipes')
    expect(router.currentRoute.value.path).toBe('/recipes')
  })
})
