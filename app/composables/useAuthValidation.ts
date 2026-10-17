export interface ValidationError {
  [field: string]: string[];
}

/**
 * Правила валидации для auth-форм.
 * Клиентская валидация — для мгновенного отклика.
 * Серверная (Laravel/Fortify) — приходит в `errors` и отображается отдельно.
 */
export const useAuthValidation = () => {
  // Имя: только кириллица, латиница, пробел, дефис, нижнее подчёркивание
  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Имя обязательно для заполнения';
    if (name.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
    if (!/^[A-Za-zА-Яа-яЁё\s\-_]+$/.test(name)) {
      return 'Имя может содержать только кириллицу, латиницу, пробел, дефис и нижнее подчёркивание';
    }
    return null;
  };

  // Email: только mail.ru, gmail.com, yandex.ru
  const allowedEmailDomains = ['mail.ru', 'gmail.com', 'yandex.ru'];

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email обязателен для заполнения';

    // Базовая проверка формата
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Введите корректный email';

    // Проверка домена
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || !allowedEmailDomains.includes(domain)) {
      return `Email должен быть на одном из доменов: ${allowedEmailDomains.join(', ')}`;
    }

    return null;
  };

  // Пароль: минимум 8 символов, латиница, хотя бы одна заглавная, хотя бы один спецсимвол
  const validatePassword = (password: string): string | null => {
    if (!password) return 'Пароль обязателен для заполнения';
    if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';
    if (!/[A-Z]/.test(password)) return 'Пароль должен содержать хотя бы одну заглавную букву';
    if (!/[a-z]/.test(password)) return 'Пароль должен содержать хотя бы одну строчную букву';
    if (!/[0-9]/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.п.)';
    }
    // Только латиница (не кириллица)
    if (!/^[\x20-\x7E]+$/.test(password)) {
      return 'Пароль может содержать только латиницу, цифры и специальные символы';
    }
    return null;
  };

  // Подтверждение пароля
  const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
    if (!confirmation) return 'Подтверждение пароля обязательно';
    if (password !== confirmation) return 'Пароли не совпадают';
    return null;
  };

  /**
   * Валидирует всю форму регистрации.
   * Возвращает объект ошибок (пустой, если всё ок).
   */
  const validateRegisterForm = (form: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): ValidationError => {
    const errors: ValidationError = {};

    const nameErr = validateName(form.name);
    if (nameErr) errors.name = [nameErr];

    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = [emailErr];

    const passwordErr = validatePassword(form.password);
    if (passwordErr) errors.password = [passwordErr];

    const confirmErr = validatePasswordConfirmation(form.password, form.password_confirmation);
    if (confirmErr) errors.password_confirmation = [confirmErr];

    return errors;
  };

  /**
   * Валидирует форму логина (только email + пароль).
   */
  const validateLoginForm = (form: { email: string; password: string }): ValidationError => {
    const errors: ValidationError = {};

    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = [emailErr];

    if (!form.password) {
      errors.password = ['Пароль обязателен'];
    }

    return errors;
  };

  return {
    allowedEmailDomains,
    validateName,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateRegisterForm,
    validateLoginForm,
  };
};