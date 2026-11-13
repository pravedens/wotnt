// app/types/sermons.ts
import type { AuthUser } from '~/types/auth'

export interface SermonAuthor {
  id: number
  name: string
  avatar_url: string | null
}

export interface Category {
  id: number
  title: string
  slug: string
  description?: string | null
  thumbnail_url: string | null
  posts_count?: number
}

export interface Group {
  id: number
  title: string
  slug: string
  posts_count?: number
}

export interface Conference {
  id: number
  title: string
  slug: string
  posts_count?: number
}

export interface PostComment {
  id: number
  content: string
  likes_count: number
  is_approved?: boolean
  created_at: string
  is_liked?: boolean
  can_edit?: boolean
  user: SermonAuthor
  replies?: PostComment[]
}

export interface Post {
  id: number
  title: string
  slug: string
  description: string
  content: string
  created_at: string
  views_count: number
  likes_count: number
  
  thumbnail: string | null 
  thumbnail_url: string | null 
  youtube: string | null
  rutube: string | null
  dzen: string | null
  vkVideo: string | null 
  
  audio_file: string | null
  audio_filename: string | null
  audio_size: number | null
  audio_mime: string | null
  audio_url: string | null

  text_file: string | null
  text_filename: string | null
  text_size: number | null
  text_mime: string | null
  text_file_url: string | null
  
  category: Category
  group: Group
  conference: Conference
  author: AuthUser
  
  is_liked?: boolean
  is_favorited?: boolean
  requires_consent?: boolean
  
  comments?: PostComment[]
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
    path: string
    links: Array<{ url: string | null; label: string; active: boolean }>
  }
}