<script setup lang="ts">
/* global File, Event, HTMLInputElement, Blob, URL, document */
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchRecipes, exportRecipes, importRecipes } from '../api'
import placeholderImg from '../assets/placeholder.svg'

interface RecipeSummary {
  id: string
  nom: string
  instructions: string | null
  image_url: string | null
}
const recipes = ref<RecipeSummary[]>([])
const showImport = ref(false)
const file = ref<File | null>(null)

function onFile(e: Event) {
  const target = e.target as HTMLInputElement
  file.value = target.files ? target.files[0] : null
}

async function doImport() {
  if (!file.value) return
  const text = await file.value.text()
  await importRecipes(JSON.parse(text))
  showImport.value = false
}

async function doExport() {
  const data = await exportRecipes()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'recipes.json'
  a.click()
  URL.revokeObjectURL(url)
}

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
      <h1 class="text-2xl font-bold">
        Recipes
      </h1>
      <div class="flex gap-2">
        <RouterLink
          to="/recipes/add"
          class="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Ajouter une recette
        </RouterLink>
        <button
          data-test="import-btn"
          class="px-3 py-1 bg-green-600 text-white rounded"
          @click="showImport = true"
        >
          Import/Export
        </button>
      </div>
    </div>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <RouterLink
        v-for="recipe in recipes"
        :key="recipe.id"
        :to="`/recipes/${recipe.id}`"
        class="bg-white rounded shadow p-4 block hover:bg-gray-50"
      >
        <img
          :src="recipe.image_url || placeholderImg"
          alt="Recipe image"
          class="w-full h-32 object-cover rounded mb-2"
        >
        <h2 class="font-medium text-lg mb-1">
          {{ recipe.nom }}
        </h2>
        <p class="text-sm text-gray-600">
          {{ recipe.instructions }}
        </p>
      </RouterLink>
    </div>
    <div
      v-if="showImport"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-4 rounded space-y-4">
        <div>
          <label class="block mb-2">fichier à importer</label>
          <input
            type="file"
            @change="onFile"
          >
          <button
            class="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
            @click="doImport"
          >
            Importer
          </button>
        </div>
        <div class="text-right">
          <button
            class="px-3 py-1 bg-green-600 text-white rounded"
            @click="doExport"
          >
            Exporter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
