export interface ChartPoint {
  x: number;
  y: number;
}

export function toChartPoints(
  values: number[],
  width: number,
  height: number,
  padding: number,
): ChartPoint[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  return values.map((value, index) => ({
    x: padding + index * step,
    y: height - padding - ((value - min) / range) * (height - padding * 2),
  }));
}

export function toPolyline(points: ChartPoint[]): string {
  return points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}
