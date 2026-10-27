<script setup lang="ts">
import type { AuthUser } from "~/types/auth";
import QrcodeVue from "qrcode.vue";

definePageMeta({
  layout: "default",
  middleware: ["sanctum:auth", "verified"],
});

// --- Состояние таймера ---
const timeLeft = ref(0);
let countdownInterval: ReturnType<typeof setInterval> | null = null;
const TOTAL_SECONDS = 15 * 60; // 15 минут

const { user, refreshIdentity } = useSanctumAuth<AuthUser>();
const client = useSanctumClient();
const banners = useBanners();

// --- Состояние для формы профиля ---
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

const hadConsent = ref(false);

// --- Состояние для 2FA ---
const is2FAEnabled = ref(false);
const is2FAConfirmed = ref(false);
const qrCodeSvg = ref("");
const qrCodeUrl = ref("");
const recoveryCodes = ref<string[]>([]);
const confirmCode = ref("");
const isEnabling2FA = ref(false);
const isConfirming2FA = ref(false);
const isDisabling2FA = ref(false);
const isLoading2FA = ref(false);

// Синхронизация 2FA с данными пользователя
watchEffect(() => {
  const u = user.value as any;
  is2FAEnabled.value = !!u?.two_factor_enabled;
  is2FAConfirmed.value = !!u?.two_factor_confirmed;
});

// Заполняем форму при загрузке
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
    hadConsent.value = user.value.consent_pd ?? false;
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
    banners.error("Необходимо согласие на обработку персональных данных.");
    return;
  }

  isSaving.value = true;
  try {
    await client("/api/user/extended-profile", {
      method: "PUT",
      body: {
        ...form,
        consent_pd: consentGiven.value,
      },
    });

    await refreshIdentity();

    if (user.value) {
      hadConsent.value = user.value.consent_pd ?? false;

      if (!user.value.consent_pd) {
        form.last_name = "";
        form.middle_name = "";
        form.phone = "";
        form.city = "";
        form.church_name = "";
        form.birth_date = "";
        form.about = "";
        form.marital_status = "";
        form.gender = "";
      }
    }

    if (!consentGiven.value) {
      banners.success("Согласие отозвано. Данные профиля и фото удалены.");
    } else {
      banners.success("Профиль обновлён!");
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

// --- Логика 2FA ---

// 1. Включить 2FA (создать секрет и получить QR-код)
const enable2FA = async () => {
  isLoading2FA.value = true;
  try {
    await client("/user/two-factor-authentication", {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    const qr = (await client("/user/two-factor-qr-code", {
      headers: { Accept: "application/json" },
    })) as { svg: string; url?: string };

    qrCodeUrl.value = qr.url || "";
    is2FAEnabled.value = true;
    await refreshIdentity();

    // ✅ Запускаем таймер на 15 минут
    startTwoFactorTimer();

    banners.success("Сканируйте QR-код в приложении и подтвердите код.");
  } catch (err: any) {
    banners.error(err.response?._data?.message ?? "Не удалось включить 2FA.");
  } finally {
    isLoading2FA.value = false;
  }
};

// 2. Подтвердить код из приложения
const confirm2FA = async () => {
  if (!confirmCode.value.trim()) {
    banners.error("Введите код из приложения.");
    return;
  }
  isConfirming2FA.value = true;
  try {
    await client("/user/confirmed-two-factor-authentication", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: { code: confirmCode.value },
    });
    await refreshIdentity();
    is2FAConfirmed.value = true;
    confirmCode.value = "";

    const codes = (await client("/user/two-factor-recovery-codes", {
      headers: { Accept: "application/json" },
    })) as string[];
    recoveryCodes.value = codes;
    clearTwoFactorTimer(); // ✅ Отменяем таймер, так как 2FA включена
    banners.success("2FA успешно включена. Сохраните коды восстановления!");
  } catch (err: any) {
    banners.error(
      err.response?._data?.message ?? "Неверный код. Попробуйте снова.",
    );
  } finally {
    isConfirming2FA.value = false;
  }
};

// 3. Отключить 2FA
const disable2FA = async () => {
  isDisabling2FA.value = true;
  try {
    // ✅ ПРИНУДИТЕЛЬНО обновляем CSRF-токен перед DELETE-запросом
    // Это гарантирует, что заголовок X-XSRF-TOKEN будет соответствовать актуальной cookie
    await client("/sanctum/csrf-cookie", { method: "GET" });

    await client("/user/two-factor-authentication", {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    await refreshIdentity();
    is2FAEnabled.value = false;
    is2FAConfirmed.value = false;
    qrCodeSvg.value = "";
    qrCodeUrl.value = "";
    recoveryCodes.value = [];
    clearTwoFactorTimer();
    banners.success("2FA отключена.");
  } catch (err: any) {
    banners.error(err.response?._data?.message ?? "Не удалось отключить 2FA.");
  } finally {
    isDisabling2FA.value = false;
  }
};

// Форматированный вывод (например, "14:59")
const formattedTimeLeft = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
});

// Запуск
const startTwoFactorTimer = () => {
  clearTwoFactorTimer();
  timeLeft.value = TOTAL_SECONDS;

  countdownInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearTwoFactorTimer();
      banners.warning("Время на настройку 2FA истекло. Попробуйте снова.");
      disable2FA();
    }
  }, 1000);
};

