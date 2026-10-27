// app/middleware/verified.ts
import type { AuthUser } from '~/types/auth';

export default defineNuxtRouteMiddleware(async () => {
  // ✅ Передаём дженерик, чтобы TypeScript знал структуру пользователя
  const { user, refreshIdentity } = useSanctumAuth<AuthUser>();

  if (!user.value) {
    try {
      await refreshIdentity();
    } catch {
      return navigateTo('/auth/login');
    }
  }

  // Теперь TS знает, что у user есть email_verified_at
  if (user.value && !user.value.email_verified_at) {
    return navigateTo('/dashboard');
  }
});