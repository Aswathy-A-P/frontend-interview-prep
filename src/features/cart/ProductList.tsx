import { formatCents } from './money.ts';
import type { Product } from './types.ts';

interface ProductListProps {
  products: Product[];
  quantityInCart: (productId: number) => number;
  onAdd: (product: Product) => void;
}

function ProductList({ products, quantityInCart, onAdd }: ProductListProps) {
  if (products.length === 0) {
    return <p className="text-center text-muted">No products available.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const atLimit = quantityInCart(product.id) >= product.stock;
        return (
          <li
            key={product.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4"
          >
            <img
              src={product.thumbnail}
              alt={product.title}
              loading="lazy"
              className="aspect-square w-full rounded-lg bg-surface object-contain"
            />
            <h3 className="font-semibold text-ink">{product.title}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{formatCents(product.priceCents)}</span>
              <span className="text-muted">{product.stock} in stock</span>
            </div>
            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={atLimit}
              aria-label={`Add ${product.title} to cart`}
              className="mt-auto rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {atLimit ? 'Max in cart' : 'Add to cart'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ProductList;
