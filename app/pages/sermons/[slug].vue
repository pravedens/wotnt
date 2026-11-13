<!-- app/pages/sermons/[slug].vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки -->
      <SermonBreadcrumbs
        :post-title="post?.title"
        :post-slug="post?.slug"
        :back-query="backQuery"
      />

      <!-- Состояние загрузки -->
      <div v-if="pending" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"
        ></div>
        <p class="text-white/80 mt-4">Загрузка проповеди...</p>
      </div>

      <!-- Ошибка -->
      <div
        v-else-if="error"
        class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto"
      >
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <NuxtLink
          :to="{ path: '/sermons', query: backQuery }"
          class="inline-block px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Вернуться к списку
        </NuxtLink>
      </div>

      <!-- Контент проповеди -->
      <article v-else-if="post" class="max-w-4xl mx-auto">
        <!-- Герой-секция -->
        <header class="relative rounded-2xl overflow-hidden mb-8 h-96">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="post.title"
            class="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"
          ></div>

          <div class="relative h-full flex flex-col justify-end p-8">
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-if="post.category"
                class="px-3 py-1 text-sm rounded-full bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-400/30"
              >
                {{ post.category.title }}
              </span>
              <span
                v-if="post.group"
                class="px-3 py-1 text-sm rounded-full bg-purple-500/30 text-purple-200 backdrop-blur-sm border border-purple-400/30"
              >
                {{ post.group.title }}
              </span>
              <span
                v-if="post.conference"
                class="px-3 py-1 text-sm rounded-full bg-green-500/30 text-green-200 backdrop-blur-sm border border-green-400/30"
              >
                {{ post.conference.title }}
              </span>
            </div>

            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              {{ post.title }}
            </h1>

            <div class="flex items-center justify-between">
              <p class="text-white/70">{{ formatDate(post.created_at) }}</p>

              <!-- Просмотры и лайки -->
              <div class="flex items-center gap-4 text-white/70">
                <SermonViewsCount
                  :post-id="post.id"
                  :initial-views="post.views_count"
                />
                <SermonLikeButton
                  :post-id="post.id"
                  :initial-liked="post.is_liked"
                  :initial-count="post.likes_count"
                />
              </div>
            </div>
          </div>
        </header>

        <!-- Описание + Текст (объединено под одной кнопкой) -->
        <SermonCollapsibleBlock
          v-if="post.description || post.content"
          title="Описание проповеди"
        >
          <!-- Краткое описание -->
          <div
            v-if="post.description"
            class="text-white/80 whitespace-pre-line leading-relaxed border-l-4 border-pink-500 pl-3 italic mb-6"
          >
            <div v-html="safeDescription"></div>
          </div>

          <!-- Полный текст -->
          <div
            v-if="post.content"
            class="text-white/80 prose prose-invert max-w-none"
          >
            <div v-html="safeContent"></div>
          </div>
        </SermonCollapsibleBlock>

        <!-- Видео Rutube -->
        <ClientOnly v-if="post.rutube">
          <section
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
          >
            <h2 class="text-2xl font-semibold text-white mb-3">
              Видео проповеди на Rutube
            </h2>
            <div class="aspect-video rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                :src="`https://rutube.ru/play/embed/${post.rutube}`"
                frameborder="0"
                allow="clipboard-write; autoplay"
                allowfullscreen
                loading="lazy"
                :title="`Видео проповеди: ${post.title}`"
                referrerpolicy="strict-origin-when-cross-origin"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
              ></iframe>
            </div>
          </section>
          <template #fallback>
            <div class="aspect-video bg-white/5 rounded-lg animate-pulse"></div>
          </template>
        </ClientOnly>

        <!-- Другие платформы -->
        <section v-if="hasMediaLinks" class="mb-8">
          <h2 class="text-2xl font-semibold text-white text-center mb-4">
            Смотреть на других платформах
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <a
              v-if="post.youtube"
              :href="post.youtube"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
              @click="trackExternalLink('YouTube')"
            >
              <img
                class="h-10 mb-2"
                src="/icons/Youtube_red.png"
                alt="YouTube"
                loading="lazy"
              />
              <span class="text-sm text-white">YouTube</span>
            </a>
            <a
              v-if="post.dzen"
              :href="post.dzen"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
              @click="trackExternalLink('Dzen')"
            >
              <img
                class="h-10 mb-2"
                src="/icons/dark-icon.png"
                alt="Яндекс.Дзен"
                loading="lazy"
              />
              <span class="text-sm text-white">Дзен</span>
            </a>
            <a
              v-if="post.vkVideo"
              :href="post.vkVideo"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
              @click="trackExternalLink('VK')"
            >
              <img
                class="h-10 mb-2"
                src="/icons/vk_logo_icon_257028.png"
                alt="VK Видео"
                loading="lazy"
              />
              <span class="text-sm text-white">VK</span>
            </a>
          </div>
        </section>

        <!-- Аудио -->
        <ClientOnly>
          <section v-if="post.audio_file" class="mb-8">
            <h2 class="text-2xl font-semibold text-white mb-3">
              Аудио запись проповеди
            </h2>
            <SermonAudioPlayer
              :audio-url="post.audio_url"
              :requires-consent="!!post.requires_consent"
              @play="trackAudioPlay"
            />
          </section>
        </ClientOnly>

        <!-- Текст файл -->
        <ClientOnly>
          <section v-if="post.text_file" class="mb-8">
            <h2 class="text-2xl font-semibold text-white mb-3">
              Скачать текст проповеди
            </h2>
            <SermonTextDownloader
              :file-url="post.text_file_url"
              :filename="post.text_filename"
              :requires-consent="!!post.requires_consent"
              @download="trackFileDownload('text')"
            />
          </section>
        </ClientOnly>

        <!-- Шаринг -->
        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-white text-center mb-4">
            Поделиться проповедью
          </h2>
          <div class="flex flex-wrap gap-3 justify-center">
            <button
              @click="copyLinkToClipboard"
              class="flex items-center gap-2 px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
              aria-label="Скопировать ссылку"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m1.858-2.648a4 4 0 00-5.656 0l-4 4a4 4 0 005.656 5.656l1.102-1.102"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 13.828a4 4 0 010 5.656l-4 4a4 4 0 01-5.656-5.656l1.102-1.102"
                />
              </svg>
              <span class="hidden sm:inline">Ссылка</span>
            </button>

            <button
              @click="handleShareOK"
              class="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
              aria-label="Поделиться в Одноклассниках"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm6.3 6.3a8 8 0 0 0-12.6 0l1.8 1.8a6 6 0 0 1 9 0zM20 19a10 10 0 0 0-16 0l1.8 1.8a8 8 0 0 1 12.4 0z"
                />
              </svg>
              <span class="hidden sm:inline">Одноклассники</span>
            </button>
          </div>
        </section>

        <!-- Комментарии -->
        <ClientOnly>
          <SermonComments :post-id="post.id" :comments="post.comments" />
        </ClientOnly>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import DOMPurify from "isomorphic-dompurify";
