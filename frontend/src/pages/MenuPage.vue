<script setup lang="ts">
/* eslint-disable vue/singleline-html-element-content-newline, vue/max-attributes-per-line, vue/html-self-closing, vue/attributes-order */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchMenu, generateMenu, fetchShoppingList, markRecipeDone } from '../api'
import type { MenuRecipe, ShoppingIngredient } from '../api'
import { weekRange, weekString } from '../week'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const week = ref<string>((route.query.week as string) || weekString(new Date()))
const menu = ref<MenuRecipe[]>([])
const showModal = ref(false)
const selection = ref<Record<string, { dejeuner: boolean; diner: boolean }>>({})
const showShopping = ref(false)
const shopping = ref<ShoppingIngredient[]>([])
const isCurrentWeek = computed(() => weekString(new Date()) === week.value)

const range = computed(() => {
  const { start, end } = weekRange(week.value)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return `${fmt(start)} ${t('common.to')} ${fmt(end)}`
})

async function load() {
  try {
    const m = await fetchMenu(week.value)
    menu.value = m.recettes
  } catch {
    menu.value = []
  }
}

function change(offset: number) {
  const date = weekRange(week.value).start
  date.setUTCDate(date.getUTCDate() + offset * 7)
  const newWeek = weekString(date)
  week.value = newWeek
  router.replace({ query: { week: newWeek } })
  load()
}

function openModal() {
  showModal.value = true
  selection.value = {
    lundi: { dejeuner: true, diner: true },
    mardi: { dejeuner: true, diner: true },
    mercredi: { dejeuner: true, diner: true },
    jeudi: { dejeuner: true, diner: true },
    vendredi: { dejeuner: true, diner: true },
    samedi: { dejeuner: true, diner: true },
    dimanche: { dejeuner: true, diner: true }
  }
}

async function gen() {
  await generateMenu(week.value, selection.value)
  showModal.value = false
  load()
}

async function openShopping() {
  try {
    shopping.value = await fetchShoppingList(week.value)
  } catch {
    shopping.value = []
  }
  showShopping.value = true
}

async function done(day: string, moment: 'dejeuner' | 'diner') {
  await markRecipeDone(week.value, day, moment)
  openShopping()
}

