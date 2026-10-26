<script setup lang="ts">
const year = new Date().getFullYear();

const footerLinks = [
  {
    title: "События",
    links: [
      { name: "Проповеди", href: "/sermons" },
      { name: "Календарь", href: "/events" },
    ],
  },
  {
    title: "Церковь",
    links: [
      { name: "О нас", href: "/about" },
      { name: "Служители", href: "/ministers" },
      { name: "Контакты", href: "/contacts" },
      { name: "Помощь", href: "/help" },
    ],
  },
  {
    title: "Правовое",
    links: [
      { name: "Политика конфиденциальности", href: "/privacy" },
      { name: "Условия использования", href: "/terms" },
    ],
  },
];
</script>

<template>
  <footer
    class="w-full border-t border-white/10 bg-[#1e1b4b]/60 backdrop-blur-md"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Логотип и описание -->
        <div
          class="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <img
              src="/icons/logo-header-72x72.png"
              alt="Слово Истины"
              class="w-12 h-12 rounded-lg object-contain shadow-lg shadow-purple-500/30 group-hover:scale-105 transition"
            />
            <span class="text-white font-bold text-lg tracking-wide"
              >Слово Истины</span
            >
          </NuxtLink>
          <p class="mt-4 text-sm text-gray-300 leading-relaxed">
            Короткое описание вашего продукта или сайта.
          </p>
        </div>

        <!-- Колонки со ссылками -->
        <div
          v-for="column in footerLinks"
          :key="column.title"
          class="text-center md:text-left"
        >
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
            {{ column.title }}
          </h3>
          <ul class="mt-4 space-y-2">
            <li v-for="link in column.links" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="text-sm text-gray-300 hover:text-white transition"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Нижняя строка -->
      <div
        class="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="text-sm text-gray-400 text-center sm:text-left">
          © {{ year }} Местная религиозная организация Церковь Христиан Веры
          Евангельской (пятидесятников) "СЛОВО ИСТИНЫ" г.Нижнего Тагила. Все
          права защищены.
        </p>
        <div class="flex items-center gap-4">
          <!-- Соцсети (замените ссылки на свои) -->
          <a
            href="#"
            class="text-gray-400 hover:text-white transition"
            aria-label="Telegram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
              />
            </svg>
          </a>
          <a
            href="https://vk.ru/truechurch"
            class="text-gray-400 hover:text-white transition"
            aria-label="VK"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974H.539c-.315 0-.592.261-.592.782 0 .747.961 4.615 4.298 9.729 2.225 3.404 4.842 5.037 7.117 5.037z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
