import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './LoginPage.vue'
import { routes } from '../router'
import * as api from '../api'

vi.mock('../api')

async function setup() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/login')
  await router.isReady()
  return mount(LoginPage, { global: { plugins: [router] } })
}

describe('LoginPage', () => {
  it('submits credentials', async () => {
    ;(api.login as unknown as vi.Mock).mockResolvedValue({})
    const wrapper = await setup()
    await wrapper.get('form').trigger('submit.prevent')
    expect(api.login).toHaveBeenCalled()
  })
})
