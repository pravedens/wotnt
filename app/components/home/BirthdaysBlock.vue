<script setup lang="ts">
import type { HomeUser } from '~/types/home';

defineProps<{
  birthdays: HomeUser[];
}>();
</script>

<template>
  <section class="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8">
    <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      🎉 Дни рождения в этом месяце
    </h2>
    <div v-if="birthdays.length" class="flex flex-wrap gap-4">
      <HomeUserCard
        v-for="b in birthdays"
        :key="b.id"
        :user="b"
      />
    </div>
    <p v-else class="text-gray-400">В этом месяце дней рождения нет.</p>
  </section>
</template>