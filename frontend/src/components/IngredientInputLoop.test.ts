import { describe, it, expect, vi, type Mock } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import IngredientInput from './IngredientInput.vue'
import * as api from '../api'

vi.mock('../api')

describe('IngredientInput loop', () => {
  it('emits once with v-model', async () => {
    ;(api.fetchAllIngredients as unknown as Mock).mockResolvedValue([])
    ;(api.fetchAllUnites as unknown as Mock).mockResolvedValue([])
    const wrapper = mount(IngredientInput, {
      props: {
        modelValue: { nom: '', quantite: '', unite: '' },
        'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v })
      }
    })
    await flushPromises()
    await wrapper.get('input[placeholder="Ingrédient"]').setValue('tom')
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')!.length).toBe(1)
  })
})
