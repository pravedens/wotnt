<!-- app/pages/sermons/index.vue -->
<template>
  <div class="bg-[#2d2a7a] min-h-screen text-white p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Хлебные крошки -->
      <div class="mb-8 text-sm text-gray-300 flex items-center gap-2">
        <NuxtLink to="/" class="hover:text-white transition">Главная</NuxtLink>
        <span>›</span>
        <span class="text-white">Проповеди</span>
      </div>

      <!-- Заголовок и Поиск -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold mb-6">
          Проповеди
          <span class="text-purple-300 text-2xl font-normal"
            >({{ total }})</span
          >
        </h1>

        <div class="max-w-2xl mx-auto relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            type="text"
            placeholder="Введите не менее 3 символов для поиска..."
            class="w-full bg-[#4b48a0]/50 border border-[#5b58a0] rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-[#4b48a0] transition"
          />
          <div
            v-if="isSearching"
            class="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <svg
              class="animate-spin h-5 w-5 text-purple-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Фильтры -->
      <div
        class="bg-[#3b387d] rounded-2xl p-6 mb-10 shadow-lg border border-[#5b58a0]/30"
      >
        <div class="flex items-center gap-2 mb-4 text-gray-300">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span class="font-semibold text-white">Фильтры</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm text-gray-300 mb-2">Спикер</label>
            <div class="relative">
              <select
                v-model="filters.category"
                @change="applyFilters"
                class="w-full bg-[#4b48a0] border border-[#5b58a0] rounded-lg py-3 px-4 text-white appearance-none focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="">Все спикеры</option>
                <option
                  v-for="cat in filterData.categories"
                  :key="cat.slug"
                  :value="cat.slug"
                >
                  {{ cat.title }} ({{ cat.posts_count || 0 }})
                </option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-300"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-2">Год</label>
            <div class="relative">
              <select
                v-model="filters.group"
                @change="applyFilters"
                class="w-full bg-[#4b48a0] border border-[#5b58a0] rounded-lg py-3 px-4 text-white appearance-none focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="">Все годы</option>
                <option
                  v-for="grp in filterData.groups"
                  :key="grp.slug"
                  :value="grp.slug"
                >
                  {{ grp.title }} ({{ grp.posts_count || 0 }})
                </option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-300"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-2">Мероприятие</label>
            <div class="relative">
              <select
                v-model="filters.conference"
                @change="applyFilters"
                class="w-full bg-[#4b48a0] border border-[#5b58a0] rounded-lg py-3 px-4 text-white appearance-none focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="">Все мероприятия</option>
                <option
                  v-for="conf in filterData.conferences"
                  :key="conf.slug"
                  :value="conf.slug"
                >
                  {{ conf.title }} ({{ conf.posts_count || 0 }})
                </option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-300"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div
          class="mt-6 flex flex-col sm:flex-row justify-between items-center border-t border-[#5b58a0]/50 pt-4 gap-4"
        >
          <span class="text-sm text-gray-300">
            Найдено проповедей:
            <span class="text-white font-semibold">{{ total }}</span>
          </span>
          <button
            @click="resetFilters"
            class="bg-transparent border border-[#5b58a0] hover:bg-[#5b58a0] px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto"
          >
            Сбросить все фильтры
          </button>
        </div>
      </div>

      <!-- Скелетоны при первой загрузке -->
      <div
        v-if="pending && posts.length === 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="bg-[#3b387d]/50 rounded-xl h-[420px] animate-pulse border border-[#5b58a0]/30"
        ></div>
      </div>

      <!-- Сетка -->
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

      <!-- Пусто -->
      <div
        v-else
        class="text-center py-20 bg-[#3b387d]/50 rounded-2xl border border-dashed border-[#5b58a0]"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 class="text-lg font-medium text-white">Ничего не найдено</h3>
        <p class="mt-1 text-gray-400">
          Попробуйте изменить параметры поиска или сбросить фильтры.
        </p>
        <button
          @click="resetFilters"
          class="mt-4 text-purple-400 hover:text-purple-300 underline"
        >
          Сбросить фильтры
        </button>
      </div>

      <!-- Пагинация -->
      <nav
        v-if="totalPages > 1 && !pending"
        class="mt-12 flex justify-center items-center gap-2 flex-wrap"
        aria-label="Пагинация"
      >
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#4b48a0] hover:bg-[#5b58a0] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="В начало"
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
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#4b48a0] hover:bg-[#5b58a0] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Назад"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <template v-for="(page, idx) in paginationRange" :key="idx">
          <span
            v-if="page === '...'"
            class="w-10 h-10 flex items-center justify-center text-gray-400"
            >...</span
          >
          <button
            v-else
            @click="goToPage(Number(page))"
            class="w-10 h-10 flex items-center justify-center rounded-lg transition font-semibold"
            :class="
              currentPage === page
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-900/50'
                : 'bg-[#4b48a0] hover:bg-[#5b58a0] text-gray-300'
            "
          >
            {{ page }}
          </button>
        </template>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#4b48a0] hover:bg-[#5b58a0] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Вперёд"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#4b48a0] hover:bg-[#5b58a0] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="В конец"
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
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Post, Category, Group, Conference } from "~/types/sermons";
import { useSermons } from "~/composables/useSermons";

