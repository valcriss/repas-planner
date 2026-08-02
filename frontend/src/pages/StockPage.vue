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
    <h1 class="text-2xl font-bold tracking-tight mb-6">
      {{ t('stockPage.title') }}
    </h1>
    <div class="rounded-card border border-line bg-surface shadow-card divide-y divide-line overflow-hidden">
      <div
        v-for="s in stock"
        :key="s.id"
        class="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3"
      >
        <div class="font-semibold text-sm">
          {{ s.nom }}
          <span class="text-ink-muted font-normal">{{ s.unite ? `(${s.unite})` : '' }}</span>
        </div>
        <input
          class="border border-line-strong rounded-ctl p-2 w-20 bg-bg text-right tabular-nums focus:border-accent transition"
          :value="s.quantite"
          @change="save(s.id, ($event.target as HTMLInputElement).value)"
        >
        <span
          class="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
          :class="parseFloat(s.quantite) > 0 ? 'bg-good-tint text-good-ink' : 'bg-danger-tint text-danger-ink'"
        >
          {{ parseFloat(s.quantite) > 0 ? t('stockPage.inStock') : t('stockPage.outOfStock') }}
        </span>
      </div>
    </div>
  </div>
</template>
