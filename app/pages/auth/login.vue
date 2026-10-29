<script setup lang="ts">
import type { AuthUser, LoginResponse } from "~/types/auth";

definePageMeta({
  layout: "auth",
  middleware: "sanctum:guest",
});

// ✅ Убираем login(), оставляем refreshIdentity для загрузки пользователя после 2FA
const { refreshIdentity } = useSanctumAuth<AuthUser>();
const client = useSanctumClient(); // ✅ Прямые запросы к API
const router = useRouter();

const banners = useBanners();
const validation = useAuthValidation();

const form = reactive({
  email: "",
  password: "",
  remember: false,
});

const errors = ref<Record<string, string[]>>({});
const isLoading = ref(false);

// --- Состояние для 2FA ---
const needs2FA = ref(false);
const twoFactorCode = ref("");
const isVerifying2FA = ref(false);

const fieldLabels: Record<string, string> = {
  email: "Email",
  password: "Пароль",
  general: "Ошибка",
  code: "Код 2FA",
};

/** Выводит ошибки в баннеры, игнорируя дубли */
const showErrorsAsBanners = (errs: Record<string, string[]>) => {
  for (const [field, messages] of Object.entries(errs)) {
    if (messages.length > 0) {
      const fieldLabel = fieldLabels[field] ?? field;
      banners.error(messages[0]!, { title: fieldLabel });
    }
  }
};

// --- Шаг 1: Вход (логин + пароль) ---
const handleLogin = async () => {
  errors.value = {};
  isLoading.value = true;

  // 1. Клиентская валидация
  const clientErrors = validation.validateLoginForm(form);
  if (Object.keys(clientErrors).length > 0) {
    errors.value = clientErrors;
    showErrorsAsBanners(clientErrors);
    isLoading.value = false;
    return;
  }

  // 2. Отправка на сервер через client напрямую
  try {
    const response = await client<LoginResponse>("/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: {
        email: form.email,
        password: form.password,
        remember: form.remember,
      },
    });

    // ✅ Если требуется 2FA — показываем форму ввода кода
    if (response?.two_factor) {
      needs2FA.value = true;
      isLoading.value = false;
      return;
    }

    // Если 2FA нет — загружаем пользователя и идём на dashboard
    await refreshIdentity();
    await router.push("/dashboard");
  } catch (error: any) {
    const serverErrors = error.response?._data?.errors;

    // Ловим ошибку авторизации
    if (
      serverErrors &&
      serverErrors.email &&
      serverErrors.email[0]?.includes("учетные данные")
    ) {
      errors.value = { general: ["Неверный email или пароль."] };
      banners.error("Неверный email или пароль.");
      delete serverErrors.email;
    } else if (serverErrors) {
      errors.value = serverErrors;
      showErrorsAsBanners(serverErrors);
    } else {
      const msg =
        error.response?._data?.message ?? "Не удалось войти. Проверьте данные.";
      errors.value = { general: [msg] };
      banners.error(msg);
    }
  } finally {
    isLoading.value = false;
  }
};

// --- Шаг 2: Проверка кода 2FA ---
const handleTwoFactor = async () => {
  if (!twoFactorCode.value.trim()) {
    errors.value = { code: ["Введите код из приложения"] };
    return;
  }

  errors.value = {};
  isVerifying2FA.value = true;

  try {
    await client("/two-factor-challenge", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: { code: twoFactorCode.value },
    });

    // Успех: загружаем пользователя и переходим на dashboard
    await refreshIdentity();
    await router.push("/dashboard");
  } catch (error: any) {
    const serverErrors = error.response?._data?.errors;
    if (serverErrors?.code) {
      errors.value = { code: serverErrors.code };
      showErrorsAsBanners({ code: serverErrors.code });
    } else {
      const msg =
        error.response?._data?.message ?? "Неверный код. Попробуйте снова.";
      errors.value = { code: [msg] };
      banners.error(msg);
    }
  } finally {
    isVerifying2FA.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-8">
      {{ needs2FA ? "Двухфакторная аутентификация" : "Вход" }}
    </h1>

    <!-- ===== ФОРМА 2FA ===== -->
    <form v-if="needs2FA" @submit.prevent="handleTwoFactor" class="space-y-5">
      <div class="mt-4 pt-3 border-t border-blue-500/30">
        <p class="opacity-90">
          Откройте приложение на телефоне,
          найдите в списке "Другие сервисы" наш сайт и введите цифры, которые
          там показаны. Код меняется каждые 30 секунд — если не успели, просто
          подождите новый.
        </p>
        <p class="mt-2 opacity-90">
          <strong>Если потеряли телефон:</strong> на странице ввода кода вместо
          6 цифр введите один из кодов восстановления, которые вы сохранили.
        </p>
      </div>

      <div class="space-y-1">
        <label for="code" class="block text-sm font-medium text-gray-200">
          Код подтверждения
        </label>
        <input
          id="code"
          v-model="twoFactorCode"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          :disabled="isVerifying2FA"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70 text-center tracking-widest text-lg"
          :class="{ 'border-red-500 ring-1 ring-red-500': errors.code }"
          placeholder="123456"
          maxlength="6"
        />
        <span v-if="errors.code" class="text-xs text-red-300 block">
          {{ errors.code[0] }}
        </span>
      </div>

      <button
        type="submit"
        :disabled="isVerifying2FA"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isVerifying2FA ? "Проверка..." : "Подтвердить" }}
      </button>

      <button
        type="button"
        @click="needs2FA = false"
        class="w-full text-sm text-gray-400 hover:text-gray-300 transition"
      >
        Назад ко входу
      </button>
    </form>

    <!-- ===== ОБЫЧНАЯ ФОРМА ВХОДА ===== -->
    <form v-else @submit.prevent="handleLogin" class="space-y-5">
      <!-- Email -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-200"
          >Email</label
        >
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          :class="{ 'border-red-500 ring-1 ring-red-500': errors.email }"
          placeholder="admin@wotgospel.ru"
        />
        <span v-if="errors.email" class="text-xs text-red-300 block">{{
          errors.email[0]
        }}</span>
      </div>

      <!-- Пароль -->
      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-200"
          >Пароль</label
        >
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          :class="{ 'border-red-500 ring-1 ring-red-500': errors.password }"
          placeholder="••••••••••••••••"
        />
        <span v-if="errors.password" class="text-xs text-red-300 block">{{
          errors.password[0]
        }}</span>
      </div>

      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center">
          <input
            id="remember"
            v-model="form.remember"
            type="checkbox"
            :disabled="isLoading"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/20 border-white/30"
          />
          <label for="remember" class="ml-2 block text-gray-200 cursor-pointer"
            >Запомнить меня</label
          >
        </div>

        <NuxtLink
          to="/auth/forgot-password"
          class="text-blue-300 hover:text-blue-200 transition hover:underline"
        >
          Забыли пароль?
        </NuxtLink>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? "Вход..." : "Войти" }}
      </button>
    </form>

    <!-- Ссылка на регистрацию (только на шаге логина) -->
    <div v-if="!needs2FA" class="mt-6 text-center text-sm text-gray-300">
      Нет аккаунта?
      <NuxtLink
        to="/auth/register"
        class="text-white font-medium hover:underline ml-1"
      >
        Зарегистрироваться
      </NuxtLink>
    </div>
  </div>
</template>
