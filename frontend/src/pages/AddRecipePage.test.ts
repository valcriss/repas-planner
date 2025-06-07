import { describe, it, expect, vi, type Mock } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { messages } from '../i18n'
import AddRecipePage from './AddRecipePage.vue'
import { routes } from '../router'
import * as api from '../api'

vi.mock('../api')

async function setup(path: string) {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push(path)
  await router.isReady()
  const i18n = createI18n({ legacy: false, locale: 'en', messages })
  return mount(AddRecipePage, {
    global: {
      plugins: [router, i18n],
      stubs: { IngredientInput: { template: '<div></div>' } }
    }
  })
}

describe('AddRecipePage edit', () => {
  it('loads recipe and updates on submit', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockResolvedValue({
      id: 'r1',
      nom: 'Recette',
      instructions: null,
      image_url: null,
      ingredient_principal_id: 'i1',
      ingredient_secondaire_id: null
    })
    ;(api.fetchRecipeIngredients as unknown as Mock).mockResolvedValue([
      { id: 'i1', nom: 'Ing', quantite: '1', unite: 'g' }
    ])
    ;(api.updateRecipe as unknown as Mock).mockResolvedValue({})

    const wrapper = await setup('/recipes/r1/edit')
    await wrapper.get('form').trigger('submit.prevent')
    expect(api.updateRecipe).toHaveBeenCalled()
  })
})
