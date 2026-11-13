<!-- app/pages/sermons/favorites.vue -->
<template>
  <div class="bg-[#2d2a7a] min-h-screen text-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Хлебные крошки -->
      <SermonBreadcrumbs title="Избранное" />

      <!-- Заголовок -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">
          Избранное
          <span class="text-purple-300 text-2xl font-normal">({{ total }})</span>
        </h1>
        <p class="text-gray-400">Сохранённые проповеди для повторного прослушивания</p>
      </div>

      <!-- Загрузка -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка...</p>
      </div>

      <!-- Пусто -->
      <div
        v-else-if="posts.length === 0"
        class="text-center py-20 bg-[#3b387d]/50 rounded-2xl border border-dashed border-[#5b58a0]"
      >
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h3 class="text-lg font-medium text-white">В избранном пока пусто</h3>
        <p class="mt-1 text-gray-400">Добавляйте проповеди в избранное, чтобы вернуться к ним позже.</p>
        <NuxtLink
          to="/sermons"
          class="mt-6 inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-2.5 px-6 rounded-lg transition"
        >
          Перейти к проповедям
        </NuxtLink>
      </div>

      <!-- Сетка -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SermonCard v-for="post in posts" :key="post.id" :post="post" />
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center gap-2 flex-wrap">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="px-4 py-2 rounded-lg transition min-w-[40px]"
          :class="currentPage === page
            ? 'bg-purple-600 text-white font-bold'
            : 'bg-[#4b48a0] hover:bg-[#5b58a0] text-gray-300'"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Post } from '~/types/sermons'

definePageMeta({ middleware: 'sanctum:auth' })

const client = useSanctumClient()

const posts = ref<Post[]>([])
const total = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const pending = ref(true)

const fetchFavorites = async (page = 1) => {
  pending.value = true
  try {
    const response = await client<{
      data: Post[]
      meta: { total: number; last_page: number; current_page: number }
    }>(`/api/user/favorites?page=${page}`)
    posts.value = response.data
    total.value = response.meta.total
    totalPages.value = response.meta.last_page
    currentPage.value = response.meta.current_page
  } catch (e) {
    console.error('Ошибка загрузки избранного', e)
  } finally {
    pending.value = false
  }
}

const goToPage = (page: number) => {
  fetchFavorites(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => fetchFavorites())
</script>