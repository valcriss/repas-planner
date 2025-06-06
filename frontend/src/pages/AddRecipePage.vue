<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRecipe } from '../api'
import IngredientInput from '../components/IngredientInput.vue'

const nom = ref('')
const instructions = ref('')
const ingredientPrincipalId = ref('')
const imageUrl = ref('')
const ingredients = ref([
  { nom: '', quantite: '', unite: '' }
])
const router = useRouter()

const submit = async () => {
  try {
    await createRecipe({
      nom: nom.value,
      ingredient_principal_id: ingredientPrincipalId.value,
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
        <IngredientInput
          v-for="(ing, idx) in ingredients"
          :key="idx"
          v-model="ingredients[idx]"
        />
        <button type="button" @click="addIngredient" class="px-2 py-1 bg-gray-200 rounded">Ajouter un ingrédient</button>
      </div>
      <div>
        <label class="block mb-1">Ingredient principal ID</label>
        <input v-model="ingredientPrincipalId" class="border rounded w-full p-2" required />
      </div>
      <button type="submit" class="px-3 py-1 bg-blue-600 text-white rounded">Enregistrer</button>
    </form>
  </div>
</template>
