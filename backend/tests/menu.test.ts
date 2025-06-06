import { describe, it, expect } from 'vitest'
import { generateMenuEntries } from '../src/menu'

describe('generateMenuEntries', () => {
  it('avoids ingredient repetition', () => {
    const recipes = [
      { id: 'r1', ingredient_principal_id: 'i1', ingredient_secondaire_id: null },
      { id: 'r2', ingredient_principal_id: 'i1', ingredient_secondaire_id: null },
      { id: 'r3', ingredient_principal_id: 'i2', ingredient_secondaire_id: null }
    ]
    const sel = { lundi: { dejeuner: true, diner: true } }
    const res = generateMenuEntries(recipes, sel)
    expect(res).toHaveLength(2)
    expect(res[0].recipe_id).toBe('r1')
    expect(res[1].recipe_id).toBe('r3')
  })
})
