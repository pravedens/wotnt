<script setup lang="ts">
import type { AuthUser } from "~/types/auth";

// Используем основной лейаут (с шапкой и футером),
// а не auth-лейаут (карточку по центру)
definePageMeta({
  layout: "default",
  middleware: "sanctum:auth",
});

const { user, refreshIdentity } = useSanctumAuth<AuthUser>();
const client = useSanctumClient();
const banners = useBanners();

// --- Состояние для формы ---
const isSaving = ref(false);
const isUploading = ref(false);
const avatarFile = ref<File | null>(null);
const consentGiven = ref(false);

const form = reactive({
  last_name: "",
  middle_name: "",
  phone: "",
  city: "",
  church_name: "",
  birth_date: "",
  about: "",
  marital_status: "",
  gender: "",
});

const hadConsent = ref(false); // Запоминаем, было ли согласие в БД

// Заполняем форму при загрузке, если данные уже есть
onMounted(async () => {
  await refreshIdentity();
  if (user.value) {
    form.last_name = user.value.last_name ?? "";
    form.middle_name = user.value.middle_name ?? "";
    form.phone = user.value.phone ?? "";
    form.city = user.value.city ?? "";
    form.church_name = user.value.church_name ?? "";
    form.birth_date = user.value.birth_date ?? "";
    form.about = user.value.about ?? "";
    form.marital_status = user.value.marital_status ?? "";
    form.gender = user.value.gender ?? "";
    consentGiven.value = user.value.consent_pd ?? false;

    // Запоминаем текущее состояние согласия из БД
    hadConsent.value = user.value.consent_pd ?? false;
    consentGiven.value = user.value.consent_pd ?? false;
  }
});

// --- Загрузка аватара ---
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0];
  }
};

const uploadAvatar = async () => {
  if (!avatarFile.value) return;

  isUploading.value = true;
  const formData = new FormData();
  formData.append("avatar", avatarFile.value);

  try {
    await client("/api/user/avatar", {
      method: "POST",
      body: formData,
    });
    await refreshIdentity();
    banners.success("Аватар успешно обновлён!");
    avatarFile.value = null;
  } catch (error: any) {
    banners.error(
      error.response?._data?.message || "Не удалось загрузить аватар.",
    );
  } finally {
    isUploading.value = false;
  }
};