import type { Post } from "~/types/sermons";

const { registerView } = useSermons();

const route = useRoute();
const client = useSanctumClient();

// --- Конфиг ---
const config = useRuntimeConfig();
const { siteUrl } = config.public;

// --- Состояние ---
const post = ref<Post | null>(null);
const pending = ref(true);
const error = ref<string | null>(null);

// --- Получение данных ---
const fetchPost = async () => {
  const slug = route.params.slug as string;
  if (!slug || slug === "undefined") {
    error.value = "Некорректный адрес";
    pending.value = false;
    return;
  }

  try {
    pending.value = true;
    const response = await client<{ data: Post }>(`/api/posts/${slug}`);
    post.value = response.data;
  } catch (err: any) {
    console.error("Ошибка загрузки:", err);
    if (err?.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "Проповедь не найдена",
      });
    }
    error.value = "Не удалось загрузить проповедь.";
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  if (!post.value) fetchPost();
});

// --- Санитизация HTML ---
const safeDescription = computed(() =>
  post.value?.description ? DOMPurify.sanitize(post.value.description) : "",
);
const safeContent = computed(() =>
  post.value?.content ? DOMPurify.sanitize(post.value.content) : "",
);

// --- Форматирование даты ---
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// --- Ссылки ---
const currentUrl = computed(() => `${siteUrl}${route.fullPath}`);
const imageUrl = computed(() => {
  if (!post.value) return null;
  if (post.value.thumbnail_url) return post.value.thumbnail_url;
  if (post.value.thumbnail) {
    if (post.value.thumbnail.startsWith("http")) return post.value.thumbnail;
    return `https://wotgospel-media.storage.yandexcloud.net/${post.value.thumbnail}`;
  }
  return null;
});

