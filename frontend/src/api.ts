export const API_BASE_URL = 'http://localhost:3000'

export interface RecipePayload {
  nom: string
  ingredient_principal_id: string
  instructions?: string
  ingredient_secondaire_id?: string
  image_url?: string
}

export async function fetchRecipes() {
  const res = await globalThis.fetch(`${API_BASE_URL}/recipes`)
  if (!res.ok) {
    throw new Error('Failed to fetch recipes')
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