const route = useRoute();
const router = useRouter();
const { getPosts, getFiltersData } = useSermons();

const posts = ref<Post[]>([]);
const filterData = ref<{
  categories: Category[];
  groups: Group[];
  conferences: Conference[];
}>({
  categories: [],
  groups: [],
  conferences: [],
});
const total = ref(0);
const totalPages = ref(1);
const currentPage = ref(Number(route.query.page) || 1);
const searchQuery = ref((route.query.search as string) || "");
const isSearching = ref(false);
const pending = ref(true); // ← для скелетона

const filters = ref({
  category: (route.query.category as string) || "",
  group: (route.query.group as string) || "",
  conference: (route.query.conference as string) || "",
});

const onPostLikeUpdated = (id: number, liked: boolean, count: number) => {
  const post = posts.value.find(p => p.id === id)
  if (post) {
    post.is_liked = liked
    post.likes_count = count
  }
}

const fetchPosts = async () => {
  isSearching.value = true;
  try {
    const response = await getPosts({
      ...filters.value,
      search: searchQuery.value.length >= 3 ? searchQuery.value : undefined,
      page: currentPage.value,
    });
    posts.value = response.data;
    total.value = response.meta.total;
    totalPages.value = response.meta.last_page;
  } finally {
    isSearching.value = false;
    pending.value = false;
  }
};

const fetchFilters = async () => {
  try {
    const data = await getFiltersData({
      category: filters.value.category || undefined,
      group: filters.value.group || undefined,
      conference: filters.value.conference || undefined,
      search: searchQuery.value.length >= 3 ? searchQuery.value : undefined,
    });
    filterData.value = data;
  } catch (e) {
    console.error("Ошибка загрузки фильтров:", e);
  }
};

// ✅ SSR не грузит, только клиент — быстро и без mismatch
onMounted(async () => {
  await Promise.all([fetchFilters(), fetchPosts()]);
});

const applyFilters = async () => {
  currentPage.value = 1;
  router.push({
    query: {
      category: filters.value.category || undefined,
      group: filters.value.group || undefined,
      conference: filters.value.conference || undefined,
      search: searchQuery.value.length >= 3 ? searchQuery.value : undefined,
    },
  });
  await Promise.all([fetchPosts(), fetchFilters()]);
};

const resetFilters = async () => {
  filters.value = { category: "", group: "", conference: "" };
  searchQuery.value = "";
  currentPage.value = 1;
  router.push({ query: {} });
  await Promise.all([fetchPosts(), fetchFilters()]);
};

let searchTimeout: ReturnType<typeof setTimeout>;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.length === 0 || searchQuery.value.length >= 3) {
      applyFilters();
    }
  }, 500);
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  currentPage.value = page;
  router.push({
    query: {
      category: filters.value.category || undefined,
      group: filters.value.group || undefined,
      conference: filters.value.conference || undefined,
      search: searchQuery.value.length >= 3 ? searchQuery.value : undefined,
      page: page > 1 ? String(page) : undefined,
    },
  });
  fetchPosts();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const paginationRange = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  const range: (number | string)[] = [1];
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("...");
  if (total > 1) range.push(total);
  return range;
});

watch(
  () => route.query,
  (newQuery) => {
    filters.value = {
      category: (newQuery.category as string) || "",
      group: (newQuery.group as string) || "",
      conference: (newQuery.conference as string) || "",
    };
    searchQuery.value = (newQuery.search as string) || "";
    currentPage.value = Number(newQuery.page) || 1;
    fetchPosts();
    fetchFilters();
  },
);
</script>
