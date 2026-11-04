<script setup lang="ts">
import type { Holiday } from '~/types/home';

defineProps<{
  holiday: Holiday;
}>();
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
    <div class="md:flex items-center">
      <div v-if="holiday.image_url" class="md:w-1/3">
        <img
          :src="holiday.image_url"
          alt="Праздник"
          class="w-full h-64 md:h-full object-cover"
        />
      </div>
      <div class="p-8 md:w-2/3 flex flex-col justify-center">
        <p class="text-sm font-semibold text-amber-400 mb-2">
          {{ holiday.date }}
        </p>
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ holiday.title }}
        </h2>
        <p class="text-gray-300 leading-relaxed text-lg">
          {{ holiday.description }}
        </p>
      </div>
    </div>
  </section>
</template>