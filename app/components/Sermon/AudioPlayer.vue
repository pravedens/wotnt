<!-- app/components/Sermon/AudioPlayer.vue -->
<template>
  <div class="bg-[#4b48a0] rounded-xl p-4 md:p-6 border border-[#5b58a0]">
    
    <!-- Нет URL — показываем заглушку -->
    <div v-if="!audioUrl" class="text-center py-4">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3b387d] mb-3">
        <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
      <p class="text-gray-300 mb-4">
        {{ requiresConsent 
          ? 'Для прослушивания аудио необходимо дать согласие на обработку персональных данных.' 
          : 'Аудио недоступно.' 
        }}
      </p>
      <NuxtLink 
        v-if="requiresConsent" 
        to="/auth/profile" 
        class="inline-block bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-6 rounded-lg transition"
      >
        Перейти в профиль
      </NuxtLink>
    </div>

    <!-- Есть URL — показываем плеер -->
    <div v-else class="flex items-center gap-4">
      <!-- Кнопка Play/Pause -->
      <button 
        @click="togglePlay" 
        class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-purple-900/50"
      >
        <svg v-if="!isPlaying" class="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>
      
      <!-- Прогресс-бар и время -->
      <div class="flex-1">
        <div class="flex justify-between text-xs text-gray-300 mb-2 font-medium">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          :max="duration || 0" 
          v-model="currentTime" 
          @input="seekAudio" 
          class="w-full h-1.5 bg-[#3b387d] rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
      
      <!-- Кнопка скачать -->
      <a 
        :href="audioUrl ?? undefined" 
        download 
        class="flex-shrink-0 w-10 h-10 bg-[#3b387d] hover:bg-[#2d2a7a] rounded-full flex items-center justify-center transition text-gray-300 hover:text-white"
        title="Скачать аудио"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
      </a>
    </div>

    <!-- Скрытый тег audio (рендерится только при наличии URL) -->
    <audio 
      v-if="audioUrl"
      ref="audioPlayer" 
      :src="audioUrl ?? undefined" 
      @timeupdate="updateTime" 
      @loadedmetadata="setDuration"
      @ended="isPlaying = false"
      class="hidden"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  audioUrl: string | null
  requiresConsent: boolean
}>()

const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const togglePlay = () => {
  if (!audioPlayer.value) return
  
  if (audioPlayer.value.paused) {
    audioPlayer.value.play()
    isPlaying.value = true
  } else {
    audioPlayer.value.pause()
    isPlaying.value = false
  }
}

const updateTime = () => {
  if (audioPlayer.value) currentTime.value = audioPlayer.value.currentTime
}

const setDuration = () => {
  if (audioPlayer.value) duration.value = audioPlayer.value.duration
}

const seekAudio = () => {
  if (audioPlayer.value) audioPlayer.value.currentTime = currentTime.value
}

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// Если URL пропал (например, пользователь отозвал согласие в другой вкладке),
// ставим на паузу
watch(() => props.audioUrl, (newVal) => {
  if (!newVal && audioPlayer.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }
})
</script>