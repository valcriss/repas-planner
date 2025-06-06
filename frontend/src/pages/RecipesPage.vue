<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchRecipes } from '../api'

const recipes = ref([])

onMounted(async () => {
  try {
    recipes.value = await fetchRecipes()
  } catch {
    // ignore error for now
  }
})
</script>
<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Recipes</h1>
      <RouterLink
        to="/recipes/add"
        class="px-3 py-1 bg-blue-600 text-white rounded"
        >Ajouter une recette</RouterLink
      >
    </div>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="bg-white rounded shadow p-4"
      >
        <h2 class="font-medium text-lg mb-1">{{ recipe.nom }}</h2>
        <p class="text-sm text-gray-600">{{ recipe.instructions }}</p>
      </div>
    </div>
  </div>
</template>
