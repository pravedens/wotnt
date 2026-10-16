<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const { refreshIdentity } = useSanctumAuth();

const status = ref<"loading" | "success" | "error">("loading");
const message = ref("Подтверждаем ваш email...");

onMounted(async () => {
  try {
    const { id, hash } = route.params;
    const { expires, signature } = route.query;

    // Fetch идёт на API-маршрут с теми же параметрами
    const apiUrl = `https://api.wotnt.test:8443/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      status.value = "success";
      message.value = "Email успешно подтверждён!";

      try {
        // Обновляем пользователя перед переходом в кабинет.
        await refreshIdentity();
      } catch (error) {
        console.error("Не удалось обновить данные пользователя:", error);

        // Подтверждение уже прошло — не показываем ошибку ссылки.
        message.value =
          "Email подтверждён, но не удалось обновить данные профиля. Обновите страницу личного кабинета.";

        return;
      }

      setTimeout(() => router.push("/dashboard"), 1500);
    } else if (response.status === 403) {
      status.value = "error";
      message.value = "Ссылка недействительна или истекла.";
    } else {
      status.value = "error";
      message.value = "Произошла ошибка при подтверждении.";
    }
  } catch (error) {
    status.value = "error";
    message.value = "Ошибка сети.";
  }
});
</script>

<template>
  <div class="auth-form">
    <h1>Подтверждение Email</h1>
    <div v-if="status === 'loading'">{{ message }}</div>
    <div v-else-if="status === 'success'" class="success-banner">
      {{ message }}
      <NuxtLink to="/dashboard">Перейти в Dashboard</NuxtLink>
    </div>
    <div v-else class="error-banner">
      {{ message }}
      <NuxtLink to="/dashboard">Вернуться в Dashboard</NuxtLink>
      <NuxtLink to="/auth/login">Войти</NuxtLink>
    </div>
  </div>
</template>
