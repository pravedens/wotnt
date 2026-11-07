// app/types/home.ts

export interface HomeUser {
  id: number;
  name: string;
  avatar_url: string | null;
  // Даты нужны для мемориального блока
  death_date?: string | null;
  funeral_date?: string | null;
}

export interface HolidayStyles {
  text_color: string;
  bg_color: string;
  font_family: string;
  title_font_family: string;
}

export interface Holiday {
  title: string;
  date: string;
  end_date: string | null;
  description: string;
  image_url: string | null;
  styles: HolidayStyles;
}

// ✅ Добавляем интерфейс для настроек блоков
export interface HomepageSetting {
  title: string;
  greeting_text: string | null;
  text_color: string;
  bg_color: string;
  font_family: string;
}

export interface HomepageResponse {
  holiday: Holiday | null;
  birthdays: HomeUser[];
  deceased: HomeUser[];
  // ✅ Добавляем поле settings
  settings: {
    birthdays: HomepageSetting;
    deceased: HomepageSetting;
  };
}