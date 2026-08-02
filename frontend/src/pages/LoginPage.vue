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
    class="max-w-sm mx-auto rounded-card border border-line bg-surface shadow-card p-6 mt-8"
    @submit.prevent="submit"
  >
    <h1 class="text-2xl font-bold tracking-tight mb-6">
      {{ $t('login.title') }}
    </h1>
    <div class="mb-4">
      <label class="block mb-1.5 text-sm font-semibold text-ink-secondary">{{ $t('login.username') }}</label>
      <input
        v-model="username"
        class="border border-line-strong rounded-ctl w-full p-2.5 bg-bg focus:border-accent transition"
        required
      >
    </div>
    <div class="mb-6">
      <label class="block mb-1.5 text-sm font-semibold text-ink-secondary">{{ $t('login.password') }}</label>
      <input
        v-model="password"
        type="password"
        class="border border-line-strong rounded-ctl w-full p-2.5 bg-bg focus:border-accent transition"
        required
      >
    </div>
    <button class="w-full rounded-full bg-accent text-white text-sm font-semibold px-4 py-2.5 shadow-card hover:brightness-105 transition">
      {{ $t('login.submit') }}
    </button>
  </form>
</template>
