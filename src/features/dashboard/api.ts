import type { ActiveUsersPoint, DashboardData, Order } from './types.ts';

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 1500;
const POINT_SPACING_MS = 5000;
const SERIES_LENGTH = 12;
const RECENT_ORDER_LIMIT = 5;
const NEW_ORDER_CHANCE = 0.6;
const CUSTOMERS = ['Ada', 'Grace', 'Linus', 'Margaret', 'Alan', 'Barbara', 'Ken', 'Radia'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickCustomer(): string {
  return CUSTOMERS[randomInt(0, CUSTOMERS.length - 1)] ?? 'Guest';
}

let nextOrderNumber = 1001;
let totalSalesCents = 0;
let orderCount = 0;
let recentOrders: Order[] = [];
let activeUsers: ActiveUsersPoint[] = Array.from({ length: SERIES_LENGTH }, (_, index) => ({
  at: Date.now() - (SERIES_LENGTH - index) * POINT_SPACING_MS,
  count: randomInt(80, 160),
}));

function placeOrder(now: number): void {
  const order: Order = {
    id: `#${nextOrderNumber}`,
    customer: pickCustomer(),
    totalCents: randomInt(1500, 25000),
    placedAt: now,
  };
  nextOrderNumber += 1;
  orderCount += 1;
  totalSalesCents += order.totalCents;
  recentOrders = [order, ...recentOrders].slice(0, RECENT_ORDER_LIMIT);
}

function recordActiveUsers(now: number): void {
  const last = activeUsers.at(-1)?.count ?? 120;
  const count = Math.max(0, last + randomInt(-15, 15));
  activeUsers = [...activeUsers, { at: now, count }].slice(-SERIES_LENGTH);
}

function advanceServer(): DashboardData {
  const now = Date.now();
  recordActiveUsers(now);
  if (Math.random() < NEW_ORDER_CHANCE) {
    placeOrder(now);
  }
  return {
    sales: { totalCents: totalSalesCents, orderCount },
    activeUsers: activeUsers.map((point) => ({ ...point })),
    recentOrders: recentOrders.map((order) => ({ ...order })),
  };
}

for (let index = 0; index < 3; index += 1) {
  placeOrder(Date.now());
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export async function fetchDashboard(signal: AbortSignal): Promise<DashboardData> {
  await wait(randomInt(MIN_DELAY_MS, MAX_DELAY_MS), signal);
  return advanceServer();
}
