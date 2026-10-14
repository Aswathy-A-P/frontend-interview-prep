import { parseProducts } from './api.ts';
import { parseCart } from './storage.ts';

const product = { id: 1, title: 'Mascara', priceCents: 999, thumbnail: 'm.png', stock: 3 };

describe('parseCart', () => {
  it('returns an empty cart for missing or malformed data', () => {
    expect(parseCart(null)).toEqual([]);
    expect(parseCart('not json')).toEqual([]);
    expect(parseCart('{"items":[]}')).toEqual([]);
  });

  it('keeps valid items and drops invalid ones', () => {
    const raw = JSON.stringify([
      { product, quantity: 2 },
      { product, quantity: 9 },
      { product: { id: 'x' }, quantity: 1 },
    ]);
    expect(parseCart(raw)).toEqual([{ product, quantity: 2 }]);
  });
});

describe('parseProducts', () => {
  it('maps valid products to integer cents', () => {
    const data = {
      products: [
        { id: 1, title: 'Mascara', price: 9.99, thumbnail: 'm.png', stock: 3 },
        { id: 2, title: 'Broken' },
      ],
    };
    expect(parseProducts(data)).toEqual([product]);
  });

  it('throws on an unexpected shape', () => {
    expect(() => parseProducts({ items: [] })).toThrow('Unexpected product response');
  });
});
