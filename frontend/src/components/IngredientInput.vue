<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { fetchAllIngredients, fetchAllUnites } from '../api'
import type { Ingredient, Unite } from '../api'

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

function equal(a: IngredientData, b: IngredientData) {
  return a.id === b.id && a.nom === b.nom && a.quantite === b.quantite && a.unite === b.unite
}
const suggestions = ref<Ingredient[]>([])
const unitSuggestions = ref<Unite[]>([])
const justPicked = ref(false)
const allIngredients = ref<Ingredient[]>([])
const allUnites = ref<Unite[]>([])

onMounted(async () => {
  try {
    allIngredients.value = await fetchAllIngredients()
  } catch {
    allIngredients.value = []
  }
  try {
    allUnites.value = await fetchAllUnites()
  } catch {
    allUnites.value = []
  }
})

watch(
  () => props.modelValue,
  v => {
    if (!equal(v, data.value)) {
      data.value = { ...v }
    }
  },
  { deep: true }
)
watch(
  data,
  v => {
    if (!equal(v, props.modelValue)) {
      emit('update:modelValue', v)
    }
  },
  { deep: true }
)

watch(
  () => data.value.nom,
  (val) => {
    if (!justPicked.value && data.value.id) {
      data.value.id = undefined
    } else if (justPicked.value) {
      justPicked.value = false
    }
    if (!val) {
      suggestions.value = []
      return
    }
    const search = val.toLowerCase()
    suggestions.value = allIngredients.value
      .filter(i => i.nom.toLowerCase().includes(search))
      .slice(0, 10)
  }
)

watch(
  () => data.value.unite,
  (val) => {
    if (!val || data.value.id) {
      unitSuggestions.value = []
      return
    }
    const search = val.toLowerCase()
    unitSuggestions.value = allUnites.value
      .filter(u => u.nom.toLowerCase().includes(search))
      .slice(0, 10)
  }
)

function pick(ing: Ingredient) {
  justPicked.value = true
  data.value.id = ing.id
  data.value.nom = ing.nom
  data.value.unite = ing.unite || ''
  suggestions.value = []
}

function pickUnit(u: Unite) {
  data.value.unite = u.nom
  unitSuggestions.value = []
}
</script>
<template>
  <div class="mb-2">
    <input
      v-model="data.nom"
      class="border rounded w-full p-1"
      placeholder="Ingrédient"
    >
    <ul
      v-if="suggestions.length"
      class="border bg-white"
    >
      <li
        v-for="s in suggestions"
        :key="s.id"
        class="px-2 py-1 hover:bg-gray-100 cursor-pointer"
        @click="pick(s)"
      >
        {{ s.nom }}
      </li>
    </ul>
    <div class="flex space-x-2 mt-1 relative">
      <input
        v-model="data.quantite"
        class="border rounded p-1 w-20"
        placeholder="Qté"
      >
      <div class="flex-1">
        <input
          v-model="data.unite"
          :disabled="!!data.id"
          class="border rounded p-1 w-full"
          placeholder="Unité"
        >
        <ul
          v-if="unitSuggestions.length"
          class="border bg-white absolute left-20 right-0 z-10"
        >
          <li
            v-for="u in unitSuggestions"
            :key="u.id"
            class="px-2 py-1 hover:bg-gray-100 cursor-pointer"
            @click="pickUnit(u)"
          >
            {{ u.nom }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
