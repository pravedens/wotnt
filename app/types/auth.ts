// app/types/auth.ts
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // добавьте поля, которые возвращает Laravel
}