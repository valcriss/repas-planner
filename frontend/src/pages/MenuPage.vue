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
    <h1 class="text-2xl font-bold mb-4">{{ $t('menuPage.title', { range }) }}</h1>
    <div class="mb-2 flex space-x-2">
      <button class="px-2 py-1 bg-gray-200" @click="change(-1)">{{ $t('menuPage.previousWeek') }}</button>
      <button class="px-2 py-1 bg-gray-200" @click="change(1)">{{ $t('menuPage.nextWeek') }}</button>
      <button class="px-2 py-1 bg-blue-600 text-white" @click="openModal">{{ $t('menuPage.generateMenu') }}</button>
      <button class="ml-auto px-2 py-1 bg-green-600 text-white" @click="openShopping">{{ $t('menuPage.shoppingListWeek') }}</button>
    </div>
    <table class="w-full text-left">
      <thead>
        <tr>
          <th>{{ $t('menuPage.day') }}</th>
          <th>{{ $t('menuPage.lunch') }}</th>
          <th>{{ $t('menuPage.dinner') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche']" :key="day">
          <td class="capitalize">{{ $t(`days.${day}`) }}</td>
          <td>
            <RouterLink
              v-if="menu.find(m => m.jour === day && m.moment === 'dejeuner')?.recipe_id"
              :to="`/recipes/${menu.find(m => m.jour === day && m.moment === 'dejeuner')!.recipe_id}`"
              class="text-blue-600"
            >
              {{ menu.find(m => m.jour === day && m.moment === 'dejeuner')!.recipe_nom }}
            </RouterLink>
            <span v-else>-</span>
            <button
              v-if="isCurrentWeek && menu.find(m => m.jour === day && m.moment === 'dejeuner')?.recipe_id"
              class="ml-2 px-1 bg-gray-200"
              @click="done(day, 'dejeuner')"
            >
              {{ $t('menuPage.done') }}
            </button>
          </td>
          <td>
            <RouterLink
              v-if="menu.find(m => m.jour === day && m.moment === 'diner')?.recipe_id"
              :to="`/recipes/${menu.find(m => m.jour === day && m.moment === 'diner')!.recipe_id}`"
              class="text-blue-600"
            >
              {{ menu.find(m => m.jour === day && m.moment === 'diner')!.recipe_nom }}
            </RouterLink>
            <span v-else>-</span>
            <button
              v-if="isCurrentWeek && menu.find(m => m.jour === day && m.moment === 'diner')?.recipe_id"
              class="ml-2 px-1 bg-gray-200"
              @click="done(day, 'diner')"
            >
              {{ $t('menuPage.done') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-4">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>{{ $t('menuPage.lunch') }}</th>
              <th>{{ $t('menuPage.dinner') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in Object.keys(selection)" :key="d">
              <td class="capitalize">{{ d }}</td>
              <td><input type="checkbox" v-model="selection[d].dejeuner"></td>
              <td><input type="checkbox" v-model="selection[d].diner"></td>
            </tr>
          </tbody>
        </table>
        <div class="mt-2 space-x-2">
          <button class="px-2 py-1 bg-blue-600 text-white" @click="gen">{{ $t('menuPage.generate') }}</button>
          <button class="px-2 py-1 bg-gray-200" @click="showModal=false">{{ $t('menuPage.cancel') }}</button>
        </div>
      </div>
    </div>
    <div v-if="showShopping" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-4">
        <h2 class="text-lg font-bold mb-2">{{ $t('menuPage.shoppingList') }}</h2>
        <table>
          <thead>
            <tr>
              <th>{{ $t('addRecipe.name') }}</th>
              <th>{{ $t('menuPage.quantityNeeded') }}</th>
              <th>{{ $t('menuPage.quantityToBuy') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ing in shopping" :key="ing.id">
              <td>{{ ing.nom }}</td>
              <td>{{ ing.quantite }} {{ ing.unite }}</td>
              <td>{{ ing.manque }} {{ ing.unite }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-2 text-right">
          <button class="px-2 py-1 bg-gray-200" @click="showShopping=false">{{ $t('menuPage.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
