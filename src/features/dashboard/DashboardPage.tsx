import Page from '../../components/ui/Page.tsx';
import ActiveUsersWidget from './components/ActiveUsersWidget.tsx';
import RecentOrdersWidget from './components/RecentOrdersWidget.tsx';
import SalesWidget from './components/SalesWidget.tsx';
import WidgetToggles from './components/WidgetToggles.tsx';
import { formatTime } from './format.ts';
import { useDashboardPolling } from './useDashboardPolling.ts';
import { useWidgetVisibility } from './useWidgetVisibility.ts';

const RETRY_BUTTON_CLASS =
  'rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-strong';

function DashboardPage() {
  const { state, retry } = useDashboardPolling();
  const { visibility, toggle } = useWidgetVisibility();

  return (
    <Page
      title="Live Dashboard"
      description="Refreshes every 5 seconds while this tab is visible."
      width="xl"
    >
      <WidgetToggles visibility={visibility} onToggle={toggle} />

      {state.status === 'loading' ? (
        <p role="status" className="text-center text-muted">
          Loading dashboard…
        </p>
      ) : null}

      {state.status === 'error' ? (
        <div role="alert" className="space-y-3 text-center">
          <p className="text-danger">Could not load the dashboard.</p>
          <button type="button" onClick={retry} className={RETRY_BUTTON_CLASS}>
            Retry
          </button>
        </div>
      ) : null}

      {state.status === 'ready' ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <p className="text-muted">Last updated {formatTime(state.updatedAt)}</p>
            {state.refreshFailed ? (
              <p role="alert" className="flex items-center gap-3 text-danger">
                Refresh failed, showing the last data.
                <button type="button" onClick={retry} className={RETRY_BUTTON_CLASS}>
                  Retry
                </button>
              </p>
            ) : null}
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibility.sales ? <SalesWidget sales={state.data.sales} /> : null}
            {visibility.activeUsers ? <ActiveUsersWidget points={state.data.activeUsers} /> : null}
            {visibility.recentOrders ? (
              <RecentOrdersWidget orders={state.data.recentOrders} />
            ) : null}
          </div>
        </>
      ) : null}
    </Page>
  );
}

export default DashboardPage;
