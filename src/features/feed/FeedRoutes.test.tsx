import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FeedRoutes from './FeedRoutes.tsx';

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

const observerCallbacks: ObserverCallback[] = [];

class FakeIntersectionObserver {
  private readonly callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    observerCallbacks.push(callback);
  }

  observe() {}

  disconnect() {
    const index = observerCallbacks.indexOf(this.callback);
    if (index !== -1) observerCallbacks.splice(index, 1);
  }
}

function scrollSentinelIntoView(times = 1) {
  const callbacks = [...observerCallbacks];
  act(() => {
    for (let count = 0; count < times; count += 1) {
      callbacks.forEach((callback) => callback([{ isIntersecting: true }]));
    }
  });
}

function makePost(id: number) {
  return { id, title: `Post title ${id}`, body: `Body of post ${id}`, tags: ['tag'] };
}

function pageResponse(ids: number[], skip: number, total: number) {
  return { posts: ids.map(makePost), total, skip, limit: 10 };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

const fetchMock = vi.fn<(input: string) => Promise<Response>>();

function requestedUrls(): string[] {
  return fetchMock.mock.calls.map(([url]) => url);
}

function renderFeed(path = '/feed') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/feed/*" element={<FeedRoutes />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  observerCallbacks.length = 0;
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Infinite feed', () => {
  it('requests each page once and never shows a post twice when the sentinel fires rapidly', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pageResponse([1, 2, 3], 0, 6)))
      .mockResolvedValueOnce(jsonResponse(pageResponse([3, 4, 5, 6], 3, 6)));
    renderFeed();

    scrollSentinelIntoView(3);
    expect(await screen.findByText('Post title 1')).toBeInTheDocument();

    scrollSentinelIntoView(3);
    expect(await screen.findByText('Post title 6')).toBeInTheDocument();

    expect(requestedUrls()).toEqual([
      'https://dummyjson.com/posts?limit=10&skip=0',
      'https://dummyjson.com/posts?limit=10&skip=3',
    ]);
    expect(screen.getAllByText('Post title 3')).toHaveLength(1);
    expect(screen.getByText("You've reached the end.")).toBeInTheDocument();

    scrollSentinelIntoView(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows an error with a retry that loads the page again', async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse(pageResponse([1], 0, 20)));
    renderFeed();

    scrollSentinelIntoView();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not load posts');

    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Post title 1')).toBeInTheDocument();
    expect(requestedUrls()).toEqual([
      'https://dummyjson.com/posts?limit=10&skip=0',
      'https://dummyjson.com/posts?limit=10&skip=0',
    ]);
  });

  it('opens a post and keeps the loaded feed when going back', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async (url) =>
      url.endsWith('/posts/2')
        ? jsonResponse(makePost(2))
        : jsonResponse(pageResponse([1, 2], 0, 2)),
    );
    renderFeed();

    scrollSentinelIntoView();
    await user.click(await screen.findByRole('link', { name: /Post title 2/ }));

    expect(await screen.findByText('Body of post 2')).toBeInTheDocument();
    expect(requestedUrls()).toContain('https://dummyjson.com/posts/2');

    await user.click(screen.getByRole('link', { name: /Back to feed/ }));

    expect(screen.getByText('Post title 1')).toBeInTheDocument();
    expect(screen.getByText('Post title 2')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