onMounted(load)
</script>
<template>
  <div>
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <h1 class="text-2xl font-bold tracking-tight">{{ $t('menuPage.title', { range }) }}</h1>
      <div class="flex gap-2 flex-wrap">
        <button class="rounded-full border border-line-strong bg-surface text-ink text-sm font-semibold px-4 py-2 hover:border-ink-muted transition" @click="change(-1)">{{ $t('menuPage.previousWeek') }}</button>
        <button class="rounded-full border border-line-strong bg-surface text-ink text-sm font-semibold px-4 py-2 hover:border-ink-muted transition" @click="change(1)">{{ $t('menuPage.nextWeek') }}</button>
        <button class="rounded-full bg-accent text-white text-sm font-semibold px-4 py-2 shadow-card hover:brightness-105 transition" @click="openModal">{{ $t('menuPage.generateMenu') }}</button>
        <button class="rounded-full border border-good/40 text-good-ink text-sm font-semibold px-4 py-2 hover:bg-good-tint transition" @click="openShopping">{{ $t('menuPage.shoppingListWeek') }}</button>
      </div>
    </div>

    <div class="overflow-x-auto pb-1">
      <div class="grid grid-cols-7 gap-3 min-w-[820px]">
        <div v-for="day in ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche']" :key="day" class="flex flex-col gap-2">
          <div class="text-xs font-bold uppercase tracking-wide text-ink-muted pl-1">{{ $t(`days.${day}`) }}</div>

          <div
            class="rounded-ctl border p-2.5 text-sm font-semibold min-h-[52px] flex flex-col justify-center gap-1"
            :class="menu.find(m => m.jour === day && m.moment === 'dejeuner')?.recipe_id ? 'bg-surface border-line shadow-card' : 'border-dashed border-line-strong text-ink-muted font-medium'"
          >
            <template v-if="menu.find(m => m.jour === day && m.moment === 'dejeuner')?.recipe_id">
              <RouterLink
                :to="`/recipes/${menu.find(m => m.jour === day && m.moment === 'dejeuner')!.recipe_id}`"
                class="hover:text-accent transition"
              >
                {{ menu.find(m => m.jour === day && m.moment === 'dejeuner')!.recipe_nom }}
              </RouterLink>
              <button
                v-if="isCurrentWeek"
                class="self-start text-xs font-semibold text-ink-secondary hover:text-good-ink transition"
                @click="done(day, 'dejeuner')"
              >
                {{ $t('menuPage.done') }}
              </button>
            </template>
            <span v-else>{{ $t('menuPage.lunch') }}</span>
          </div>

          <div
            class="rounded-ctl border p-2.5 text-sm font-semibold min-h-[52px] flex flex-col justify-center gap-1"
            :class="menu.find(m => m.jour === day && m.moment === 'diner')?.recipe_id ? 'bg-surface border-line shadow-card' : 'border-dashed border-line-strong text-ink-muted font-medium'"
          >
            <template v-if="menu.find(m => m.jour === day && m.moment === 'diner')?.recipe_id">
              <RouterLink
                :to="`/recipes/${menu.find(m => m.jour === day && m.moment === 'diner')!.recipe_id}`"
                class="hover:text-accent transition"
              >
                {{ menu.find(m => m.jour === day && m.moment === 'diner')!.recipe_nom }}
              </RouterLink>
              <button
                v-if="isCurrentWeek"
                class="self-start text-xs font-semibold text-ink-secondary hover:text-good-ink transition"
                @click="done(day, 'diner')"
              >
                {{ $t('menuPage.done') }}
              </button>
            </template>
            <span v-else>{{ $t('menuPage.dinner') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-ink/40 flex items-center justify-center p-4">
      <div class="bg-surface rounded-card border border-line shadow-card-hover p-5 w-full max-w-md">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-ink-secondary text-xs uppercase tracking-wide">
              <th class="text-left font-semibold pb-2"></th>
              <th class="font-semibold pb-2">{{ $t('menuPage.lunch') }}</th>
              <th class="font-semibold pb-2">{{ $t('menuPage.dinner') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="d in Object.keys(selection)" :key="d">
              <td class="capitalize py-1.5 font-medium">{{ d }}</td>
              <td class="text-center"><input type="checkbox" v-model="selection[d].dejeuner"></td>
              <td class="text-center"><input type="checkbox" v-model="selection[d].diner"></td>
            </tr>
          </tbody>
        </table>
        <div class="mt-4 flex gap-2">
          <button class="rounded-full bg-accent text-white text-sm font-semibold px-4 py-2 shadow-card hover:brightness-105 transition" @click="gen">{{ $t('menuPage.generate') }}</button>
          <button class="rounded-full border border-line-strong bg-surface text-ink text-sm font-semibold px-4 py-2 hover:border-ink-muted transition" @click="showModal=false">{{ $t('menuPage.cancel') }}</button>
        </div>
      </div>
    </div>
    <div v-if="showShopping" class="fixed inset-0 bg-ink/40 flex items-center justify-center p-4">
      <div class="bg-surface rounded-card border border-line shadow-card-hover p-5 w-full max-w-md">
        <h2 class="text-lg font-bold tracking-tight mb-3">{{ $t('menuPage.shoppingList') }}</h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-ink-secondary text-xs uppercase tracking-wide">
              <th class="text-left font-semibold pb-2">{{ $t('addRecipe.name') }}</th>
              <th class="text-right font-semibold pb-2">{{ $t('menuPage.quantityNeeded') }}</th>
              <th class="text-right font-semibold pb-2">{{ $t('menuPage.quantityToBuy') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="ing in shopping" :key="ing.id">
              <td class="py-1.5 font-medium">{{ ing.nom }}</td>
              <td class="text-right tabular-nums text-ink-secondary">{{ ing.quantite }} {{ ing.unite }}</td>
              <td class="text-right tabular-nums font-semibold">{{ ing.manque }} {{ ing.unite }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-4 text-right">
          <button class="rounded-full border border-line-strong bg-surface text-ink text-sm font-semibold px-4 py-2 hover:border-ink-muted transition" @click="showShopping=false">{{ $t('menuPage.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
