<script setup lang="ts">
import type { HomeUser, HomepageSetting } from '~/types/home';

defineProps<{
  birthdays: HomeUser[];
  settings: HomepageSetting;
}>();
</script>

<template>
  <!-- ✅ Общий фон применяется к секции -->
  <section 
    class="rounded-3xl backdrop-blur-md border border-white/10 p-8"
    :style="{ 
      backgroundColor: `color-mix(in srgb, ${settings.bg_color} 40%, transparent)`,
      color: settings.text_color,
      fontFamily: settings.font_family 
    }"
  >
    <h2 class="text-2xl font-bold mb-2">{{ settings.title }}</h2>
    <p v-if="settings.greeting_text" class="text-sm mb-6 opacity-80">{{ settings.greeting_text }}</p>
    
    <div v-if="birthdays.length" class="flex flex-wrap gap-4">
      <!-- ✅ Карточки стали просто полупрозрачными -->
      <div
        v-for="b in birthdays"
        :key="b.id"
        class="flex flex-col items-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors w-32"
      >
        <img
          v-if="b.avatar_url"
          :src="b.avatar_url"
          :alt="b.name"
          class="w-16 h-16 rounded-full object-cover mb-3 shadow-md"
        />
        <div
          v-else
          class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl shadow-md mb-3"
        >
          {{ (b.name ?? 'Г').charAt(0).toUpperCase() }}
        </div>
        <span class="text-sm text-center font-medium leading-tight">{{ b.name }}</span>
      </div>
    </div>
    <p v-else class="opacity-60">В этом месяце дней рождения нет.</p>
  </section>
</template>