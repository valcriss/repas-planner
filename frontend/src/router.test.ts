import { describe, it, expect } from 'vitest'
import { routes } from './router'

describe('router', () => {
  it('should have recipe and menu routes', () => {
    const paths = routes.map(r => r.path)
    expect(paths).toContain('/recipes')
    expect(paths).toContain('/recipes/:id')
    expect(paths).toContain('/recipes/:id/edit')
    expect(paths).toContain('/recipes/add')
    expect(paths).toContain('/menu')
  })
})
