import { memo } from 'react';
import { formatCents, formatTime } from '../format.ts';
import type { Order } from '../types.ts';
import WidgetCard from './WidgetCard.tsx';

interface RecentOrdersWidgetProps {
  orders: Order[];
}

function RecentOrdersWidget({ orders }: RecentOrdersWidgetProps) {
  return (
    <WidgetCard title="Recent orders">
      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                <span className="font-medium text-ink">{order.id}</span>{' '}
                <span className="text-muted">{order.customer}</span>
              </span>
              <span className="text-right">
                <span className="block font-medium text-ink">{formatCents(order.totalCents)}</span>
                <span className="block text-xs text-muted">{formatTime(order.placedAt)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export default memo(RecentOrdersWidget);
