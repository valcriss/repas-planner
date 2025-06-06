export interface RecipeRow {
  id: string
  ingredient_principal_id: string | null
  ingredient_secondaire_id: string | null
}

export interface Selection {
  [jour: string]: { dejeuner: boolean; diner: boolean }
}

export interface MenuEntry {
  jour: string
  moment: 'dejeuner' | 'diner'
  recipe_id: string | null
}

export function generateMenuEntries(recipes: RecipeRow[], selection: Selection): MenuEntry[] {
  const used = new Set<string>()
  const result: MenuEntry[] = []
  const pool = recipes.slice()
  for (const jour of Object.keys(selection)) {
    for (const moment of ['dejeuner', 'diner'] as const) {
      if (!selection[jour][moment]) continue
      const idx = pool.findIndex(r => {
        const a = r.ingredient_principal_id
        const b = r.ingredient_secondaire_id
        return (!a || !used.has(a)) && (!b || !used.has(b))
      })
      if (idx === -1) {
        result.push({ jour, moment, recipe_id: null })
      } else {
        const r = pool.splice(idx, 1)[0]
        if (r.ingredient_principal_id) used.add(r.ingredient_principal_id)
        if (r.ingredient_secondaire_id) used.add(r.ingredient_secondaire_id)
        result.push({ jour, moment, recipe_id: r.id })
      }
    }
  }
  return result
}
