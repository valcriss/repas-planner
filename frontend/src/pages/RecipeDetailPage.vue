<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { fetchRecipe, fetchRecipeIngredients } from '../api'
import type { Recipe, RecipeIngredient } from '../api'

const route = useRoute()
const recipe = ref<Recipe | null>(null)
const ingredients = ref<RecipeIngredient[]>([])

onMounted(async () => {
  const id = route.params.id as string
  try {
    recipe.value = await fetchRecipe(id)
    ingredients.value = await fetchRecipeIngredients(id)
  } catch {
    // ignore for now
  }
})
</script>
<template>
  <div v-if="recipe" class="max-w-2xl mx-auto">
    <RouterLink to="/recipes" class="text-blue-600">&larr; Retour</RouterLink>
    <h1 class="text-3xl font-bold my-4">{{ recipe.nom }}</h1>
    <img v-if="recipe.image_url" :src="recipe.image_url" class="mb-4 w-full object-cover rounded" />
    <h2 class="text-xl font-semibold mb-2">Ingrédients</h2>
    <ul class="list-disc list-inside mb-4">
      <li v-for="ing in ingredients" :key="ing.id">
        {{ ing.nom }} : {{ ing.quantite }} {{ ing.unite }}
      </li>
    </ul>
    <h2 class="text-xl font-semibold mb-2">Description</h2>
    <p class="whitespace-pre-line">{{ recipe.instructions }}</p>
  </div>
</template>
