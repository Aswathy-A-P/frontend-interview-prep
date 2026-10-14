import { memo } from 'react';
import { toChartPoints, toPolyline } from '../chart.ts';
import type { ActiveUsersPoint } from '../types.ts';
import WidgetCard from './WidgetCard.tsx';

const WIDTH = 300;
const HEIGHT = 120;
const PADDING = 8;

interface ActiveUsersWidgetProps {
  points: ActiveUsersPoint[];
}

function ActiveUsersWidget({ points }: ActiveUsersWidgetProps) {
  const counts = points.map((point) => point.count);
  const chartPoints = toChartPoints(counts, WIDTH, HEIGHT, PADDING);
  const latest = counts.at(-1);

  return (
    <WidgetCard title="Active users">
      <p className="text-3xl font-bold text-ink">{latest ?? '—'}</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Active users over the last ${counts.length} readings: ${counts.join(', ')}`}
        className="h-32 w-full"
      >
        <polyline
          points={toPolyline(chartPoints)}
          className="fill-none stroke-accent"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {chartPoints.map((point, index) => (
          <circle
            key={points[index]?.at ?? index}
            cx={point.x}
            cy={point.y}
            r={3}
            className="fill-accent"
          />
        ))}
      </svg>
    </WidgetCard>
  );
}

export default memo(ActiveUsersWidget);
