<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createRecipe, updateRecipe, fetchRecipe, fetchRecipeIngredients } from '../api'
import IngredientInput from '../components/IngredientInput.vue'

const nom = ref('')
const instructions = ref('')
const imageUrl = ref('')
interface IngredientData { id?: string; nom: string; quantite: string; unite: string }
const ingredients = ref<IngredientData[]>([
  { nom: '', quantite: '', unite: '' }
])
const secondaryIdx = ref<number | null>(null)
const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)

const submit = async () => {
  const payload = {
    nom: nom.value,
    ingredient_principal_id: ingredients.value[0].id || '',
    ingredient_secondaire_id:
      secondaryIdx.value !== null ? ingredients.value[secondaryIdx.value].id : undefined,
    instructions: instructions.value || undefined,
    image_url: imageUrl.value || undefined,
    ingredients: ingredients.value
  }
  try {
    if (isEdit.value) {
      await updateRecipe(route.params.id as string, payload)
    } else {
      await createRecipe(payload)
    }
    router.push('/recipes')
  } catch {
    // ignore error for now
  }
}

/* c8 ignore start */
const addIngredient = () => {
  ingredients.value.push({ nom: '', quantite: '', unite: '' })
}

const removeIngredient = (idx: number) => {
  ingredients.value.splice(idx, 1)
  if (secondaryIdx.value !== null) {
    if (secondaryIdx.value === idx) {
      secondaryIdx.value = null
    } else if (secondaryIdx.value > idx) {
      secondaryIdx.value -= 1
    }
  }
}

const toggleSecondary = (idx: number) => {
  secondaryIdx.value = secondaryIdx.value === idx ? null : idx
}
/* c8 ignore end */

/* c8 ignore start */
onMounted(async () => {
  if (!isEdit.value) return
  const id = route.params.id as string
  try {
    const r = await fetchRecipe(id)
    nom.value = r.nom
    instructions.value = r.instructions || ''
    imageUrl.value = r.image_url || ''
    const ing = await fetchRecipeIngredients(id)
    ingredients.value = ing.map((i) => ({
      id: i.id,
      nom: i.nom,
      quantite: i.quantite,
      unite: i.unite
    }))
    if (r.ingredient_secondaire_id) {
      const idx = ingredients.value.findIndex((i) => i.id === r.ingredient_secondaire_id)
      secondaryIdx.value = idx === -1 ? null : idx
    }
  } catch {
    // ignore
  }
})
/* c8 ignore end */
</script>
<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold tracking-tight mb-6">
      {{ isEdit ? $t('addRecipe.editTitle') : $t('addRecipe.addTitle') }}
    </h1>
    <form
      class="space-y-5"
      @submit.prevent="submit"
    >
      <div>
        <label class="block mb-1.5 text-sm font-semibold text-ink-secondary">{{ $t('addRecipe.name') }}</label>
        <input
          v-model="nom"
          class="border border-line-strong rounded-ctl w-full p-2.5 bg-surface focus:border-accent transition"
          required
        >
      </div>
      <div>
        <label class="block mb-1.5 text-sm font-semibold text-ink-secondary">{{ $t('addRecipe.instructions') }}</label>
        <textarea
          v-model="instructions"
          class="border border-line-strong rounded-ctl w-full p-2.5 bg-surface focus:border-accent transition"
        />
      </div>
      <div>
        <label class="block mb-1.5 text-sm font-semibold text-ink-secondary">{{ $t('addRecipe.imageUrl') }}</label>
        <input
          v-model="imageUrl"
          class="border border-line-strong rounded-ctl w-full p-2.5 bg-surface focus:border-accent transition"
        >
      </div>
      <div>
        <label class="block mb-1.5 text-sm font-semibold text-ink-secondary">{{ $t('addRecipe.ingredients') }}</label>
        <div
          v-for="(_, idx) in ingredients"
          :key="idx"
          class="mb-3 rounded-ctl border border-line bg-surface p-3"
        >
          <IngredientInput v-model="ingredients[idx]" />
          <p
            v-if="idx === 0"
            class="text-xs text-ink-muted"
          >
            {{ $t('addRecipe.mainIngredient') }}
          </p>
          <div
            v-if="idx > 0"
            class="flex items-center justify-between"
          >
            <label class="flex items-center gap-1.5 text-sm text-ink-secondary">
              <input
                type="checkbox"
                :checked="secondaryIdx === idx"
                @change="toggleSecondary(idx)"
              >
              <span>{{ $t('addRecipe.secondaryIngredient') }}</span>
            </label>
            <button
              type="button"
              class="text-danger text-sm font-semibold hover:text-danger-ink transition"
              @click="removeIngredient(idx)"
            >
              {{ $t('addRecipe.removeIngredient') }}
            </button>
          </div>
        </div>
        <button
          type="button"
          class="rounded-full border border-line-strong bg-surface text-ink text-sm font-semibold px-4 py-2 hover:border-ink-muted transition"
          @click="addIngredient"
        >
          {{ $t('addRecipe.addIngredient') }}
        </button>
      </div>
      <button
        type="submit"
        class="rounded-full bg-accent text-white text-sm font-semibold px-5 py-2.5 shadow-card hover:brightness-105 transition"
      >
        {{ $t('addRecipe.save') }}
      </button>
    </form>
  </div>
</template>
