// app/composables/useSermons.ts
import type {
  Post,
  PaginatedResponse,
  Category,
  Group,
  Conference,
  PostComment,
} from "~/types/sermons";

export const useSermons = () => {
  const client = useSanctumClient();

  // --- Публичные запросы ---
  const getPosts = (params: Record<string, any>) => {
    return client<PaginatedResponse<Post>>("/api/posts", { query: params });
  };

  const getPost = (slug: string) => {
    return client<Post>(`/api/posts/${slug}`);
  };

  const getLatestPosts = (limit = 4) => {
    return client<{ data: Post[] }>("/api/posts/latest", {
      query: { limit },
    });
  };

  const registerView = (id: number) => {
    return client<{ views_count: number }>(`/api/posts/${id}/view`, {
      method: "POST",
    });
  };

  const toggleLike = (id: number) => {
    return client<{ liked: boolean; count: number }>(`/api/posts/${id}/like`, {
      method: "POST",
    });
  };

  const getFiltersData = async (params: Record<string, any> = {}) => {
    const [categories, groups, conferences] = await Promise.all([
      client<{ data: Category[] }>("/api/categories", { query: params }),
      client<{ data: Group[] }>("/api/groups", { query: params }),
      client<{ data: Conference[] }>("/api/conferences", { query: params }),
    ]);
    return {
      categories: categories.data,
      groups: groups.data,
      conferences: conferences.data,
    };
  };

  // --- Только для авторизованных (Sanctum + verified + consent_pd) ---
  const toggleFavorite = (id: number) => {
    return client<{ favorited: boolean }>(`/api/posts/${id}/favorite`, {
      method: "POST",
    });
  };

  const addComment = (
    postId: number,
    content: string,
    parentId?: number | null,
  ) => {
    return client<{ comment: PostComment }>(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: { content, parent_id: parentId ?? null },
    });
  };

  const toggleCommentLike = (commentId: number) => {
    return client<{ liked: boolean; count: number }>(
      `/api/comments/${commentId}/like`,
      { method: "POST" },
    );
  };

  return {
    getPosts,
    getPost,
    registerView,
    toggleLike,
    getFiltersData,
    toggleFavorite,
    addComment,
    toggleCommentLike,
    getLatestPosts,
  };
};
