<!-- app/components/Sermon/Breadcrumbs.vue -->
<template>
  <nav class="text-sm text-gray-300 flex items-center gap-2 mb-6" aria-label="Хлебные крошки">
    <NuxtLink to="/" class="hover:text-white transition">Главная</NuxtLink>
    <span>›</span>

    <!-- Возврат на список с сохранением фильтров и страницы -->
    <NuxtLink :to="sermonsLink" class="hover:text-white transition">Проповеди</NuxtLink>

    <!-- Если передан title (страница избранного, категория и т.п.) -->
    <template v-if="title">
      <span>›</span>
      <span class="text-white">{{ title }}</span>
    </template>

    <!-- Иначе — название проповеди (детальная страница) -->
    <template v-else-if="postTitle">
      <span>›</span>
      <span class="text-white truncate max-w-xs" :title="postTitle">{{ postTitle }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  postTitle?: string
  postSlug?: string
  title?: string
  backQuery?: Record<string, string>
}>()

const sermonsLink = computed(() => {
  const q = props.backQuery || {}
  return {
    path: '/sermons',
    query: Object.keys(q).length > 0 ? q : undefined,
  }
})
</script>