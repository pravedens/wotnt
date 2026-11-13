<!-- app/components/Sermon/LikeButton.vue -->
<template>
  <button
    type="button"
    @click.prevent.stop="onClick"
    :disabled="loading"
    class="flex items-center gap-1 transition disabled:opacity-50"
    :class="isLiked ? 'text-red-400' : 'text-white/70 hover:text-red-400'"
    :title="isLiked ? 'Убрать лайк' : 'Поставить лайк'"
  >
    <svg
      class="w-4 h-4 transition-transform"
      :class="{ 'scale-110': isLiked }"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
    {{ count }}
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSermons } from "~/composables/useSermons";
import type { AuthUser } from "~/types/auth";

const props = defineProps<{
  postId: number;
  initialLiked?: boolean;
  initialCount?: number;
}>();

const emit = defineEmits<{
  (e: "update:is-liked", liked: boolean, count: number): void;
}>();

const { toggleLike } = useSermons();
const { user } = useSanctumAuth<AuthUser>();

const loading = ref(false);
const isLiked = ref(props.initialLiked ?? false);
const count = ref(props.initialCount ?? 0);

// если сервер прислал новые данные — синхронизируем
watch(
  () => props.initialLiked,
  (v) => {
    if (typeof v === "boolean") isLiked.value = v;
  },
);
watch(
  () => props.initialCount,
  (v) => {
    if (typeof v === "number") count.value = v;
  },
);

const onClick = async () => {
  if (!user.value) return navigateTo("/auth/login");
  if (!user.value.consent_pd) return navigateTo("/dashboard");
  if (loading.value) return;

  loading.value = true;
  try {
    const result = await toggleLike(props.postId);
    isLiked.value = result.liked;
    count.value = result.count;
    emit("update:is-liked", result.liked, result.count);
  } catch (e) {
    console.error("Не удалось переключить лайк", e);
  } finally {
    loading.value = false;
  }
};
</script>
