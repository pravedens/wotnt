<script setup lang="ts">
import { ref } from 'vue';
import type { AuthUser } from '~/types/auth';

const { user, logout } = useSanctumAuth<AuthUser>();
const router = useRouter();

const isMobileMenuOpen = ref(false);
const isUserMenuOpen = ref(false);

const navigation = [
  { name: 'Главная', href: '/' },
];

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

/** Инициалы для аватара: "Иван Петров" → "ИП", "admin" → "A" */
const getInitials = useInitials();
const initials = computed(() => getInitials(user.value?.name));

const handleLogout = async () => {
  closeUserMenu();
  closeMobileMenu();
  await logout();
  await router.push('/auth/login');
};

/** Закрываем меню пользователя при клике вне его */
const userMenuRef = ref<HTMLElement | null>(null);
const onDocumentClick = (e: MouseEvent) => {
  if (!isUserMenuOpen.value) return;
  const target = e.target as Node;
  if (userMenuRef.value && !userMenuRef.value.contains(target)) {
    closeUserMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<template>
  <header class="w-full z-40">
    <div class="bg-[#1e1b4b]/70 backdrop-blur-md border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Логотип -->
          <NuxtLink to="/" class="flex items-center gap-2 group" @click="closeMobileMenu">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-white font-bold text-lg tracking-wide">WoW</span>
          </NuxtLink>

          <!-- Десктоп-меню -->
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="item in navigation"
              :key="item.href"
              :to="item.href"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 transition"
              active-class="text-white bg-white/10"
            >
              {{ item.name }}
            </NuxtLink>
          </nav>

          <!-- Правый блок: гости или авторизованный -->
          <div class="hidden md:flex items-center gap-3">

            <!-- Гость -->
            <template v-if="!user">
              <NuxtLink to="/auth/login" class="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition">
                Войти
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/20 transition"
              >
                Начать
              </NuxtLink>
            </template>

            <!-- Авторизован: аватар + меню -->
            <div v-else ref="userMenuRef" class="relative">
              <button
                type="button"
                @click="isUserMenuOpen = !isUserMenuOpen"
                class="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                aria-label="Меню пользователя"
              >
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-purple-500/30 ring-2 ring-white/10 hover:ring-white/30 transition">
                  {{ initials }}
                </div>
              </button>

              <!-- Выпадающее меню -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 -translate-y-1 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 -translate-y-1 scale-95"
              >
                <div
                  v-if="isUserMenuOpen"
                  class="absolute right-0 mt-2 w-64 rounded-xl bg-[#1e1b4b]/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden origin-top-right"
                >
                  <!-- Шапка меню с информацией -->
                  <div class="px-4 py-3 border-b border-white/10">
                    <p class="text-sm font-semibold text-white truncate">
                      {{ user.name ?? 'Пользователь' }}
                    </p>
                    <p v-if="user.email" class="text-xs text-gray-300 truncate mt-0.5">
                      {{ user.email }}
                    </p>
                  </div>

                  <!-- Пункты меню -->
                  <div class="py-1">
                    <NuxtLink
                      to="/dashboard"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:text-white hover:bg-white/10 transition"
                      @click="closeUserMenu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </NuxtLink>

                    <NuxtLink
                      to="/profile"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:text-white hover:bg-white/10 transition"
                      @click="closeUserMenu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Профиль
                    </NuxtLink>
                  </div>

                  <!-- Выход -->
                  <div class="border-t border-white/10 py-1">
                    <button
                      type="button"
                      @click="handleLogout"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Выйти
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

          </div>

          <!-- Мобильный бургер -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-200 hover:bg-white/10 transition"
            aria-label="Открыть меню"
          >
            <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

        </div>
      </div>
    </div>

    <!-- Мобильное меню -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden bg-[#1e1b4b]/95 backdrop-blur-md border-b border-white/10">
        <div class="px-4 pt-2 pb-4 space-y-1">

          <!-- Информация о пользователе (если авторизован) -->
          <div v-if="user" class="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5 border border-white/10">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-white truncate">{{ user.name ?? 'Пользователь' }}</p>
              <p v-if="user.email" class="text-xs text-gray-300 truncate">{{ user.email }}</p>
            </div>
          </div>

          <!-- Навигация -->
          <NuxtLink
            v-for="item in navigation"
            :key="item.href"
            :to="item.href"
            class="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition"
            active-class="text-white bg-white/10"
            @click="closeMobileMenu"
          >
            {{ item.name }}
          </NuxtLink>

          <div class="border-t border-white/10 my-3"></div>

          <!-- Авторизован: пункты меню -->
          <template v-if="user">
            <NuxtLink
              to="/dashboard"
              class="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition"
              @click="closeMobileMenu"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition"
              @click="closeMobileMenu"
            >
              Профиль
            </NuxtLink>
            <button
              type="button"
              @click="handleLogout"
              class="w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
            >
              Выйти
            </button>
          </template>

          <!-- Гость -->
          <template v-else>
            <NuxtLink
              to="/auth/login"
              class="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:text-white hover:bg-white/10 transition"
              @click="closeMobileMenu"
            >
              Войти
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="block px-4 py-2.5 rounded-lg text-base font-semibold text-center text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg transition"
              @click="closeMobileMenu"
            >
              Начать
            </NuxtLink>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>