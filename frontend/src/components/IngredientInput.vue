<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchIngredients, Ingredient } from '../api'

interface IngredientData {
  id?: string
  nom: string
  quantite: string
  unite: string
}

const props = defineProps<{
  modelValue: IngredientData
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: IngredientData): void
}>()

const data = ref({ ...props.modelValue })
const suggestions = ref<Ingredient[]>([])

watch(() => props.modelValue, v => {
  data.value = { ...v }
})

watch(data, v => emit('update:modelValue', v), { deep: true })

watch(
  () => data.value.nom,
  async (val) => {
    if (!val) {
      suggestions.value = []
      return
    }
    try {
      suggestions.value = await searchIngredients(val)
    } catch {
      suggestions.value = []
    }
  }
)

function pick(ing: Ingredient) {
  data.value.id = ing.id
  data.value.nom = ing.nom
  data.value.unite = ing.unite || ''
  suggestions.value = []
}
</script>
<template>
  <div class="mb-2">
    <input
      v-model="data.nom"
      class="border rounded w-full p-1"
      placeholder="Ingrédient"
    />
    <ul v-if="suggestions.length" class="border bg-white">
      <li
        v-for="s in suggestions"
        :key="s.id"
        class="px-2 py-1 hover:bg-gray-100 cursor-pointer"
        @click="pick(s)"
      >
        {{ s.nom }}
      </li>
    </ul>
    <div class="flex space-x-2 mt-1">
      <input v-model="data.quantite" class="border rounded p-1 w-20" placeholder="Qté" />
      <input v-model="data.unite" :disabled="!!data.id" class="border rounded p-1 flex-1" placeholder="Unité" />
    </div>
  </div>
</template>
