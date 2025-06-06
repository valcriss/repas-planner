import { describe, it, expect } from 'vitest'
import { generateMenuEntries } from '../src/menu'

describe('generateMenuEntries', () => {
  it('avoids main ingredient repetition', () => {
    const recipes = [
      { id: 'r1', ingredient_principal_id: 'i1', ingredient_secondaire_id: null, last_used: null },
      { id: 'r2', ingredient_principal_id: 'i1', ingredient_secondaire_id: null, last_used: null },
      { id: 'r3', ingredient_principal_id: 'i2', ingredient_secondaire_id: null, last_used: null }
    ]
    const sel = { lundi: { dejeuner: true, diner: true } }
    const res = generateMenuEntries(recipes, sel)
    expect(res).toHaveLength(2)
    expect(res[0].recipe_id).toBe('r1')
    expect(res[1].recipe_id).toBe('r3')
  })

  it('allows secondary ingredient twice at most', () => {
    const recipes = [
      { id: 'r1', ingredient_principal_id: 'i1', ingredient_secondaire_id: 's1', last_used: null },
      { id: 'r2', ingredient_principal_id: 'i2', ingredient_secondaire_id: 's1', last_used: null },
      { id: 'r3', ingredient_principal_id: 'i3', ingredient_secondaire_id: 's1', last_used: null },
      { id: 'r4', ingredient_principal_id: 'i4', ingredient_secondaire_id: 's2', last_used: null }
    ]
    const sel = {
      lundi: { dejeuner: true, diner: true },
      mardi: { dejeuner: true, diner: true }
    }
    const res = generateMenuEntries(recipes, sel)
    expect(res.map(r => r.recipe_id)).toEqual(['r1', 'r2', 'r4', null])
  })

  it('prioritizes recipes least recently used', () => {
    const recipes = [
      { id: 'r1', ingredient_principal_id: 'i1', ingredient_secondaire_id: null, last_used: '2024-W05' },
      { id: 'r2', ingredient_principal_id: 'i2', ingredient_secondaire_id: null, last_used: '2024-W01' }
    ]
    const sel = { lundi: { dejeuner: true, diner: false } }
    const res = generateMenuEntries(recipes, sel)
    expect(res[0].recipe_id).toBe('r2')
  })

  it('fills with null when no recipe fits', () => {
    const recipes = [
      { id: 'r1', ingredient_principal_id: 'i1', ingredient_secondaire_id: null, last_used: null }
    ]
    const sel = { lundi: { dejeuner: true, diner: true } }
    const res = generateMenuEntries(recipes, sel)
    expect(res[0].recipe_id).toBe('r1')
    expect(res[1].recipe_id).toBeNull()
  })
})
