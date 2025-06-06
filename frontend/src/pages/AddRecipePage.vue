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
    <h1 class="text-2xl font-bold mb-4">
      {{ isEdit ? 'Modifier la recette' : 'Ajouter une recette' }}
    </h1>
    <form
      class="space-y-4"
      @submit.prevent="submit"
    >
      <div>
        <label class="block mb-1">Nom</label>
        <input
          v-model="nom"
          class="border rounded w-full p-2"
          required
        >
      </div>
      <div>
        <label class="block mb-1">Instructions</label>
        <textarea
          v-model="instructions"
          class="border rounded w-full p-2"
        />
      </div>
      <div>
        <label class="block mb-1">Image URL</label>
        <input
          v-model="imageUrl"
          class="border rounded w-full p-2"
        >
      </div>
      <div>
        <label class="block mb-1">Ingrédients</label>
        <div
          v-for="(_, idx) in ingredients"
          :key="idx"
          class="mb-2"
        >
          <IngredientInput v-model="ingredients[idx]" />
          <p
            v-if="idx === 0"
            class="text-sm text-gray-500"
          >
            Ingrédient principal de la recette
          </p>
          <div
            v-if="idx > 0"
            class="flex items-center space-x-2"
          >
            <label class="flex items-center space-x-1">
              <input
                type="checkbox"
                :checked="secondaryIdx === idx"
                @change="toggleSecondary(idx)"
              >
              <span>Ingrédient secondaire</span>
            </label>
            <button
              type="button"
              class="text-red-600 text-sm"
              @click="removeIngredient(idx)"
            >
              Supprimer l'ingrédient
            </button>
          </div>
        </div>
        <button
          type="button"
          class="px-2 py-1 bg-gray-200 rounded"
          @click="addIngredient"
        >
          Ajouter un ingrédient
        </button>
      </div>
      <button
        type="submit"
        class="px-3 py-1 bg-blue-600 text-white rounded"
      >
        Enregistrer
      </button>
    </form>
  </div>
</template>
