import { isRecord } from './guards.ts';
import type { CartItem, Product } from './types.ts';

export const CART_STORAGE_KEY = 'q1-cart';

function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.title === 'string' &&
    Number.isInteger(value.priceCents) &&
    typeof value.thumbnail === 'string' &&
    typeof value.stock === 'number'
  );
}

function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    isProduct(value.product) &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    value.quantity <= value.product.stock
  );
}

export function parseCart(raw: string | null): CartItem[] {
  if (raw === null) return [];
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function loadCart(): CartItem[] {
  try {
    return parseCart(localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    return;
  }
}
