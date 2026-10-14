const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function formatCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatTime(timestamp: number): string {
  return timeFormatter.format(timestamp);
}
