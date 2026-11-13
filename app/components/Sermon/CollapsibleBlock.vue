<!-- app/components/Sermon/CollapsibleBlock.vue -->
<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 mb-6 overflow-hidden">
    <!-- Заголовок (кликабельный) -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
    >
      <h2 class="text-2xl font-semibold text-white">{{ title }}</h2>
      <svg
        class="w-6 h-6 text-white/70 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Контент -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[5000px] opacity-100"
      leave-from-class="max-h-[5000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="isOpen" class="px-6 pb-6 overflow-hidden">
        <slot />

        <!-- Кнопка "Свернуть" в конце -->
        <button
          type="button"
          @click="isOpen = false"
          class="mt-4 text-sm text-purple-300 hover:text-purple-200 underline transition"
        >
          Свернуть
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
}>()

const isOpen = ref(false)
</script>