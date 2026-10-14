import { useEffect, useState } from 'react';
import { addToCart, removeFromCart, setQuantity } from './cart.ts';
import { loadCart, saveCart } from './storage.ts';
import type { CartItem, Product } from './types.ts';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  return {
    items,
    add: (product: Product) => setItems((current) => addToCart(current, product)),
    updateQuantity: (productId: number, quantity: number) =>
      setItems((current) => setQuantity(current, productId, quantity)),
    remove: (productId: number) => setItems((current) => removeFromCart(current, productId)),
  };
}
