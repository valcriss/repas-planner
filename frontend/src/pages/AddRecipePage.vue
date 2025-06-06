<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRecipe } from '../api'
import IngredientInput from '../components/IngredientInput.vue'

const nom = ref('')
const instructions = ref('')
const imageUrl = ref('')
const ingredients = ref([
  { nom: '', quantite: '', unite: '' }
])
const secondaryIdx = ref<number | null>(null)
const router = useRouter()

const submit = async () => {
  try {
    await createRecipe({
      nom: nom.value,
      ingredient_principal_id: ingredients.value[0].id || '',
      ingredient_secondaire_id:
        secondaryIdx.value !== null ? ingredients.value[secondaryIdx.value].id : undefined,
      instructions: instructions.value || undefined,
      image_url: imageUrl.value || undefined,
      ingredients: ingredients.value
    })
    router.push('/recipes')
  } catch {
    // ignore error for now
  }
}

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
</script>
<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Ajouter une recette</h1>
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="block mb-1">Nom</label>
        <input v-model="nom" class="border rounded w-full p-2" required />
      </div>
      <div>
        <label class="block mb-1">Instructions</label>
        <textarea v-model="instructions" class="border rounded w-full p-2" />
      </div>
      <div>
        <label class="block mb-1">Image URL</label>
        <input v-model="imageUrl" class="border rounded w-full p-2" />
      </div>
      <div>
        <label class="block mb-1">Ingrédients</label>
        <div v-for="(ing, idx) in ingredients" :key="idx" class="mb-2">
          <IngredientInput v-model="ingredients[idx]" />
          <p v-if="idx === 0" class="text-sm text-gray-500">Ingrédient principal de la recette</p>
          <div v-if="idx > 0" class="flex items-center space-x-2">
            <label class="flex items-center space-x-1">
              <input type="checkbox" :checked="secondaryIdx === idx" @change="toggleSecondary(idx)" />
              <span>Ingrédient secondaire</span>
            </label>
            <button type="button" @click="removeIngredient(idx)" class="text-red-600 text-sm">Supprimer l'ingrédient</button>
          </div>
        </div>
        <button type="button" @click="addIngredient" class="px-2 py-1 bg-gray-200 rounded">Ajouter un ingrédient</button>
      </div>
      <button type="submit" class="px-3 py-1 bg-blue-600 text-white rounded">Enregistrer</button>
    </form>
  </div>
</template>
