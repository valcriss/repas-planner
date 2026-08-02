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
      class="inline-flex items-center gap-1 text-sm font-semibold text-ink-secondary hover:text-ink transition"
      @click="router.back()"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-4 h-4"
      ><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
      {{ $t('recipeDetail.back') }}
    </button>
    <h1 class="text-3xl font-bold tracking-tight my-4">
      {{ recipe.nom }}
    </h1>
    <img
      v-if="recipe.image_url"
      :src="recipe.image_url"
      class="mb-6 w-full h-64 object-cover rounded-card border border-line shadow-card"
    >
    <h2 class="text-lg font-semibold mb-2">
      {{ $t('recipeDetail.ingredients') }}
    </h2>
    <ul class="mb-6 divide-y divide-line rounded-ctl border border-line bg-surface overflow-hidden">
      <li
        v-for="ing in ingredients"
        :key="ing.id"
        class="flex items-center gap-2 px-4 py-2.5 text-sm"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <span class="font-medium">{{ ing.nom }}</span>
        <span class="ml-auto text-ink-secondary tabular-nums">{{ ing.quantite }} {{ ing.unite }}</span>
      </li>
    </ul>
    <h2 class="text-lg font-semibold mb-2">
      {{ $t('recipeDetail.description') }}
    </h2>
    <p class="whitespace-pre-line text-ink-secondary leading-relaxed">
      {{ recipe.instructions }}
    </p>
    <div class="mt-6 flex gap-2">
      <RouterLink
        :to="`/recipes/${recipe.id}/edit`"
        class="rounded-full bg-accent text-white text-sm font-semibold px-4 py-2 shadow-card hover:brightness-105 transition"
      >
        {{ $t('recipeDetail.edit') }}
      </RouterLink>
      <button
        type="button"
        class="rounded-full border border-danger/40 text-danger text-sm font-semibold px-4 py-2 hover:bg-danger-tint transition"
        @click="remove"
      >
        {{ $t('recipeDetail.delete') }}
      </button>
    </div>
  </div>
</template>
