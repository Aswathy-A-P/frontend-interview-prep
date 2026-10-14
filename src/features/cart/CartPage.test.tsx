import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPage from './CartPage.tsx';
import { CART_STORAGE_KEY } from './storage.ts';

const apiResponse = {
  products: [
    { id: 1, title: 'Mascara', price: 9.99, thumbnail: 'mascara.png', stock: 2 },
    { id: 2, title: 'Lipstick', price: 19.99, thumbnail: 'lipstick.png', stock: 5 },
  ],
};

function mockFetchSuccess() {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(() => Promise.resolve(Response.json(apiResponse)));
}

function cartTotals() {
  const cart = screen.getByRole('complementary', { name: 'Cart' });
  const value = (label: string) =>
    within(cart).getByText(label).nextElementSibling?.textContent ?? '';
  return { subtotal: value('Subtotal'), tax: value('Tax (18%)'), total: value('Total') };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CartPage', () => {
  it('shows products, then adds items and updates every total immediately', async () => {
    const user = userEvent.setup();
    mockFetchSuccess();
    render(<CartPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading products...');
    expect(await screen.findByRole('img', { name: 'Mascara' })).toBeInTheDocument();
    expect(screen.getByText('2 in stock')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add Mascara to cart' }));
    expect(cartTotals()).toEqual({ subtotal: '$9.99', tax: '$1.80', total: '$11.79' });

    await user.click(screen.getByRole('button', { name: 'Increase quantity of Mascara' }));
    expect(screen.getByRole('status', { name: 'Quantity of Mascara' })).toHaveTextContent('2');
    expect(cartTotals()).toEqual({ subtotal: '$19.98', tax: '$3.60', total: '$23.58' });
  });

  it('does not let the quantity exceed the stock', async () => {
    const user = userEvent.setup();
    mockFetchSuccess();
    render(<CartPage />);

    await user.click(await screen.findByRole('button', { name: 'Add Mascara to cart' }));
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Mascara' }));

    expect(screen.getByRole('button', { name: 'Increase quantity of Mascara' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add Mascara to cart' })).toBeDisabled();
  });

  it('removes an item and shows the empty state', async () => {
    const user = userEvent.setup();
    mockFetchSuccess();
    render(<CartPage />);

    await user.click(await screen.findByRole('button', { name: 'Add Lipstick to cart' }));
    await user.click(screen.getByRole('button', { name: 'Remove Lipstick' }));

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('restores the cart after a refresh', async () => {
    const user = userEvent.setup();
    mockFetchSuccess();
    const { unmount } = render(<CartPage />);

    await user.click(await screen.findByRole('button', { name: 'Add Lipstick to cart' }));
    unmount();
    expect(localStorage.getItem(CART_STORAGE_KEY)).toContain('Lipstick');

    render(<CartPage />);
    expect(cartTotals()).toEqual({ subtotal: '$19.99', tax: '$3.60', total: '$23.59' });
    expect(await screen.findByRole('img', { name: 'Lipstick' })).toBeInTheDocument();
  });

  it('shows an error with a retry that refetches', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(Response.json(apiResponse));
    render(<CartPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed with status 500');
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('img', { name: 'Lipstick' })).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('aborts the request on unmount', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<CartPage />);

    const signal = fetchSpy.mock.calls[0]?.[1]?.signal;
    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
