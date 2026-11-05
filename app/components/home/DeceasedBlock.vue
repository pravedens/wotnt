<script setup lang="ts">
import type { HomeUser, HomepageSetting } from '~/types/home';

defineProps<{
  deceased: HomeUser[];
  settings: HomepageSetting;
}>();
</script>

<template>
  <section 
    class="rounded-3xl backdrop-blur-md border border-white/10 p-8"
    :style="{ 
      backgroundColor: settings.bg_color, 
      color: settings.text_color,
      fontFamily: settings.font_family 
    }"
  >
    <h2 class="text-2xl font-bold mb-2">{{ settings.title }}</h2>
    <p v-if="settings.greeting_text" class="text-sm mb-6 opacity-80">{{ settings.greeting_text }}</p>
    
    <div v-if="deceased.length" class="flex flex-wrap gap-4">
      <div
        v-for="d in deceased"
        :key="d.id"
        class="flex flex-col items-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors w-40 text-center"
      >
        <img
          v-if="d.avatar_url"
          :src="d.avatar_url"
          :alt="d.name"
          class="w-16 h-16 rounded-full object-cover mb-3 shadow-md grayscale"
        />
        <div
          v-else
          class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl shadow-md mb-3 grayscale"
        >
          {{ (d.name ?? 'Г').charAt(0).toUpperCase() }}
        </div>
        
        <span class="text-sm font-medium leading-tight mb-2">{{ d.name }}</span>
        
        <div class="text-xs mt-2 space-y-1 opacity-90">
          <p v-if="d.death_date" class="flex items-center gap-1 justify-center">
            <span>📅</span> <span>{{ d.death_date }}</span>
          </p>
          <p v-if="d.funeral_date" class="flex items-center gap-1 justify-center">
            <span>⚰️</span> <span>{{ d.funeral_date }}</span>
          </p>
        </div>
      </div>
    </div>
    <p v-else class="opacity-60">Информация отсутствует.</p>
  </section>
</template>