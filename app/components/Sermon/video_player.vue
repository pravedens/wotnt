<template>
  <div v-if="video">
    <div v-if="!video.can_view" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center">
      <p class="text-red-200">{{ video.message }}</p>
    </div>
    <div v-else class="aspect-video rounded-lg overflow-hidden">
      <iframe
        v-if="video.platform === 'rutube'"
        width="100%"
        height="100%"
        :src="`https://rutube.ru/play/embed/${video.url}`"
        frameborder="0"
        allow="clipboard-write; autoplay"
        allowfullscreen
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
      <iframe
        v-else-if="video.platform === 'vk'"
        width="100%"
        height="100%"
        :src="vkEmbedUrl"
        frameborder="0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface VideoData {
  platform: 'rutube' | 'vk'
  url: string
  can_view: boolean
  message: string | null
}

const props = defineProps<{ video: VideoData | null }>()

const vkEmbedUrl = computed(() => {
  if (!props.video || props.video.platform !== 'vk') return ''
  // VK-видео: ссылка вида https://vk.com/video-123456_7891011
  // Для iframe: https://vk.com/video_ext.php?oid=-123456&id=7891011
  const match = props.video.url.match(/video(-?\d+)_(\d+)/)
  if (!match) return ''
  const [, oid, id] = match
  return `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2`
})
</script>