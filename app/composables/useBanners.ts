export type BannerType = 'success' | 'error' | 'warning' | 'info';

export interface Banner {
  id: string;
  type: BannerType;
  title?: string;
  message: string;
  /** Если true — баннер не закроется сам */
  persistent?: boolean;
  /** Действия внутри баннера (кнопки) */
  actions?: Array<{
    label: string;
    /** Обработчик. Если он асинхронный — верните Promise, и баннер заблокирует повторное нажатие */
    handler: () => void | Promise<void>;
    /** Стиль кнопки */
    variant?: 'primary' | 'secondary';
    /** Показывает спиннер на кнопке во время выполнения */
    loading?: boolean;
  }>;
  /** Автоматически скрыть через N мс (по умолчанию 6000) */
  timeout?: number;
}

/**
 * Глобальное хранилище баннеров.
 * Использование:
 *   const banners = useBanners();
 *   banners.success('Сохранено!');
 *   banners.warning('Email не подтверждён', { actions: [...] });
 */
export const useBanners = () => {
  // useState гарантирует единый источник правды между компонентами
  const banners = useState<Banner[]>('banners', () => []);

  /** Генерация ID без внешних зависимостей */
  const genId = () => Math.random().toString(36).slice(2, 10);

  /** Добавить баннер */
  const add = (banner: Omit<Banner, 'id'>): string => {
    const id = genId();
    const finalBanner: Banner = {
      id,
      timeout: banner.persistent ? undefined : (banner.timeout ?? 6000),
      ...banner,
    };

    banners.value = [...banners.value, finalBanner];

    // Автоскрытие
    if (finalBanner.timeout && finalBanner.timeout > 0) {
      setTimeout(() => remove(id), finalBanner.timeout);
    }

    return id;
  };

  /** Удалить баннер по id */
  const remove = (id: string) => {
    banners.value = banners.value.filter((b) => b.id !== id);
  };

  /** Удалить все баннеры (полезно при logout / смене страницы) */
  const clear = () => {
    banners.value = [];
  };

  // Хелперы по типам
  const success = (message: string, opts: Partial<Banner> = {}) =>
    add({ type: 'success', message, ...opts });
  const error = (message: string, opts: Partial<Banner> = {}) =>
    add({ type: 'error', message, ...opts });
  const warning = (message: string, opts: Partial<Banner> = {}) =>
    add({ type: 'warning', message, ...opts });
  const info = (message: string, opts: Partial<Banner> = {}) =>
    add({ type: 'info', message, ...opts });

  /**
   * Показать баннер, если такого же (по ключу) ещё нет.
   * Удобно для "статусных" баннеров типа "Email не подтверждён".
   * При этом можно обновлять уже существующий.
   */
  const upsertByKey = (key: string, banner: Omit<Banner, 'id'>) => {
    const existing = banners.value.find((b) => b.id === `key:${key}`);
    if (existing) {
      // обновляем содержимое
      banners.value = banners.value.map((b) =>
        b.id === existing.id ? { ...b, ...banner, id: b.id } : b,
      );
      return existing.id;
    }
    const id = `key:${key}`;
    const finalBanner: Banner = {
      id,
      timeout: banner.persistent ? undefined : (banner.timeout ?? 0),
      ...banner,
    };
    banners.value = [...banners.value, finalBanner];
    if (finalBanner.timeout && finalBanner.timeout > 0) {
      setTimeout(() => remove(id), finalBanner.timeout);
    }
    return id;
  };

  /** Удалить баннер по ключу */
  const removeByKey = (key: string) => remove(`key:${key}`);

  return {
    banners,
    add,
    remove,
    removeByKey,
    clear,
    success,
    error,
    warning,
    info,
    upsertByKey,
  };
};