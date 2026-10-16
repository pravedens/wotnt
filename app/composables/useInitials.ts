export const useInitials = () => {
  return (name?: string | null): string => {
    const trimmed = name?.trim();
    if (!trimmed) return '?';

    const parts = trimmed.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';

    return ((first + second).toUpperCase()) || '?';
  };
};