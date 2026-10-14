import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchDashboard } from './api.ts';
import DashboardPage from './DashboardPage.tsx';
import { STORAGE_KEY } from './widgetVisibility.ts';
import type { DashboardData } from './types.ts';

vi.mock('./api.ts', () => ({ fetchDashboard: vi.fn() }));

const fetchDashboardMock = vi.mocked(fetchDashboard);

function makeData(totalCents: number): DashboardData {
  return {
    sales: { totalCents, orderCount: 1 },
    activeUsers: [
      { at: 1, count: 100 },
      { at: 2, count: 120 },
    ],
    recentOrders: [{ id: '#1001', customer: 'Ada', totalCents: 1234, placedAt: 1 }],
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

let visibility: DocumentVisibilityState = 'visible';

function setVisibility(next: DocumentVisibilityState) {
  visibility = next;
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

async function advance(ms: number) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

beforeEach(() => {
  visibility = 'visible';
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
  fetchDashboardMock.mockReset();
  fetchDashboardMock.mockResolvedValue(makeData(10000));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('DashboardPage polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('polls every 5 seconds, pauses while hidden and resumes when visible', async () => {
    render(<DashboardPage />);
    await advance(0);
    expect(fetchDashboardMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('$100.00')).toBeInTheDocument();

    await advance(5000);
    expect(fetchDashboardMock).toHaveBeenCalledTimes(2);

    setVisibility('hidden');
    await advance(30000);
    expect(fetchDashboardMock).toHaveBeenCalledTimes(2);

    setVisibility('visible');
    await advance(0);
    expect(fetchDashboardMock).toHaveBeenCalledTimes(3);

    await advance(5000);
    expect(fetchDashboardMock).toHaveBeenCalledTimes(4);
  });

  it('does not start the next request until the previous one settles', async () => {
    const slow = deferred<DashboardData>();
    fetchDashboardMock.mockReturnValueOnce(slow.promise);
    render(<DashboardPage />);

    await advance(20000);
    expect(fetchDashboardMock).toHaveBeenCalledTimes(1);

    slow.resolve(makeData(10000));
    await advance(5000);
    expect(fetchDashboardMock).toHaveBeenCalledTimes(2);
  });

  it('never lets a late older response overwrite newer data', async () => {
    const older = deferred<DashboardData>();
    const newer = deferred<DashboardData>();
    fetchDashboardMock.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    render(<DashboardPage />);

    setVisibility('hidden');
    setVisibility('visible');
    newer.resolve(makeData(20000));
    await advance(0);
    expect(screen.getByText('$200.00')).toBeInTheDocument();

    older.resolve(makeData(10000));
    await advance(0);
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.queryByText('$100.00')).not.toBeInTheDocument();
  });
});

describe('DashboardPage widgets', () => {
  it('shows an error with a retry when the first load fails', async () => {
    const user = userEvent.setup();
    fetchDashboardMock.mockRejectedValueOnce(new Error('offline'));
    render(<DashboardPage />);
    expect(await screen.findByText('Could not load the dashboard.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('$100.00')).toBeInTheDocument();
  });

  it('remembers hidden widgets after the page is reloaded', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DashboardPage />);
    expect(await screen.findByRole('region', { name: 'Recent orders' })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Recent orders' }));
    expect(screen.queryByRole('region', { name: 'Recent orders' })).not.toBeInTheDocument();

    unmount();
    render(<DashboardPage />);
    expect(await screen.findByRole('region', { name: 'Sales' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Recent orders' })).not.toBeChecked();
    expect(screen.queryByRole('region', { name: 'Recent orders' })).not.toBeInTheDocument();
  });

  it('falls back to showing every widget when stored settings are malformed', async () => {
    localStorage.setItem(STORAGE_KEY, '{"sales":"yes"');
    render(<DashboardPage />);
    expect(await screen.findByRole('region', { name: 'Active users' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Sales' })).toBeChecked();
  });
});
