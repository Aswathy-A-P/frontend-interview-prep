import Page from '../../components/ui/Page.tsx';
import CartSummary from './CartSummary.tsx';
import ProductList from './ProductList.tsx';
import { useCart } from './useCart.ts';
import { useProducts } from './useProducts.ts';

function CartPage() {
  const { state, retry } = useProducts();
  const { items, add, updateQuantity, remove } = useCart();

  const quantityInCart = (productId: number) =>
    items.find((item) => item.product.id === productId)?.quantity ?? 0;

  return (
    <Page
      title="Shopping Cart"
      description="Add products, adjust quantities and see the totals with 18% tax."
      width="xl"
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Products">
          {state.status === 'loading' && (
            <p role="status" className="text-center text-muted">
              Loading products...
            </p>
          )}
          {state.status === 'error' && (
            <div role="alert" className="space-y-3 text-center">
              <p className="text-danger">Could not load products: {state.message}</p>
              <button
                type="button"
                onClick={retry}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-surface"
              >
                Retry
              </button>
            </div>
          )}
          {state.status === 'success' && (
            <ProductList products={state.products} quantityInCart={quantityInCart} onAdd={add} />
          )}
        </section>
        <div className="lg:sticky lg:top-24">
          <CartSummary items={items} onQuantityChange={updateQuantity} onRemove={remove} />
        </div>
      </div>
    </Page>
  );
}

export default CartPage;
