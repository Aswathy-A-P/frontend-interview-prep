import { TAX_RATE_PERCENT, calculateTotals } from './cart.ts';
import { formatCents } from './money.ts';
import type { CartItem } from './types.ts';

interface CartSummaryProps {
  items: CartItem[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

const stepButton =
  'size-8 rounded-md border border-border bg-white font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40';

function CartSummary({ items, onQuantityChange, onRemove }: CartSummaryProps) {
  if (items.length === 0) {
    return (
      <aside aria-label="Cart" className="rounded-xl border border-border bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-ink">Your cart</h2>
        <p className="mt-2 text-muted">Your cart is empty.</p>
      </aside>
    );
  }

  const { subtotalCents, taxCents, totalCents } = calculateTotals(items);

  return (
    <aside aria-label="Cart" className="space-y-4 rounded-xl border border-border bg-white p-6">
      <h2 className="text-lg font-semibold text-ink">Your cart</h2>
      <ul className="divide-y divide-border">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="space-y-2 py-3">
            <div className="flex justify-between gap-2">
              <span className="font-medium text-ink">{product.title}</span>
              <span className="text-ink">{formatCents(product.priceCents * quantity)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={stepButton}
                onClick={() => onQuantityChange(product.id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label={`Decrease quantity of ${product.title}`}
              >
                -
              </button>
              <output aria-label={`Quantity of ${product.title}`} className="w-8 text-center">
                {quantity}
              </output>
              <button
                type="button"
                className={stepButton}
                onClick={() => onQuantityChange(product.id, quantity + 1)}
                disabled={quantity >= product.stock}
                aria-label={`Increase quantity of ${product.title}`}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => onRemove(product.id)}
                aria-label={`Remove ${product.title}`}
                className="ml-auto text-sm font-medium text-danger hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <dl className="space-y-1 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatCents(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Tax ({TAX_RATE_PERCENT}%)</dt>
          <dd>{formatCents(taxCents)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatCents(totalCents)}</dd>
        </div>
      </dl>
    </aside>
  );
}

export default CartSummary;
