<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4">
      <div class="container mx-auto px-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">
          {{ $t('app.title') }}
        </h1>
        <nav class="space-x-4 font-medium">
          <RouterLink
            to="/recipes"
            class="hover:underline"
          >
            {{ $t('app.recipes') }}
          </RouterLink>
          <RouterLink
            to="/menu"
            class="hover:underline"
          >
            {{ $t('app.menu') }}
          </RouterLink>
        </nav>
      </div>
    </header>
    <main class="flex-1 container mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
