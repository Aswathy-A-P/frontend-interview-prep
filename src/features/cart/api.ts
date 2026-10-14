import { isRecord } from './guards.ts';
import { toCents } from './money.ts';
import type { Product } from './types.ts';

export const PRODUCTS_URL =
  'https://dummyjson.com/products?limit=30&select=title,price,thumbnail,stock';

interface ApiProduct {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
}

function isApiProduct(value: unknown): value is ApiProduct {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.title === 'string' &&
    typeof value.price === 'number' &&
    typeof value.thumbnail === 'string' &&
    typeof value.stock === 'number'
  );
}

export function parseProducts(data: unknown): Product[] {
  if (!isRecord(data) || !Array.isArray(data.products)) {
    throw new Error('Unexpected product response');
  }
  return data.products.filter(isApiProduct).map((product) => ({
    id: product.id,
    title: product.title,
    priceCents: toCents(product.price),
    thumbnail: product.thumbnail,
    stock: product.stock,
  }));
}

export async function fetchProducts(signal: AbortSignal): Promise<Product[]> {
  const response = await fetch(PRODUCTS_URL, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data: unknown = await response.json();
  return parseProducts(data);
}
