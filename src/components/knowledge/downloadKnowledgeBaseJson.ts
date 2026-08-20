import type { KnowledgeBase } from '@/types/knowledge-base';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function downloadKnowledgeBaseJson(kb: KnowledgeBase): void {
  const slug = kb.companyName ? slugify(kb.companyName) : kb.id;
  const filename = `${slug || kb.id}-knowledge-base.json`;

  const blob = new Blob([JSON.stringify(kb, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
