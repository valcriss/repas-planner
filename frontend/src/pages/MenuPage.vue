<script setup lang="ts">
const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]
</script>
<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">
      Weekly Menu
    </h1>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="day in days"
        :key="day"
        class="bg-white rounded shadow p-4"
      >
        <h2 class="font-medium mb-2">
          {{ day }}
        </h2>
        <p class="text-sm text-gray-600">
          Lunch: Recipe placeholder
        </p>
        <p class="text-sm text-gray-600">
          Dinner: Recipe placeholder
        </p>
      </div>
    </div>
  </div>
</template>
