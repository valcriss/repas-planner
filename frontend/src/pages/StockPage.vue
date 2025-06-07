<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchStock, updateStock } from '../api'
import type { StockItem } from '../api'

const { t } = useI18n()
const stock = ref<StockItem[]>([])

async function load() {
  try {
    stock.value = await fetchStock()
  } catch {
    stock.value = []
  }
}

async function save(id: string, quantite: string) {
  await updateStock(id, quantite)
}

onMounted(load)
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">
      {{ t('stockPage.title') }}
    </h1>
    <table class="w-full text-left">
      <thead>
        <tr>
          <th>{{ t('addRecipe.name') }}</th>
          <th>{{ t('stockPage.quantity') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="s in stock"
          :key="s.id"
        >
          <td>
            {{ s.nom }} ({{ s.unite || '-' }})
          </td>
          <td>
            <input
              class="border p-1 w-20"
              :value="s.quantite"
              @change="save(s.id, ($event.target as HTMLInputElement).value)"
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
