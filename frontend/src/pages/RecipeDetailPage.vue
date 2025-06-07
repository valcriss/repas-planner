<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchRecipe, fetchRecipeIngredients, deleteRecipe } from '../api'
import type { Recipe, RecipeIngredient } from '../api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
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

async function remove() {
  if (!recipe.value) return
  if (!globalThis.confirm(t('recipeDetail.deleteConfirm'))) return
  try {
    await deleteRecipe(recipe.value.id)
    router.push('/recipes')
  } catch {
    // ignore
  }
}
</script>
<template>
  <div
    v-if="recipe"
    class="max-w-2xl mx-auto"
  >
    <button
      type="button"
      class="text-blue-600"
      @click="router.back()"
    >
      &larr; {{ $t('recipeDetail.back') }}
    </button>
    <h1 class="text-3xl font-bold my-4">
      {{ recipe.nom }}
    </h1>
    <img
      v-if="recipe.image_url"
      :src="recipe.image_url"
      class="mb-4 w-full object-cover rounded"
    >
    <h2 class="text-xl font-semibold mb-2">
      {{ $t('recipeDetail.ingredients') }}
    </h2>
    <ul class="list-disc list-inside mb-4">
      <li
        v-for="ing in ingredients"
        :key="ing.id"
      >
        {{ ing.nom }} : {{ ing.quantite }} {{ ing.unite }}
      </li>
    </ul>
    <h2 class="text-xl font-semibold mb-2">
      {{ $t('recipeDetail.description') }}
    </h2>
    <p class="whitespace-pre-line">
      {{ recipe.instructions }}
    </p>
    <div class="mt-4 space-x-2">
      <RouterLink
        :to="`/recipes/${recipe.id}/edit`"
        class="px-3 py-1 bg-blue-600 text-white rounded"
      >
        {{ $t('recipeDetail.edit') }}
      </RouterLink>
      <button
        type="button"
        class="px-3 py-1 bg-red-600 text-white rounded"
        @click="remove"
      >
        {{ $t('recipeDetail.delete') }}
      </button>
    </div>
  </div>
</template>
