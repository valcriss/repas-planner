<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <div class="min-h-screen bg-bg text-ink flex flex-col">
    <header class="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            class="w-6 h-6 text-accent shrink-0"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="11"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M8 6v5.2a1.6 1.6 0 0 0 1.6 1.6h0A1.6 1.6 0 0 0 11.2 11V6M8 6v3.4"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <path
              d="M15 6v4.6c0 .9-.6 1.7-1.5 1.9V18"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <path
              d="M15 6v3"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <path
              d="M9.4 12.8V18"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </svg>
          <span class="text-lg font-bold tracking-tight">{{ $t('app.title') }}</span>
        </div>
        <nav class="flex gap-1 bg-sunken p-1 rounded-full text-sm font-semibold">
          <RouterLink
            to="/recipes"
            class="px-3 py-1.5 rounded-full transition"
            :class="isActive('/recipes') ? 'bg-surface text-ink shadow-card' : 'text-ink-secondary hover:text-ink'"
          >
            {{ $t('app.recipes') }}
          </RouterLink>
          <RouterLink
            to="/menu"
            class="px-3 py-1.5 rounded-full transition"
            :class="isActive('/menu') ? 'bg-surface text-ink shadow-card' : 'text-ink-secondary hover:text-ink'"
          >
            {{ $t('app.menu') }}
          </RouterLink>
          <RouterLink
            to="/stock"
            class="px-3 py-1.5 rounded-full transition"
            :class="isActive('/stock') ? 'bg-surface text-ink shadow-card' : 'text-ink-secondary hover:text-ink'"
          >
            {{ $t('app.stock') }}
          </RouterLink>
        </nav>
      </div>
    </header>
    <main class="flex-1 container mx-auto px-4 py-8 max-w-5xl w-full">
      <RouterView />
    </main>
  </div>
</template>
