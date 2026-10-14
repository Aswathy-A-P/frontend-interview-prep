export const WIDGETS = [
  { id: 'sales', label: 'Sales' },
  { id: 'activeUsers', label: 'Active users' },
  { id: 'recentOrders', label: 'Recent orders' },
] as const;

export type WidgetId = (typeof WIDGETS)[number]['id'];

export type WidgetVisibility = Record<WidgetId, boolean>;

export const STORAGE_KEY = 'dashboard:widget-visibility';

export const DEFAULT_VISIBILITY: WidgetVisibility = {
  sales: true,
  activeUsers: true,
  recentOrders: true,
};

function isWidgetVisibility(value: unknown): value is WidgetVisibility {
  if (typeof value !== 'object' || value === null) return false;
  return WIDGETS.every(({ id }) => id in value && typeof Reflect.get(value, id) === 'boolean');
}

export function loadWidgetVisibility(): WidgetVisibility {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_VISIBILITY;
    const parsed: unknown = JSON.parse(raw);
    return isWidgetVisibility(parsed) ? parsed : DEFAULT_VISIBILITY;
  } catch {
    return DEFAULT_VISIBILITY;
  }
}

export function saveWidgetVisibility(visibility: WidgetVisibility): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  } catch {
    return;
  }
}
