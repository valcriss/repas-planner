import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { messages } from '../i18n'
import LoginPage from './LoginPage.vue'
import { routes } from '../router'
import * as api from '../api'

vi.mock('../api')

async function setup() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/login')
  await router.isReady()
  const i18n = createI18n({ legacy: false, locale: 'en', messages })
  return mount(LoginPage, { global: { plugins: [router, i18n] } })
}

describe('LoginPage', () => {
  it('submits credentials', async () => {
    ;(api.login as unknown as vi.Mock).mockResolvedValue({})
    const wrapper = await setup()
    await wrapper.get('form').trigger('submit.prevent')
    expect(api.login).toHaveBeenCalled()
  })
})
