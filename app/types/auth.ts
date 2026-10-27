// app/types/auth.ts
export interface RoleItem {
  value: string;
  label: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  roles: RoleItem[];
  created_at?: string;
  updated_at?: string;
  last_name: string | null;
  middle_name: string | null;
  phone: string | null;
  city: string | null;
  church_name: string | null;
  birth_date: string | null; // Обычно приходит как строка в формате YYYY-MM-DD
  about: string | null;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed' | null;
  gender: 'male' | 'female' | null;

  // --- Аватар и согласие ---
  avatar_url: string | null; // Бэкенд отдает готовый URL (через аксессор)
  avatar_path?: string | null; // Сам путь в S3 (может не приходить на фронт, если скрыт)
  
  consent_pd: boolean;
  consent_pd_at?: string | null;
  can_upload_avatar: boolean;
}

export interface LoginResponse {
  two_factor: boolean;
}

export interface ForgotPasswordResponse {
  status: string;
}

export interface RegisterResponse {
  user: AuthUser;
}