// --- Сохранение текстовых данных ---
const saveProfile = async () => {
  if (!consentGiven.value && !hadConsent.value) {
    banners.error('Необходимо согласие на обработку персональных данных.');
    return;
  }

  isSaving.value = true;
  try {
    await client('/api/user/extended-profile', {
      method: 'PUT',
      body: {
        ...form,
        consent_pd: consentGiven.value,
      },
    });
    
    // Обновляем данные пользователя с бэкенда
    await refreshIdentity();
    
    if (user.value) {
      // ⚠️ СИНХРОНИЗИРУЕМ ЛОКАЛЬНОЕ СОСТОЯНИЕ С БАЗОЙ
      hadConsent.value = user.value.consent_pd ?? false;
      
      // Если согласие было отозвано, очищаем форму
      if (!user.value.consent_pd) {
        // Сбрасываем поля формы
        form.last_name = '';
        form.middle_name = '';
        form.phone = '';
        form.city = '';
        form.church_name = '';
        form.birth_date = '';
        form.about = '';
        form.marital_status = '';
        form.gender = '';
      }
    }

    if (!consentGiven.value) {
      banners.success('Согласие отозвано. Данные профиля и фото удалены.');
    } else {
      banners.success('Профиль обновлён!');
    }
  } catch (error: any) {
    const serverErrors = error.response?._data?.errors;
    if (serverErrors) {
      const firstError = Object.values(serverErrors)[0];
      banners.error(
        Array.isArray(firstError) ? firstError[0] : "Ошибка валидации",
      );
    } else {
      banners.error("Не удалось сохранить профиль.");
    }
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-white mb-8">Мой профиль</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Левая колонка: Аватар и базовая информация -->
      <div class="md:col-span-1 space-y-6">
        <div
          class="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex flex-col items-center"
        >
          <!-- Аватар -->
          <div class="relative group mb-4">
            <img
              v-if="user?.avatar_url"
              :src="user.avatar_url"
              alt="Аватар"
              class="w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-lg"
            />
            <div
              v-else
              class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg"
            >
              {{ (user?.name ?? "Г").charAt(0).toUpperCase() }}
            </div>
          </div>

          <h2 class="text-xl font-semibold text-white text-center">
            {{ user?.name }}
          </h2>
          <p class="text-sm text-gray-400 mb-4">{{ user?.email }}</p>

          <!-- Кнопки загрузки (только если бэкенд разрешил) -->
          <template v-if="user?.can_upload_avatar">
            <label
              class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {{ avatarFile ? "Файл выбран" : "Изменить фото" }}
              <input
                type="file"
                class="hidden"
                accept="image/*"
                @change="onFileChange"
              />
            </label>

            <button
              v-if="avatarFile"
              @click="uploadAvatar"
              :disabled="isUploading"
              class="mt-2 text-sm text-blue-300 hover:text-blue-200 transition"
            >
              {{ isUploading ? "Загрузка..." : "Сохранить фото" }}
            </button>
          </template>
        </div>

        <!-- Смена пароля (заглушка для будущего) -->
        <div
          class="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
        >
          <h3 class="text-lg font-semibold text-white mb-4">Безопасность</h3>
          <p class="text-sm text-gray-400 mb-4">Сменить пароль от аккаунта.</p>
          <button
            class="w-full py-2 px-4 rounded-lg text-sm font-semibold text-gray-200 border border-white/20 hover:text-white hover:bg-white/10 transition"
          >
            Сменить пароль
          </button>
        </div>
      </div>

      <!-- Правая колонка: Форма дополнительных данных -->
      <div class="md:col-span-2 space-y-6">
        <div
          class="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8"
        >
          <h3 class="text-lg font-semibold text-white mb-4">
            Дополнительная информация
          </h3>

          <!-- Блок согласия (152-ФЗ) -->
          <div
            class="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                v-model="consentGiven"
                class="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label
                  for="consent"
                  class="text-sm text-gray-200 cursor-pointer block mb-1"
                >
                  Я даю согласие на обработку персональных данных
                </label>
                <p class="text-xs text-gray-400">
                  Я согласен на обработку следующих данных: Фамилия, Имя,
                  Отчество, Фото, Телефон, Город, Церковь, Дата рождения, О
                  себе, Семейное положение, Пол. Цель: отображение данных на
                  сайте.
                  <NuxtLink to="/privacy" class="text-blue-300 hover:underline"
                    >Политика конфиденциальности</NuxtLink
                  >.
                </p>
              </div>
            </div>
          </div>

          <!-- Поля формы (неактивны, если нет согласия) -->
          <div
            class="space-y-4"
            :class="{ 'opacity-50 pointer-events-none': !consentGiven }"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Фамилия</label
                >
                <input
                  v-model="form.last_name"
                  type="text"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Отчество</label
                >
                <input
                  v-model="form.middle_name"
                  type="text"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Телефон</label
                >
                <input
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Город</label
                >
                <input
                  v-model="form.city"
                  type="text"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Церковь</label
                >
                <input
                  v-model="form.church_name"
                  type="text"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Дата рождения</label
                >
                <input
                  v-model="form.birth_date"
                  type="date"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Пол</label
                >
                <select
                  v-model="form.gender"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                >
                  <option value="">Не указан</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1"
                  >Семейное положение</label
                >
                <select
                  v-model="form.marital_status"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
                >
                  <option value="">Не указано</option>
                  <option value="single">Не женат / Не замужем</option>
                  <option value="married">Женат / Замужем</option>
                  <option value="divorced">Разведён(а)</option>
                  <option value="widowed">Вдовец / Вдова</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1"
                >О себе</label
              >
              <textarea
                v-model="form.about"
                rows="3"
                class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-sm"
              ></textarea>
            </div>
          </div>

          <!-- Кнопка сохранения -->
          <div class="mt-6 flex justify-end">
            <button
              @click="saveProfile"
              :disabled="isSaving || (!consentGiven && !hadConsent)"
              class="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg disabled:opacity-50 transition"
            >
              {{ isSaving ? "Сохранение..." : "Сохранить изменения" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
