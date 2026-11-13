<template>
  <div class="bg-[#3b387d] rounded-xl p-6 md:p-8 mt-8 border border-[#5b58a0]/30">
    <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-white">
      <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      Комментарии <span class="text-sm font-normal text-gray-400">({{ localComments.length }})</span>
    </h2>

    <!-- Не авторизован -->
    <div v-if="!user" class="text-center py-6 bg-[#4b48a0]/50 rounded-xl mb-8 border border-dashed border-[#5b58a0]">
      <p class="text-gray-300 mb-3">Войдите, чтобы оставить комментарий.</p>
      <NuxtLink to="/auth/login" class="inline-block bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
        Войти
      </NuxtLink>
    </div>

    <!-- Авторизован, но нет согласия ПДн -->
    <div v-else-if="!user.consent_pd" class="text-center py-6 bg-[#4b48a0]/50 rounded-xl mb-8 border border-dashed border-[#5b58a0]">
      <p class="text-gray-300 mb-3">Для отправки комментариев необходимо согласие на обработку персональных данных.</p>
      <NuxtLink to="/profile" class="inline-block bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
        Перейти в профиль
      </NuxtLink>
    </div>

    <!-- Форма -->
    <div v-else class="mb-8">
      <textarea 
        v-model="newComment" 
        placeholder="Написать комментарий..." 
        class="w-full bg-[#4b48a0] border border-[#5b58a0] rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 min-h-[100px] resize-y transition"
      ></textarea>
      <div class="flex justify-end mt-3">
        <button 
          @click="submitComment" 
          :disabled="!newComment.trim() || isSubmitting" 
          class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-semibold transition text-white shadow-md"
        >
          {{ isSubmitting ? 'Отправка...' : 'Отправить' }}
        </button>
      </div>
    </div>

    <!-- Список -->
    <div v-if="localComments.length > 0" class="space-y-6">
      <div v-for="comment in localComments" :key="comment.id" class="flex gap-4">
        <div class="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
          <img v-if="comment.user.avatar_url" :src="comment.user.avatar_url" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-white font-bold">{{ comment.user.name.charAt(0) }}</div>
        </div>
        <div class="flex-1">
          <div class="flex items-baseline gap-2 mb-1">
            <span class="font-semibold text-white">{{ comment.user.name }}</span>
            <span class="text-xs text-gray-400">{{ formatDate(comment.created_at) }}</span>
          </div>
          <p class="text-gray-300 text-sm mb-3">{{ comment.content }}</p>
          <div class="flex items-center gap-4 text-xs text-gray-400 font-medium">
            <button @click="onLikeComment(comment)" class="flex items-center gap-1 hover:text-purple-400 transition" :class="{ 'text-purple-400': comment.is_liked }">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {{ comment.likes_count }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8"><p class="text-gray-400">Пока нет комментариев. Будьте первым!</p></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PostComment } from '~/types/sermons'
import type { AuthUser } from '~/types/auth'
import { useSermons } from '~/composables/useSermons'

const props = defineProps<{ postId: number; comments?: PostComment[] }>()

const { addComment, toggleCommentLike } = useSermons()
const { user } = useSanctumAuth<AuthUser>()
const banners = useBanners() // Ваш композабл баннеров

const newComment = ref('')
const isSubmitting = ref(false)
const localComments = ref<PostComment[]>(props.comments || [])

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  isSubmitting.value = true
  try {
    const result = await addComment(props.postId, newComment.value)
    localComments.value.unshift(result.comment)
    newComment.value = ''
  } catch (e: any) {
    if (e?.response?._data?.code === 'CONSENT_REQUIRED') {
      banners.error('Дайте согласие на обработку персональных данных в профиле.')
    } else {
      banners.error('Не удалось отправить комментарий.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const onLikeComment = async (comment: PostComment) => {
  if (!user.value) {
    return navigateTo('/auth/login')
  }
  try {
    const result = await toggleCommentLike(comment.id)
    comment.is_liked = result.liked
    comment.likes_count = result.count
  } catch (e) {
    console.error(e)
  }
}
</script>