// Очистка
const clearTwoFactorTimer = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  timeLeft.value = 0;
};

// 4. Перегенерировать коды восстановления
const regenerateRecoveryCodes = async () => {
  try {
    const codes = (await client("/user/two-factor-recovery-codes", {
      method: "POST",
      headers: { Accept: "application/json" },
    })) as string[];
    recoveryCodes.value = codes;
    banners.success("Коды восстановления обновлены.");
  } catch (err: any) {
    banners.error(err.response?._data?.message ?? "Не удалось обновить коды.");
  }
};

onBeforeUnmount(async () => {
  clearTwoFactorTimer();
  // Если 2FA включена, но не подтверждена (пользователь ушел со страницы)
  if (is2FAEnabled.value && !is2FAConfirmed.value) {
    try {
      // Молча отменяем, чтобы очистить БД
      await client("/user/two-factor-authentication", {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
    } catch (e) {
      // Игнорируем ошибку, так как страница уже закрывается
    }
  }
});
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

          <div
            v-if="user?.roles?.length"
            class="flex flex-wrap justify-center gap-2 mt-3 mb-4"
          >
            <span
              v-for="role in user.roles"
              :key="role.value"
              class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
              :title="role.value"
            >
              {{ role.label }}
            </span>
          </div>

          <!-- Кнопки загрузки -->
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

        <!-- Блок безопасности: смена пароля + 2FA -->
        <div
          class="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 space-y-6"
        >
          <h3 class="text-lg font-semibold text-white">Безопасность</h3>

          <!-- === Смена пароля === -->
          <div>
            <p class="text-sm text-gray-400 mb-3">
              Сменить пароль от аккаунта.
            </p>
            <button
              type="button"
              class="w-full py-2 px-4 rounded-lg text-sm font-semibold text-gray-200 border border-white/20 hover:text-white hover:bg-white/10 transition"
            >
              Сменить пароль
            </button>
          </div>

          <div class="border-t border-white/10"></div>

          <!-- === 2FA === -->
          <div>
            <p class="text-sm font-medium text-white mb-3">
              Двухфакторная аутентификация
            </p>

            <!-- Состояние: 2FA не включена -->
            <template v-if="!is2FAEnabled">
              <div
                class="mt-4 p-5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-100"
              >
                <h3 class="font-bold text-base mb-3 text-white">
                  🔐 Как работает двухфакторная аутентификация (2FA)?
                </h3>

                <p class="mb-3 opacity-90">
                  Это дополнительный уровень защиты. Даже если кто-то узнает ваш
                  пароль, он не сможет войти в аккаунт без кода с вашего
                  телефона.
                </p>

                <ol class="list-decimal list-inside space-y-3 opacity-90">
                  <li>
                    <strong>Установите приложение-аутентификатор.</strong>
                    Подойдет любое из популярных:
                    <span class="font-medium">Яндекс ID</span> (бывший «Яндекс
                    Ключ»), Google Authenticator, Microsoft Authenticator или
                    Authy. Их можно найти в магазине приложений на вашем
                    телефоне (RuStore, Google Play или App Store).
                  </li>
                  <li>
                    <strong>Включите 2FA.</strong>
                    Нажмите кнопку «Включить 2FA» и отсканируйте QR-код через
                    приложение.
                  </li>
                  <li>
                    <strong>Сохраните коды восстановления!</strong>
                    Они появятся после подтверждения. Это ваши «запасные ключи».
                    Если вы потеряете телефон, только с их помощью вы сможете
                    войти в аккаунт.
                  </li>
                </ol>
              </div>
              <button
                type="button"
                @click="enable2FA"
                :disabled="isLoading2FA"
                class="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg disabled:opacity-50 transition"
              >
                {{ isLoading2FA ? "Включение..." : "Включить 2FA" }}
              </button>
            </template>

            <!-- Состояние: секрет создан, но не подтверждён -->
            <template v-else-if="!is2FAConfirmed">
              <p class="text-sm text-gray-300 mb-3">
                Отсканируйте QR-код в приложении (Google Authenticator, Authy и
                т.п.), затем введите 6-значный код.
              </p>

              <p
                v-if="timeLeft > 0"
                class="text-xs text-amber-400 text-center mb-3"
              >
                Осталось времени:
                <span class="font-mono font-bold">{{ formattedTimeLeft }}</span>
              </p>

              <div
                v-if="qrCodeUrl"
                class="flex justify-center mb-3 p-2 bg-white rounded"
              >
                <QrcodeVue :value="qrCodeUrl" :size="180" level="M" />
              </div>

              <div class="space-y-2">
                <input
                  v-model="confirmCode"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="123456"
                  class="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 text-center tracking-widest text-lg"
                />
                <button
                  type="button"
                  @click="confirm2FA"
                  :disabled="isConfirming2FA"
                  class="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg disabled:opacity-50 transition"
                >
                  {{ isConfirming2FA ? "Проверка..." : "Подтвердить код" }}
                </button>
              </div>
            </template>

            <!-- Состояние: 2FA подтверждена -->
            <template v-else>
              <p class="text-sm text-emerald-300 mb-3">
                ✅ Двухфакторная аутентификация включена.
              </p>

              <div v-if="recoveryCodes.length" class="mb-3">
                <p class="text-xs text-gray-400 mb-1">
                  Коды восстановления (сохраните!):
                </p>
                <div
                  class="grid grid-cols-2 gap-1 text-xs font-mono text-gray-200 bg-black/20 p-2 rounded"
                >
                  <span v-for="code in recoveryCodes" :key="code">{{
                    code
                  }}</span>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  @click="regenerateRecoveryCodes"
                  class="w-full py-2 px-4 rounded-lg text-sm font-semibold text-gray-200 border border-white/20 hover:bg-white/10 transition"
                >
                  Перегенерировать коды
                </button>
                <button
                  type="button"
                  @click="disable2FA"
                  :disabled="isDisabling2FA"
                  class="w-full py-2 px-4 rounded-lg text-sm font-semibold text-red-300 border border-red-500/30 hover:bg-red-500/10 transition disabled:opacity-50"
                >
                  {{ isDisabling2FA ? "Отключение..." : "Отключить 2FA" }}
                </button>
              </div>
            </template>
          </div>
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

          <!-- Поля формы -->
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
            <ClientOnly>
              <button
                @click="saveProfile"
                :disabled="isSaving || (!consentGiven && !hadConsent)"
                class="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg disabled:opacity-50 transition"
              >
                {{ isSaving ? "Сохранение..." : "Сохранить изменения" }}
              </button>
              <template #fallback>
                <div class="h-[42px]"></div>
                <!-- Заглушка, чтобы не прыгала верстка -->
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
