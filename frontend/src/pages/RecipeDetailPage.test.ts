import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { messages } from '../i18n'
import RecipeDetailPage from './RecipeDetailPage.vue'
import { routes } from '../router'
import * as api from '../api'

vi.mock('../api')

const recipe = {
  id: 'r1',
  nom: 'Recette',
  instructions: 'Inst',
  image_url: 'img',
  ingredient_principal_id: null,
  ingredient_secondaire_id: null
}

async function setup() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/recipes/r1')
  await router.isReady()
  const i18n = createI18n({ legacy: false, locale: 'en', messages })
  const wrapper = mount(RecipeDetailPage, { global: { plugins: [router, i18n] } })
  return { wrapper, router }
}

describe('RecipeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('shows recipe and goes back', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockResolvedValue(recipe)
    ;(api.fetchRecipeIngredients as unknown as Mock).mockResolvedValue([])
    const { wrapper, router } = await setup()
    await flushPromises()
    const backSpy = vi.spyOn(router, 'back')
    await wrapper.get('button').trigger('click')
    expect(backSpy).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Recette')
  })

  it('does not show image when none', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockResolvedValue({ ...recipe, image_url: null })
    ;(api.fetchRecipeIngredients as unknown as Mock).mockResolvedValue([])
    const { wrapper } = await setup()
    await flushPromises()
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('removes recipe when confirmed', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockResolvedValue(recipe)
    ;(api.fetchRecipeIngredients as unknown as Mock).mockResolvedValue([])
    ;(api.deleteRecipe as unknown as Mock).mockResolvedValue({})
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    const { wrapper, router } = await setup()
    await flushPromises()
    const pushSpy = vi.spyOn(router, 'push')
    await wrapper.findAll('button')[1].trigger('click')
    expect(api.deleteRecipe).toHaveBeenCalledWith('r1')
    expect(pushSpy).toHaveBeenCalledWith('/recipes')
  })

  it('cancels remove when not confirmed', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockResolvedValue(recipe)
    ;(api.fetchRecipeIngredients as unknown as Mock).mockResolvedValue([])
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false)
    const { wrapper } = await setup()
    await flushPromises()
    await wrapper.findAll('button')[1].trigger('click')
    expect(api.deleteRecipe).not.toHaveBeenCalled()
  })

  it('handles delete errors', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockResolvedValue(recipe)
    ;(api.fetchRecipeIngredients as unknown as Mock).mockResolvedValue([])
    ;(api.deleteRecipe as unknown as Mock).mockRejectedValue(new Error('fail'))
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    const { wrapper } = await setup()
    await flushPromises()
    await wrapper.findAll('button')[1].trigger('click')
    expect(api.deleteRecipe).toHaveBeenCalled()
  })

  it('returns early when recipe is null', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockResolvedValue(recipe)
    ;(api.fetchRecipeIngredients as unknown as Mock).mockResolvedValue([])
    const { wrapper } = await setup()
    await flushPromises()
    // set recipe to null and attempt remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(wrapper.vm as any).recipe = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).remove()
    expect(api.deleteRecipe).not.toHaveBeenCalled()
  })

  it('handles fetch errors', async () => {
    ;(api.fetchRecipe as unknown as Mock).mockRejectedValue(new Error('fail'))
    ;(api.fetchRecipeIngredients as unknown as Mock).mockRejectedValue(new Error('fail'))
    const { wrapper } = await setup()
    await flushPromises()
    expect(wrapper.text()).toBe('')
  })
})
