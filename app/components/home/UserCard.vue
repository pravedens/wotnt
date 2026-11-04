<script setup lang="ts">
import type { HomeUser } from '~/types/home';

defineProps<{
  user: HomeUser;
  variant?: 'default' | 'deceased';
}>();
</script>

<template>
  <div
    class="flex flex-col items-center p-4 rounded-2xl border transition-colors w-32"
    :class="
      variant === 'deceased'
        ? 'bg-white/5 border-white/10 grayscale opacity-80'
        : 'bg-white/5 border-white/10 hover:bg-white/10'
    "
  >
    <img
      v-if="user.avatar_url"
      :src="user.avatar_url"
      :alt="user.name"
      class="w-16 h-16 rounded-full object-cover mb-3 shadow-md"
    />
    <div
      v-else
      class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md mb-3"
    >
      {{ (user.name ?? 'Г').charAt(0).toUpperCase() }}
    </div>
    <span class="text-sm text-center text-gray-200 font-medium leading-tight">
      {{ user.name }}
    </span>
  </div>
</template>