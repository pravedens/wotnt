<script setup lang="ts">
import type { Holiday } from '~/types/home';

defineProps<{ holiday: Holiday }>();
</script>

<template>
  <section 
    class="relative overflow-hidden rounded-3xl backdrop-blur-md border border-white/10"
    :style="{ 
      backgroundColor: holiday.styles.bg_color, 
      color: holiday.styles.text_color,
      fontFamily: holiday.styles.font_family 
    }"
  >
    <div class="md:flex items-center">
      <div v-if="holiday.image_url" class="md:w-1/3">
        <img :src="holiday.image_url" alt="Праздник" class="w-full h-64 md:h-full object-cover" />
      </div>
      <div class="p-8 md:w-2/3 flex flex-col justify-center">
        <p class="text-sm font-semibold mb-2 opacity-80">{{ holiday.date }}</p>
        <h2 
          class="text-3xl font-bold mb-4"
          :style="{ fontFamily: holiday.styles.title_font_family }"
        >
          {{ holiday.title }}
        </h2>
        <p class="leading-relaxed text-lg opacity-90">{{ holiday.description }}</p>
      </div>
    </div>
  </section>
</template>