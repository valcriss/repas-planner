import { describe, it, expect, vi, type Mock } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { messages } from '../i18n'
import RecipesPage from './RecipesPage.vue'
import { routes } from '../router'
import * as api from '../api'

vi.mock('../api')

async function setup() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/recipes')
  await router.isReady()
  const i18n = createI18n({ legacy: false, locale: 'en', messages })
  return mount(RecipesPage, { global: { plugins: [router, i18n] } })
}

describe('RecipesPage', () => {
  it('shows images and placeholder', async () => {
    ;(api.fetchRecipes as unknown as Mock).mockResolvedValue([
      { id: 'r1', nom: 'A', instructions: null, image_url: 'img' },
      { id: 'r2', nom: 'B', instructions: null, image_url: null }
    ])
    const wrapper = await setup()
    await flushPromises()
    const imgs = wrapper.findAll('img')
    expect(imgs).toHaveLength(2)
    expect(imgs[0].attributes('src')).toBe('img')
    expect(imgs[1].attributes('src')).not.toBe('img')
  })

  it('opens import dialog', async () => {
    ;(api.fetchRecipes as unknown as Mock).mockResolvedValue([])
    const wrapper = await setup()
    await flushPromises()
    await wrapper.get('[data-test="import-btn"]').trigger('click')
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })
})
