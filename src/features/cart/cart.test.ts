import { addToCart, calculateTotals, clampQuantity, removeFromCart, setQuantity } from './cart.ts';
import { formatCents, toCents } from './money.ts';
import type { Product } from './types.ts';

const mascara: Product = {
  id: 1,
  title: 'Mascara',
  priceCents: 999,
  thumbnail: 'mascara.png',
  stock: 3,
};

const lipstick: Product = {
  id: 2,
  title: 'Lipstick',
  priceCents: 1999,
  thumbnail: 'lipstick.png',
  stock: 5,
};

describe('clampQuantity', () => {
  it('keeps a quantity within zero and the stock', () => {
    expect(clampQuantity(2, 3)).toBe(2);
    expect(clampQuantity(10, 3)).toBe(3);
    expect(clampQuantity(-4, 3)).toBe(0);
  });

  it('drops fractions and rejects non-finite input', () => {
    expect(clampQuantity(2.7, 3)).toBe(2);
    expect(clampQuantity(Number.NaN, 3)).toBe(0);
  });
});

describe('cart operations', () => {
  it('adds a new product with quantity one and increments an existing one', () => {
    const once = addToCart([], mascara);
    expect(once).toEqual([{ product: mascara, quantity: 1 }]);
    expect(addToCart(once, mascara)).toEqual([{ product: mascara, quantity: 2 }]);
  });

  it('never adds beyond the stock', () => {
    const full = [{ product: mascara, quantity: 3 }];
    expect(addToCart(full, mascara)).toEqual(full);
    expect(addToCart([], { ...mascara, stock: 0 })).toEqual([]);
  });

  it('clamps a set quantity to the stock and removes the item at zero', () => {
    const items = [{ product: mascara, quantity: 1 }];
    expect(setQuantity(items, 1, 99)).toEqual([{ product: mascara, quantity: 3 }]);
    expect(setQuantity(items, 1, 0)).toEqual([]);
  });

  it('removes an item', () => {
    const items = [
      { product: mascara, quantity: 1 },
      { product: lipstick, quantity: 1 },
    ];
    expect(removeFromCart(items, 1)).toEqual([{ product: lipstick, quantity: 1 }]);
  });
});

describe('calculateTotals', () => {
  it('returns zeros for an empty cart', () => {
    expect(calculateTotals([])).toEqual({ subtotalCents: 0, taxCents: 0, totalCents: 0 });
  });

  it('adds 18% tax rounded to the nearest cent', () => {
    const totals = calculateTotals([
      { product: mascara, quantity: 3 },
      { product: lipstick, quantity: 1 },
    ]);
    expect(totals).toEqual({ subtotalCents: 4996, taxCents: 899, totalCents: 5895 });
  });
});

describe('money', () => {
  it('converts dollars to integer cents without float drift', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(9.99)).toBe(999);
  });

  it('formats cents to two decimal places', () => {
    expect(formatCents(5895)).toBe('$58.95');
    expect(formatCents(100)).toBe('$1.00');
  });
});
