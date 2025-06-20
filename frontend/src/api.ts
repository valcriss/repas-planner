/* global RequestInfo, RequestInit, localStorage, location */
export function getApiBaseUrl(env: { PROD: boolean } = import.meta.env) {
  return env.PROD ? `${globalThis.location.origin}/api` : 'http://localhost:3000/api'
}

export const API_BASE_URL = getApiBaseUrl()

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const res = await globalThis.fetch(input, { credentials: 'include', ...init })
  if (res.status === 401) {
    localStorage.removeItem('loggedIn')
    location.assign('/login')
  }
  return res
}

export async function checkAuthRequired() {
  const res = await apiFetch(`${API_BASE_URL}/auth-required`)
  return res.json() as Promise<{ required: boolean }>
}

export async function login(username: string, password: string) {
  const res = await apiFetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function logout() {
  await apiFetch(`${API_BASE_URL}/logout`, { method: 'POST' })
  localStorage.removeItem('loggedIn')
}

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
  const res = await apiFetch(`${API_BASE_URL}/recipes`)
  if (!res.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return res.json()
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  const res = await apiFetch(`${API_BASE_URL}/recipes/${id}`)
  if (!res.ok) {
    throw new Error('Failed to fetch recipe')
  }
  return res.json()
}

export async function fetchRecipeIngredients(id: string): Promise<RecipeIngredient[]> {
  const res = await apiFetch(`${API_BASE_URL}/recipes/${id}/ingredients`)
  if (!res.ok) {
    throw new Error('Failed to fetch ingredients')
  }
  return res.json()
}

export async function createRecipe(payload: RecipePayload) {
  const res = await apiFetch(`${API_BASE_URL}/recipes`, {
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
  const res = await apiFetch(`${API_BASE_URL}/recipes/${id}`, {
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
  const res = await apiFetch(`${API_BASE_URL}/recipes/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    throw new Error('Failed to delete recipe')
  }
}

export async function searchIngredients(search: string): Promise<Ingredient[]> {
  const params = new globalThis.URLSearchParams()
  params.set('search', search)
  const res = await apiFetch(`${API_BASE_URL}/ingredients?${params.toString()}`)
  if (!res.ok) {
    throw new Error('Failed to fetch ingredients')
  }
  return res.json()
}

export async function fetchAllIngredients(): Promise<Ingredient[]> {
  const res = await apiFetch(`${API_BASE_URL}/ingredients/all`)
  if (!res.ok) {
    throw new Error('Failed to fetch ingredients')
  }
  return res.json()
}

export async function searchUnites(search: string): Promise<Unite[]> {
  const params = new globalThis.URLSearchParams()
  params.set('search', search)
  const res = await apiFetch(`${API_BASE_URL}/unites?${params.toString()}`)
  if (!res.ok) {
    throw new Error('Failed to fetch unites')
  }
  return res.json()
}

export async function fetchAllUnites(): Promise<Unite[]> {
  const res = await apiFetch(`${API_BASE_URL}/unites/all`)
  if (!res.ok) {
    throw new Error('Failed to fetch unites')
  }
  return res.json()
}

export interface MenuRecipe {
  jour: string
  moment: 'dejeuner' | 'diner'
  recipe_id: string | null
  recipe_nom: string | null
}

export interface Menu {
  id: string | null
  semaine: string
  recettes: MenuRecipe[]
}

export async function fetchMenu(week: string): Promise<Menu> {
  const res = await apiFetch(`${API_BASE_URL}/menus/${week}`)
  if (!res.ok) throw new Error('Failed to fetch menu')
  return res.json()
}

export async function generateMenu(week: string, selection: Record<string, { dejeuner: boolean; diner: boolean }>) {
  const res = await apiFetch(`${API_BASE_URL}/menus/${week}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selection })
  })
  if (!res.ok) throw new Error('Failed to generate menu')
  return res.json()
}

export interface ShoppingIngredient {
  id: string
  nom: string
  quantite: string
  unite: string | null
  manque?: string
}

export async function fetchShoppingList(week: string): Promise<ShoppingIngredient[]> {
  const res = await apiFetch(`${API_BASE_URL}/menus/${week}/shopping-list`)
  if (!res.ok) throw new Error('Failed to fetch shopping list')
  return res.json()
}

export async function exportRecipes() {
  const res = await apiFetch(`${API_BASE_URL}/recipes/export`)
  if (!res.ok) throw new Error('Failed to export recipes')
  return res.json()
}

export async function importRecipes(data: unknown) {
  const res = await apiFetch(`${API_BASE_URL}/recipes/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to import recipes')
}

export interface StockItem {
  id: string
  nom: string
  quantite: string
  unite: string | null
}

export async function fetchStock(): Promise<StockItem[]> {
  const res = await apiFetch(`${API_BASE_URL}/stock`)
  if (!res.ok) throw new Error('Failed to fetch stock')
  return res.json()
}

export async function updateStock(id: string, quantite: string) {
  const res = await apiFetch(`${API_BASE_URL}/stock/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantite })
  })
  if (!res.ok) throw new Error('Failed to update stock')
}

export async function markRecipeDone(week: string, day: string, moment: 'dejeuner' | 'diner') {
  const res = await apiFetch(`${API_BASE_URL}/menus/${week}/${day}/${moment}/done`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to mark done')
}
