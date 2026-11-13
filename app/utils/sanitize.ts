// app/utils/sanitize.ts
import DOMPurify from 'dompurify'

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre',
      'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}