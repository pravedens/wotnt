<!-- app/components/Sermon/Card.vue -->
<template>
  <NuxtLink
    :to="cardLink"
    class="bg-[#3b387d] rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-300 group flex flex-col border border-transparent hover:border-[#5b58a0]"
  >
    <div class="relative h-48 bg-[#2d2a7a] flex-shrink-0">
      <img
        v-if="post.thumbnail_url"
        :src="post.thumbnail_url"
        :alt="post.title"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-500"
      >
        <svg
          class="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div
        class="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium"
      >
        {{ post.category?.title || post.author.name }}
      </div>

      <!-- Избранное -->
      <button
        type="button"
        @click.prevent.stop="onToggleFavorite"
        class="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full text-white hover:text-yellow-400 hover:bg-black/60 transition"
        :class="{ 'text-yellow-400': isFavorited }"
        :disabled="isFavoriting"
        :title="isFavorited ? 'Убрать из избранного' : 'В избранное'"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <h3
        class="font-bold text-lg mb-2 line-clamp-2 text-white group-hover:text-purple-300 transition-colors"
      >
        {{ post.title }}
      </h3>
      <div class="text-xs text-gray-400 mb-3">
        {{ formatDate(post.created_at) }}
      </div>
      <p class="text-sm text-gray-300 line-clamp-3 mb-4 flex-1">
        {{ cleanDescription }}
      </p>

      <div class="flex justify-between items-center text-xs mb-4 mt-auto">
        <div class="flex items-center gap-4">
          <!-- Просмотры -->
          <span class="flex items-center gap-1 text-gray-400">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {{ post.views_count }}
          </span>

          <!-- Лайки (локальное состояние) -->
          <SermonLikeButton
            :post-id="post.id"
            :initial-liked="post.is_liked"
            :initial-count="post.likes_count"
            @update:is-liked="onLikeUpdated"
          />
        </div>
      </div>

      <div
        class="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 rounded-lg text-center font-semibold text-sm text-white group-hover:from-blue-500 group-hover:to-purple-500 transition-all"
      >
        Смотрим
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DOMPurify from 'isomorphic-dompurify'
import type { Post } from '~/types/sermons'
import type { AuthUser } from '~/types/auth'
import { useSermons } from '~/composables/useSermons'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  (
    e: 'update:is-liked',
    id: number,
    liked: boolean,
    count: number,
  ): void
}>()

const route = useRoute()
const { toggleFavorite } = useSermons()
const { user } = useSanctumAuth<AuthUser>()

// Лайками занимается SermonLikeButton.
// В карточке остаётся только состояние избранного.
const isFavorited = ref(props.post.is_favorited ?? false)
const isFavoriting = ref(false)

watch(
  () => props.post.is_favorited,
  (value) => {
    isFavorited.value = value ?? false
  },
)

// Получаем результат от кнопки и передаём родителю ID карточки.
const onLikeUpdated = (liked: boolean, count: number) => {
  emit('update:is-liked', props.post.id, liked, count)
}

const cardLink = computed(() => {
  const query: Record<string, string> = {}

  if (route.query.category) {
    query.category = String(route.query.category)
  }

  if (route.query.group) {
    query.group = String(route.query.group)
  }

  if (route.query.conference) {
    query.conference = String(route.query.conference)
  }

  if (route.query.search) {
    query.search = String(route.query.search)
  }

  if (route.query.page) {
    query.page = String(route.query.page)
  }

  return {
    path: `/sermons/${props.post.slug}`,
    query: Object.keys(query).length > 0 ? query : undefined,
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const cleanDescription = computed(() => {
  if (!props.post.description) return ''

  return DOMPurify.sanitize(props.post.description, {
    ALLOWED_TAGS: [],
  })
})

const onToggleFavorite = async () => {
  if (!user.value) return navigateTo('/auth/login')
  if (!user.value.consent_pd) return navigateTo('/dashboard')
  if (isFavoriting.value) return

  isFavoriting.value = true

  try {
    const result = await toggleFavorite(props.post.id)
    isFavorited.value = result.favorited
  } catch (error) {
    console.error('Ошибка избранного', error)
  } finally {
    isFavoriting.value = false
  }
}
</script>

