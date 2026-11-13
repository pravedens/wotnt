<!-- app/components/Sermon/TextDownloader.vue -->
<template>
  <div class="bg-[#4b48a0] rounded-xl p-4 md:p-5 border border-[#5b58a0] flex flex-col sm:flex-row justify-between items-center gap-4">
    
    <div class="flex items-center gap-4 w-full sm:w-auto">
      <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
      <div>
        <div class="font-semibold text-white line-clamp-1" :title="filename ?? undefined">
          {{ filename ?? 'Текст проповеди' }}
        </div>
        <div class="text-xs text-gray-400">Документ</div>
      </div>
    </div>

    <!-- Нет URL — подсказка -->
    <div v-if="!fileUrl" class="text-sm text-gray-400 text-center sm:text-right w-full sm:w-auto">
      <template v-if="requiresConsent">
        <NuxtLink to="/profile" class="text-purple-400 hover:underline">Согласитесь на обработку ПД</NuxtLink>, чтобы скачать.
      </template>
      <template v-else>
        Файл недоступен.
      </template>
    </div>

    <!-- Есть URL — кнопка скачивания -->
    <a 
      v-else 
      :href="fileUrl ?? undefined" 
      download 
      class="w-full sm:w-auto bg-[#5b58a0] hover:bg-[#6c69b5] px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition text-white shadow-sm"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg> 
      Скачать файл
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  fileUrl: string | null
  filename: string | null
  requiresConsent: boolean
}>()
</script>