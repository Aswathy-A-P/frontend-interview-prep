import { memo } from 'react';
import { formatCents } from '../format.ts';
import type { SalesSummary } from '../types.ts';
import WidgetCard from './WidgetCard.tsx';

interface SalesWidgetProps {
  sales: SalesSummary;
}

function SalesWidget({ sales }: SalesWidgetProps) {
  return (
    <WidgetCard title="Sales">
      <p className="text-3xl font-bold text-ink">{formatCents(sales.totalCents)}</p>
      <p className="text-sm text-muted">{sales.orderCount} orders today</p>
    </WidgetCard>
  );
}

export default memo(SalesWidget);
