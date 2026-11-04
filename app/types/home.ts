// app/types/home.ts

export interface HomeUser {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Holiday {
  title: string;
  date: string;
  description: string;
  image_url: string | null;
}

export interface HomepageResponse {
  holiday: Holiday | null;
  birthdays: HomeUser[];
  deceased: HomeUser[];
}