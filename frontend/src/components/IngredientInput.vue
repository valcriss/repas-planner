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
  <div>
    <input
      v-model="data.nom"
      class="border border-line-strong rounded-ctl w-full p-2 bg-surface focus:border-accent transition"
      placeholder="Ingrédient"
    >
    <ul
      v-if="suggestions.length"
      class="border border-line rounded-ctl bg-surface shadow-card mt-1 overflow-hidden"
    >
      <li
        v-for="s in suggestions"
        :key="s.id"
        class="px-3 py-1.5 text-sm hover:bg-accent-tint hover:text-accent-ink cursor-pointer transition"
        @click="pick(s)"
      >
        {{ s.nom }}
      </li>
    </ul>
    <div class="flex gap-2 mt-2 relative">
      <input
        v-model="data.quantite"
        class="border border-line-strong rounded-ctl p-2 w-20 bg-surface focus:border-accent transition"
        placeholder="Qté"
      >
      <div class="flex-1">
        <input
          v-model="data.unite"
          :disabled="!!data.id"
          class="border border-line-strong rounded-ctl p-2 w-full bg-surface focus:border-accent transition disabled:opacity-60"
          placeholder="Unité"
        >
        <ul
          v-if="unitSuggestions.length"
          class="border border-line rounded-ctl bg-surface shadow-card absolute left-20 right-0 z-10 overflow-hidden"
        >
          <li
            v-for="u in unitSuggestions"
            :key="u.id"
            class="px-3 py-1.5 text-sm hover:bg-accent-tint hover:text-accent-ink cursor-pointer transition"
            @click="pickUnit(u)"
          >
            {{ u.nom }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
