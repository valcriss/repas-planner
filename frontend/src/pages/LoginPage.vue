<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api'

/* global localStorage */

const username = ref('')
const password = ref('')
const router = useRouter()

async function submit() {
  try {
    await login(username.value, password.value)
    localStorage.setItem('loggedIn', '1')
    router.push('/recipes')
  } catch {
    // ignore invalid credentials
  }
}
</script>
<template>
  <form
    class="max-w-sm mx-auto"
    @submit.prevent="submit"
  >
    <h1 class="text-2xl font-bold mb-4">
      Connexion
    </h1>
    <div class="mb-2">
      <label class="block mb-1">Nom d'utilisateur</label>
      <input
        v-model="username"
        class="border rounded w-full p-2"
        required
      >
    </div>
    <div class="mb-4">
      <label class="block mb-1">Mot de passe</label>
      <input
        v-model="password"
        type="password"
        class="border rounded w-full p-2"
        required
      >
    </div>
    <button class="px-3 py-1 bg-blue-600 text-white rounded">
      Se connecter
    </button>
  </form>
</template>