const backLink = computed(() => {
  const query: Record<string, string> = {};
  if (route.query.category_id)
    query.category_id = String(route.query.category_id);
  if (route.query.group_id) query.group_id = String(route.query.group_id);
  if (route.query.conference_id)
    query.conference_id = String(route.query.conference_id);
  return {
    path: "/sermons",
    query: Object.keys(query).length > 0 ? query : undefined,
  };
});

const backQuery = computed(() => {
  const q: Record<string, string> = {};
  if (route.query.category) q.category = String(route.query.category);
  if (route.query.group) q.group = String(route.query.group);
  if (route.query.conference) q.conference = String(route.query.conference);
  if (route.query.search) q.search = String(route.query.search);
  if (route.query.page) q.page = String(route.query.page);
  return q;
});

// --- Флаг наличия медиа ---
const hasMediaLinks = computed(() =>
  Boolean(post.value?.youtube || post.value?.dzen || post.value?.vkVideo),
);

watch(
  () => post.value?.id,
  async (id, _previousId, onCleanup) => {
    if (!import.meta.client || id == null) return;

    let stale = false;
    onCleanup(() => {
      stale = true;
    });

    try {
      const result = await registerView(id);

      if (stale || post.value?.id !== id) return;

      if (
        typeof result.views_count === "number" &&
        Number.isFinite(result.views_count)
      ) {
        post.value.views_count = result.views_count;
      }
    } catch (error) {
      console.warn("Не удалось зарегистрировать просмотр", error);
    }
  },
  { immediate: true },
);

// --- Шаринг ---
const copyLinkToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value);
    alert("Ссылка скопирована!");
    trackEvent("copy_link", { sermon_id: post.value?.id });
  } catch {
    alert("Не удалось скопировать ссылку");
  }
};

const handleShareOK = () => {
  const url = `https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodeURIComponent(currentUrl.value)}`;
  if (import.meta.client) window.open(url, "_blank", "width=600,height=400");
  trackEvent("share", { platform: "ok" });
};

// --- Трекинг ---
const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (import.meta.client && (window as any).ym) {
    (window as any).ym(95320948, "reachGoal", eventName, params);
  }
};

const trackAudioPlay = () =>
  trackEvent("audio_play", { sermon_id: post.value?.id });
const trackFileDownload = (type: string) =>
  trackEvent("file_download", { type, sermon_id: post.value?.id });
const trackExternalLink = (platform: string) =>
  trackEvent("external_link_click", { platform });

// --- SEO ---
useServerSeoMeta({
  title: () =>
    post.value ? `${post.value.title} - Слово Истины` : "Проповедь",
  description: () => safeDescription.value.substring(0, 160),
  ogTitle: () => post.value?.title ?? "Слово Истины",
  ogDescription: () => safeDescription.value.substring(0, 160),
  ogImage: () => imageUrl.value ?? undefined,
  ogUrl: () => currentUrl.value,
});
</script>

<style scoped>
.prose {
  color: rgba(255, 255, 255, 0.9);
}
.prose p {
  margin-bottom: 1rem;
  line-height: 1.7;
}
.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  color: white;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}
.prose a {
  color: #93c5fd;
  text-decoration: underline;
}
.prose a:hover {
  color: #bfdbfe;
}
.prose ul,
.prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.prose li {
  margin-bottom: 0.25rem;
}
</style>
