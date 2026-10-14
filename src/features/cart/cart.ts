import type { CartItem, CartTotals, Product } from './types.ts';

export const TAX_RATE_PERCENT = 18;

export function clampQuantity(quantity: number, stock: number): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(Math.max(Math.trunc(quantity), 0), Math.max(stock, 0));
}

export function setQuantity(items: CartItem[], productId: number, quantity: number): CartItem[] {
  return items
    .map((item) =>
      item.product.id === productId
        ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
        : item,
    )
    .filter((item) => item.quantity > 0);
}

export function addToCart(items: CartItem[], product: Product): CartItem[] {
  const existing = items.find((item) => item.product.id === product.id);
  if (existing) return setQuantity(items, product.id, existing.quantity + 1);
  if (product.stock < 1) return items;
  return [...items, { product, quantity: 1 }];
}

export function removeFromCart(items: CartItem[], productId: number): CartItem[] {
  return items.filter((item) => item.product.id !== productId);
}

export function calculateTotals(items: CartItem[]): CartTotals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const taxCents = Math.round((subtotalCents * TAX_RATE_PERCENT) / 100);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}
