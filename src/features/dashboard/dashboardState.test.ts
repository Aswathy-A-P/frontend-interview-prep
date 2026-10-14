import { applyFailure, applyResponse, mergeDashboard } from './dashboardState.ts';
import type { DashboardData } from './types.ts';

function makeData(totalCents: number, userCount = 100): DashboardData {
  return {
    sales: { totalCents, orderCount: 1 },
    activeUsers: [{ at: 1, count: userCount }],
    recentOrders: [{ id: '#1', customer: 'Ada', totalCents, placedAt: 1 }],
  };
}

describe('mergeDashboard', () => {
  it('reuses the previous slice when its content is unchanged', () => {
    const previous = makeData(500, 100);
    const merged = mergeDashboard(previous, makeData(500, 120));

    expect(merged.sales).toBe(previous.sales);
    expect(merged.recentOrders).toBe(previous.recentOrders);
    expect(merged.activeUsers).not.toBe(previous.activeUsers);
    expect(merged.activeUsers[0]?.count).toBe(120);
  });

  it('takes every slice from the response when there is no previous data', () => {
    const next = makeData(500);
    expect(mergeDashboard(null, next)).toEqual(next);
  });
});

describe('applyFailure', () => {
  it('keeps showing the last data and flags the failed refresh', () => {
    const ready = applyResponse({ status: 'loading' }, makeData(500), 10);
    expect(applyFailure(ready)).toEqual({ ...ready, refreshFailed: true });
  });

  it('reports an error when nothing has loaded yet', () => {
    expect(applyFailure({ status: 'loading' })).toEqual({ status: 'error' });
  });
});
