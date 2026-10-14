export interface Product {
  id: number;
  title: string;
  priceCents: number;
  thumbnail: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}
