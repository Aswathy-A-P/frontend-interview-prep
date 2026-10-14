export interface SalesSummary {
  totalCents: number;
  orderCount: number;
}

export interface ActiveUsersPoint {
  at: number;
  count: number;
}

export interface Order {
  id: string;
  customer: string;
  totalCents: number;
  placedAt: number;
}

export interface DashboardData {
  sales: SalesSummary;
  activeUsers: ActiveUsersPoint[];
  recentOrders: Order[];
}
