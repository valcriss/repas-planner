<script setup lang="ts">
/* global File, FileList, Event, HTMLInputElement, Blob, URL, document */
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchRecipes, exportRecipes, importRecipes, importYamlRecipes } from '../api'
import placeholderImg from '../assets/placeholder.svg'

const { t } = useI18n()

interface RecipeSummary {
  id: string
  nom: string
  instructions: string | null
  image_url: string | null
}
const recipes = ref<RecipeSummary[]>([])
const showImport = ref(false)
const file = ref<File | null>(null)
const yamlFiles = ref<FileList | null>(null)
const yamlSummary = ref('')

function onFile(e: Event) {
  const target = e.target as HTMLInputElement
  file.value = target.files ? target.files[0] : null
}

function onYamlFiles(e: Event) {
  const target = e.target as HTMLInputElement
  yamlFiles.value = target.files
  yamlSummary.value = ''
}

async function doImport() {
  if (!file.value) return
  const text = await file.value.text()
  await importRecipes(JSON.parse(text))
  showImport.value = false
}

async function doImportYaml() {
  if (!yamlFiles.value || yamlFiles.value.length === 0) return
  const contents = await Promise.all(Array.from(yamlFiles.value).map((f) => f.text()))
  const { imported, skipped } = await importYamlRecipes(contents)
  yamlSummary.value = t('recipesPage.yamlImportSummary', { imported, skipped })
  recipes.value = await fetchRecipes()
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
    <div class="flex items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold tracking-tight">
        {{ $t('recipesPage.title') }}
      </h1>
      <div class="flex gap-2">
        <button
          data-test="import-btn"
          class="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface text-ink text-sm font-semibold px-4 py-2 hover:border-ink-muted transition"
          @click="showImport = true"
        >
          {{ $t('recipesPage.importExport') }}
        </button>
        <RouterLink
          to="/recipes/add"
          class="inline-flex items-center gap-1.5 rounded-full bg-accent text-white text-sm font-semibold px-4 py-2 shadow-card hover:brightness-105 transition"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            class="w-3.5 h-3.5"
          ><path d="M12 5v14M5 12h14" /></svg>
          {{ $t('recipesPage.addRecipe') }}
        </RouterLink>
      </div>
    </div>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <RouterLink
        v-for="recipe in recipes"
        :key="recipe.id"
        :to="`/recipes/${recipe.id}`"
        class="block rounded-card border border-line bg-surface shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition overflow-hidden"
      >
        <div class="h-32 bg-gradient-to-br from-accent-tint to-sunken flex items-center justify-center overflow-hidden">
          <img
            :src="recipe.image_url || placeholderImg"
            :alt="$t('recipesPage.imageAlt')"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="p-4">
          <h2 class="font-semibold text-base mb-1">
            {{ recipe.nom }}
          </h2>
          <p class="text-sm text-ink-secondary line-clamp-2">
            {{ recipe.instructions }}
          </p>
        </div>
      </RouterLink>
    </div>
    <div
      v-if="showImport"
      class="fixed inset-0 bg-ink/40 flex items-center justify-center p-4"
    >
      <div class="bg-surface rounded-card border border-line shadow-card-hover p-5 space-y-4 w-full max-w-sm">
        <div>
          <label class="block mb-2 text-sm font-semibold text-ink-secondary">{{ $t('recipesPage.fileToImport') }}</label>
          <div class="flex items-center gap-2">
            <input
              type="file"
              class="text-sm flex-1"
              @change="onFile"
            >
            <button
              class="rounded-full bg-accent text-white text-sm font-semibold px-4 py-2 shadow-card hover:brightness-105 transition"
              @click="doImport"
            >
              {{ $t('recipesPage.import') }}
            </button>
          </div>
        </div>
        <div class="text-right">
          <button
            class="rounded-full border border-line-strong bg-surface text-ink text-sm font-semibold px-4 py-2 hover:border-ink-muted transition"
            @click="doExport"
          >
            {{ $t('recipesPage.export') }}
          </button>
        </div>
        <div class="border-t border-line pt-4">
          <label class="block mb-2 text-sm font-semibold text-ink-secondary">{{ $t('recipesPage.yamlFilesToImport') }}</label>
          <div class="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept=".yml,.yaml"
              class="text-sm flex-1"
              @change="onYamlFiles"
            >
            <button
              class="rounded-full bg-accent text-white text-sm font-semibold px-4 py-2 shadow-card hover:brightness-105 transition"
              @click="doImportYaml"
            >
              {{ $t('recipesPage.importYaml') }}
            </button>
          </div>
          <p
            v-if="yamlSummary"
            class="mt-2 text-xs text-ink-secondary"
          >
            {{ yamlSummary }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
