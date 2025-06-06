<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="p-4">
    <nav class="mb-4 space-x-4">
      <RouterLink to="/recipes" class="text-blue-500">Recipes</RouterLink>
      <RouterLink to="/menu" class="text-blue-500">Menu</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
