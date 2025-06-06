export interface RecipeRow {
  id: string
  ingredient_principal_id: string | null
  ingredient_secondaire_id: string | null
  last_used: string | null
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
  const usedMain = new Set<string>()
  const usedSecondary = new Map<string, number>()
  const result: MenuEntry[] = []
  const pool = recipes
    .slice()
    .sort((a, b) => {
      if (a.last_used === b.last_used) return 0
      if (a.last_used === null) return -1
      if (b.last_used === null) return 1
      return a.last_used.localeCompare(b.last_used)
    })
  for (const jour of Object.keys(selection)) {
    for (const moment of ['dejeuner', 'diner'] as const) {
      if (!selection[jour][moment]) continue
      const idx = pool.findIndex(r => {
        const a = r.ingredient_principal_id
        const b = r.ingredient_secondaire_id
        const count = b ? usedSecondary.get(b) ?? 0 : 0
        return (!a || !usedMain.has(a)) && (!b || count < 2)
      })
      if (idx === -1) {
        result.push({ jour, moment, recipe_id: null })
      } else {
        const r = pool.splice(idx, 1)[0]
        if (r.ingredient_principal_id) usedMain.add(r.ingredient_principal_id)
        if (r.ingredient_secondaire_id) {
          const count = usedSecondary.get(r.ingredient_secondaire_id) ?? 0
          usedSecondary.set(r.ingredient_secondaire_id, count + 1)
        }
        result.push({ jour, moment, recipe_id: r.id })
      }
    }
  }
  return result
}
