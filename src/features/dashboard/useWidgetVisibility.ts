import { useCallback, useEffect, useState } from 'react';
import { loadWidgetVisibility, saveWidgetVisibility, type WidgetId } from './widgetVisibility.ts';

export function useWidgetVisibility() {
  const [visibility, setVisibility] = useState(loadWidgetVisibility);

  useEffect(() => {
    saveWidgetVisibility(visibility);
  }, [visibility]);

  const toggle = useCallback((id: WidgetId) => {
    setVisibility((previous) => ({ ...previous, [id]: !previous[id] }));
  }, []);

  return { visibility, toggle };
}
