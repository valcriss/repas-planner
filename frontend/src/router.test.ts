import { describe, it, expect } from 'vitest'
import { routes } from './router'

describe('router', () => {
  it('should have recipe and menu routes', () => {
    const paths = routes.map(r => r.path)
    expect(paths).toContain('/recipes')
    expect(paths).toContain('/menu')
  })
})
