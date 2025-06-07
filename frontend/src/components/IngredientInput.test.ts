import { describe, it, expect, vi, type Mock } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import IngredientInput from './IngredientInput.vue'
import * as api from '../api'

vi.mock('../api')

describe('IngredientInput', () => {
  it('shows suggestions and allows picking', async () => {
    ;(api.fetchAllIngredients as unknown as Mock).mockResolvedValue([{ id: 'i1', nom: 'Tomate', unite: 'kg' }])
    ;(api.fetchAllUnites as unknown as Mock).mockResolvedValue([{ id: 'u1', nom: 'kg' }])

    const wrapper = mount(IngredientInput, {
      props: { modelValue: { nom: '', quantite: '', unite: '' } }
    })
    await flushPromises()
    await wrapper.get('input[placeholder="Ingrédient"]').setValue('tom')
    await flushPromises()
    const itemsIng = wrapper.findAll('ul li').map(li => li.text())
    expect(itemsIng).toContain('Tomate')
    const events = wrapper.emitted('update:modelValue') as unknown[][]
    expect((events[0][0] as { nom: string }).nom).toBe('tom')

    await wrapper.get('input[placeholder="Unité"]').setValue('k')
    await flushPromises()
    const items = wrapper.findAll('ul li').map(li => li.text())
    expect(items).toContain('kg')
    await wrapper.get('ul li').trigger('click')
    const value = wrapper.emitted('update:modelValue')![1][0] as { unite: string }
    expect(value.unite).toBe('kg')
  })

  it('handles unit search errors', async () => {
    ;(api.fetchAllIngredients as unknown as Mock).mockResolvedValue([])
    ;(api.fetchAllUnites as unknown as Mock).mockRejectedValue(new Error('fail'))

    const wrapper = mount(IngredientInput, {
      props: { modelValue: { nom: '', quantite: '', unite: '' } }
    })

    await flushPromises()
    await wrapper.get('input[placeholder="Unité"]').setValue('k')
    await flushPromises()
    expect(wrapper.findAll('ul li')).toHaveLength(0)
  })

  it('clears id when ingredient name is changed', async () => {
    const wrapper = mount(IngredientInput, {
      props: { modelValue: { id: 'i1', nom: 'Tomate', quantite: '', unite: 'kg' } }
    })

    await wrapper.get('input[placeholder="Ingrédient"]').setValue('Nouvelle')
    await flushPromises()

    const value = wrapper.emitted('update:modelValue')![0][0] as { id?: string }
    expect(value.id).toBeUndefined()
    expect(wrapper.get('input[placeholder="Unité"]').attributes('disabled')).toBeUndefined()
  })
})

