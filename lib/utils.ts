import { format } from 'date-fns';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function formatDate(value?: string | Date | null) {
  if (!value) return 'Unpublished';
  return format(new Date(value), 'MMM d, yyyy');
}

export function excerpt(content: string, maxLength = 180) {
  const plain = content.replace(/[#*_>`\n]/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length <= maxLength ? plain : `${plain.slice(0, maxLength)}...`;
}
