<!-- app/components/Sermon/Latest.vue -->
<template>
  <section class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex items-end justify-between mb-6 flex-wrap gap-3">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-white">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm text-gray-400 mt-1">{{ subtitle }}</p>
      </div>
      <NuxtLink
        :to="allLink"
        class="text-sm text-purple-300 hover:text-purple-200 underline transition"
      >
        Все проповеди →
      </NuxtLink>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="i in limit"
        :key="i"
        class="bg-[#3b387d]/50 rounded-xl h-80 animate-pulse border border-[#5b58a0]/30"
      ></div>
    </div>

    <div
      v-else-if="posts.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <SermonCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @update:is-liked="onPostLikeUpdated"
      />
    </div>

    <div
      v-else
      class="text-center py-12 bg-[#3b387d]/50 rounded-2xl border border-dashed border-[#5b58a0]"
    >
      <p class="text-gray-400">Проповедей пока нет.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Post } from "~/types/sermons";
import { useSermons } from "~/composables/useSermons";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    limit?: number;
    allLink?: string;
  }>(),
  {
    title: "Последние проповеди",
    subtitle: "",
    limit: 4,
    allLink: "/sermons",
  },
);

const { getLatestPosts } = useSermons();

const posts = ref<Post[]>([]);
const pending = ref(true);

const onPostLikeUpdated = (id: number, liked: boolean, count: number) => {
  const post = posts.value.find(p => p.id === id)
  if (post) {
    post.is_liked = liked
    post.likes_count = count
  }
}

onMounted(async () => {
  try {
    const response = await getLatestPosts(props.limit);
    posts.value = response.data;
  } catch (e) {
    console.error("Ошибка загрузки последних проповедей", e);
  } finally {
    pending.value = false;
  }
});
</script>
