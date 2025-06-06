<script setup lang="ts">
const recipes = Array.from({ length: 4 }).map((_, i) => ({
  id: i + 1,
  title: `Recipe ${i + 1}`,
  description: 'A tasty meal awaits you.'
}))
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Recipes</h1>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="bg-white rounded shadow p-4"
      >
        <h2 class="font-medium text-lg mb-1">{{ recipe.title }}</h2>
        <p class="text-sm text-gray-600">{{ recipe.description }}</p>
      </div>
    </div>
  </div>
</template>
