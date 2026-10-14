import type { Comment, OutboxItem, OutboxStatus } from './types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isComment(value: unknown): value is Comment {
  return (
    isRecord(value) &&
    typeof value.clientId === 'string' &&
    typeof value.text === 'string' &&
    typeof value.createdAt === 'number'
  );
}

function isOutboxStatus(value: unknown): value is OutboxStatus {
  if (!isRecord(value)) {
    return false;
  }
  if (value.kind === 'failed') {
    return typeof value.error === 'string';
  }
  return value.kind === 'queued' || value.kind === 'sending';
}

export function isOutboxItem(value: unknown): value is OutboxItem {
  return isComment(value) && isRecord(value) && isOutboxStatus(value.status);
}

export function readList<T>(key: string, isItem: (value: unknown) => value is T): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isItem) : [];
  } catch {
    return [];
  }
}

export function writeList<T>(key: string, items: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
