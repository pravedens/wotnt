<script setup lang="ts">
import type { AuthUser } from '~/types/auth';

definePageMeta({
  layout: 'auth',
  middleware: 'sanctum:guest',
});

const { refreshIdentity } = useSanctumAuth<AuthUser>();
const client = useSanctumClient();
const router = useRouter();

const banners = useBanners();
const validation = useAuthValidation();

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

const errors = ref<Record<string, string[]>>({});
const isLoading = ref(false);

/** Выводит ошибки полей в баннеры (по одному баннеру на поле) */
const showErrorsAsBanners = (errs: Record<string, string[]>) => {
  for (const [field, messages] of Object.entries(errs)) {
    if (messages.length > 0) {
      const fieldLabel = fieldLabels[field] ?? field;
      banners.error(messages[0]!, { title: fieldLabel });
    }
  }
};

const fieldLabels: Record<string, string> = {
  name: 'Имя',
  email: 'Email',
  password: 'Пароль',
  password_confirmation: 'Подтверждение пароля',
  general: 'Ошибка',
};

const handleRegister = async () => {
  errors.value = {};
  isLoading.value = true;

  // 1. Клиентская валидация
  const clientErrors = validation.validateRegisterForm(form);
  if (Object.keys(clientErrors).length > 0) {
    errors.value = clientErrors;
    showErrorsAsBanners(clientErrors);
    isLoading.value = false;
    return;
  }

  // 2. Отправка на сервер
  try {
    await client('/register', {
      method: 'POST',
      body: form,
    });
    await refreshIdentity();
    banners.success('Аккаунт создан! Проверьте почту для подтверждения email.');
    await router.push('/dashboard');
  } catch (error: any) {
    const serverErrors = error.response?._data?.errors;
    if (serverErrors) {
      errors.value = serverErrors;
      showErrorsAsBanners(serverErrors);
    } else {
      const msg = error.response?._data?.message ?? 'Не удалось зарегистрироваться.';
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
    <h1 class="text-3xl font-bold text-center mb-8">Регистрация</h1>

    <form @submit.prevent="handleRegister" class="space-y-4">

      <!-- Имя -->
      <div class="space-y-1">
        <label for="name" class="block text-sm font-medium text-gray-200">Имя</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          :class="{ 'border-red-500 ring-1 ring-red-500': errors.name }"
          placeholder="Иван Иванов"
        />
        <span v-if="errors.name" class="text-xs text-red-300 block">{{ errors.name[0] }}</span>
      </div>

      <!-- Email -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-200">Email</label>
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
        <span v-if="errors.email" class="text-xs text-red-300 block">{{ errors.email[0] }}</span>
      </div>

      <!-- Пароль -->
      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-200">Пароль</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          :class="{ 'border-red-500 ring-1 ring-red-500': errors.password }"
          placeholder="••••••••••••••••"
        />
        <span v-if="errors.password" class="text-xs text-red-300 block">{{ errors.password[0] }}</span>
      </div>

      <!-- Подтверждение пароля -->
      <div class="space-y-1">
        <label for="password_confirmation" class="block text-sm font-medium text-gray-200">Подтверждение пароля</label>
        <input
          id="password_confirmation"
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          :class="{ 'border-red-500 ring-1 ring-red-500': errors.password_confirmation }"
          placeholder="••••••••••••••••"
        />
        <span v-if="errors.password_confirmation" class="text-xs text-red-300 block">
          {{ errors.password_confirmation[0] }}
        </span>
      </div>

      <!-- Кнопка -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </form>

    <div class="mt-6 text-center text-sm text-gray-300">
      Уже есть аккаунт?
      <NuxtLink to="/auth/login" class="text-white font-medium hover:underline ml-1">
        Войти
      </NuxtLink>
    </div>
  </div>
</template>