import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderizarMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(html);
}