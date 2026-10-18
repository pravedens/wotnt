<script setup lang="ts">
import type { AuthUser } from "~/types/auth";

definePageMeta({
  layout: "auth",
  middleware: "sanctum:guest",
});

const { login } = useSanctumAuth<AuthUser>();
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

const fieldLabels: Record<string, string> = {
  email: "Email",
  password: "Пароль",
  general: "Ошибка",
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

  // 2. Отправка на сервер
  try {
    await login(form);
    await router.push("/dashboard");
  } catch (error: any) {
    const serverErrors = error.response?._data?.errors;

    // ⚠️ ЛОВИМ ОШИБКУ АВТОРИЗАЦИИ
    // Если Fortify вернул ошибку в поле email (неверные данные)
    if (
      serverErrors &&
      serverErrors.email &&
      serverErrors.email[0]?.includes("учетные данные")
    ) {
      // Переназначаем её в общую ошибку
      errors.value = { general: ["Неверный email или пароль."] };
      banners.error("Неверный email или пароль.");

      // Очищаем поле email от красной рамки (но оставляем ошибку общей)
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
</script>
<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-8">Вход</h1>

    <form @submit.prevent="handleLogin" class="space-y-5">
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

    <div class="mt-6 text-center text-sm text-gray-300">
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
