import { useCallback, useEffect, useState } from 'react';
import { fetchDashboard } from './api.ts';
import { applyFailure, applyResponse, type DashboardState } from './dashboardState.ts';

export const POLL_INTERVAL_MS = 5000;

export function useDashboardPolling(intervalMs: number = POLL_INTERVAL_MS) {
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const [restartCount, setRestartCount] = useState(0);

  useEffect(() => {
    let latestRequestId = 0;
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function stop() {
      clearTimeout(timer);
      controller?.abort();
      controller = null;
      latestRequestId += 1;
    }

    async function load() {
      stop();
      const requestId = latestRequestId;
      const requestController = new AbortController();
      controller = requestController;
      try {
        const data = await fetchDashboard(requestController.signal);
        if (requestId !== latestRequestId) return;
        setState((previous) => applyResponse(previous, data, Date.now()));
      } catch {
        if (requestId !== latestRequestId) return;
        setState(applyFailure);
      }
      timer = setTimeout(() => void load(), intervalMs);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        stop();
      } else {
        void load();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (document.visibilityState === 'visible') {
      void load();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stop();
    };
  }, [intervalMs, restartCount]);

  const retry = useCallback(() => {
    setState((previous) => (previous.status === 'error' ? { status: 'loading' } : previous));
    setRestartCount((count) => count + 1);
  }, []);

  return { state, retry };
}
