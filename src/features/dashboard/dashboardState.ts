import type { DashboardData } from './types.ts';

export type DashboardState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: DashboardData; updatedAt: number; refreshFailed: boolean };

function keepIfEqual<T>(previous: T | undefined, next: T): T {
  if (previous !== undefined && JSON.stringify(previous) === JSON.stringify(next)) {
    return previous;
  }
  return next;
}

export function mergeDashboard(previous: DashboardData | null, next: DashboardData): DashboardData {
  return {
    sales: keepIfEqual(previous?.sales, next.sales),
    activeUsers: keepIfEqual(previous?.activeUsers, next.activeUsers),
    recentOrders: keepIfEqual(previous?.recentOrders, next.recentOrders),
  };
}

export function applyResponse(
  previous: DashboardState,
  next: DashboardData,
  receivedAt: number,
): DashboardState {
  const previousData = previous.status === 'ready' ? previous.data : null;
  return {
    status: 'ready',
    data: mergeDashboard(previousData, next),
    updatedAt: receivedAt,
    refreshFailed: false,
  };
}

export function applyFailure(previous: DashboardState): DashboardState {
  if (previous.status === 'ready') {
    return { ...previous, refreshFailed: true };
  }
  return { status: 'error' };
}
