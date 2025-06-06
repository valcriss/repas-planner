export const API_BASE_URL = 'http://localhost:3000'

export interface RecipePayload {
  nom: string
  ingredient_principal_id: string
  instructions?: string
  ingredient_secondaire_id?: string
  image_url?: string
  ingredients?: RecipeIngredientPayload[]
}

export interface RecipeIngredientPayload {
  id?: string
  nom: string
  quantite: string
  unite: string
}

export interface Ingredient {
  id: string
  nom: string
  unite: string | null
}

export interface Recipe {
  id: string
  nom: string
  instructions: string | null
  image_url: string | null
  ingredient_principal_id: string | null
  ingredient_secondaire_id: string | null
}

export interface RecipeIngredient {
  id: string
  nom: string
  quantite: string
  unite: string
}

export interface Unite {
  id: string
  nom: string
}

export async function fetchRecipes() {
  const res = await globalThis.fetch(`${API_BASE_URL}/recipes`)
  if (!res.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return res.json()
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  const res = await globalThis.fetch(`${API_BASE_URL}/recipes/${id}`)
  if (!res.ok) {
    throw new Error('Failed to fetch recipe')
  }
  return res.json()
}

export async function fetchRecipeIngredients(id: string): Promise<RecipeIngredient[]> {
  const res = await globalThis.fetch(`${API_BASE_URL}/recipes/${id}/ingredients`)
  if (!res.ok) {
    throw new Error('Failed to fetch ingredients')
  }
  return res.json()
}

export async function createRecipe(payload: RecipePayload) {
  const res = await globalThis.fetch(`${API_BASE_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error('Failed to create recipe')
  }
  return res.json()
}

export async function updateRecipe(id: string, payload: RecipePayload) {
  const res = await globalThis.fetch(`${API_BASE_URL}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error('Failed to update recipe')
  }
  return res.json()
}

export async function deleteRecipe(id: string) {
  const res = await globalThis.fetch(`${API_BASE_URL}/recipes/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    throw new Error('Failed to delete recipe')
  }
}

export async function searchIngredients(search: string): Promise<Ingredient[]> {
  const params = new globalThis.URLSearchParams()
  params.set('search', search)
  const res = await globalThis.fetch(`${API_BASE_URL}/ingredients?${params.toString()}`)
  if (!res.ok) {
    throw new Error('Failed to fetch ingredients')
  }
  return res.json()
}

export async function searchUnites(search: string): Promise<Unite[]> {
  const params = new globalThis.URLSearchParams()
  params.set('search', search)
  const res = await globalThis.fetch(`${API_BASE_URL}/unites?${params.toString()}`)
  if (!res.ok) {
    throw new Error('Failed to fetch unites')
  }
  return res.json()
}

export interface MenuRecipe {
  jour: string
  moment: 'dejeuner' | 'diner'
  recipe_id: string | null
}

export interface Menu {
  id: string | null
  semaine: string
  recettes: MenuRecipe[]
}

export async function fetchMenu(week: string): Promise<Menu> {
  const res = await globalThis.fetch(`${API_BASE_URL}/menus/${week}`)
  if (!res.ok) throw new Error('Failed to fetch menu')
  return res.json()
}

export async function generateMenu(week: string, selection: Record<string, { dejeuner: boolean; diner: boolean }>) {
  const res = await globalThis.fetch(`${API_BASE_URL}/menus/${week}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selection })
  })
  if (!res.ok) throw new Error('Failed to generate menu')
  return res.json()
}
