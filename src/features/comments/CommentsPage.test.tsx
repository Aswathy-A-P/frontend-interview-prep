import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCommentsServer } from './commentsApi.ts';
import CommentsPage from './CommentsPage.tsx';
import { createOutboxStore } from './outboxStore.ts';

function setOnline(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'));
  });
}

function renderPage(outcomes: number[] = [], latency = 0) {
  const api = createCommentsServer({
    random: () => outcomes.shift() ?? 1,
    latencyMs: () => latency,
  });
  const postComment = vi.spyOn(api, 'postComment');
  const store = createOutboxStore({ api });
  render(<CommentsPage api={api} store={store} />);
  return { api, postComment };
}

async function post(text: string) {
  await userEvent.type(screen.getByLabelText('Comment'), text);
  await userEvent.click(screen.getByRole('button', { name: 'Post' }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CommentsPage', () => {
  it('queues comments while offline and sends them in order once back online', async () => {
    const { api, postComment } = renderPage();
    await screen.findByText('No comments yet.');

    setOnline(false);
    await post('one');
    await post('two');
    await post('three');
    expect(screen.getAllByText('Queued')).toHaveLength(3);
    expect(postComment).not.toHaveBeenCalled();

    setOnline(true);
    await waitFor(() => expect(screen.queryByText('Queued')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Sending')).not.toBeInTheDocument());

    expect(postComment.mock.calls.map(([comment]) => comment.text)).toEqual([
      'one',
      'two',
      'three',
    ]);
    const stored = await api.listComments();
    expect(stored.map((comment) => comment.text)).toEqual(['one', 'two', 'three']);
  });

  it('shows a failed comment with Retry, and retrying does not duplicate it', async () => {
    const { api, postComment } = renderPage([1, 0, 1]);
    await screen.findByText('No comments yet.');

    await post('hello');
    expect(screen.getByText('hello')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(screen.queryByText('Failed')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Sending')).not.toBeInTheDocument());
    expect(screen.getByText('hello')).toBeInTheDocument();

    const [first, second] = postComment.mock.calls.map(([comment]) => comment.clientId);
    expect(second).toBe(first);
    await expect(api.listComments()).resolves.toHaveLength(1);
  });

  it('shows the comment immediately as sending', async () => {
    renderPage([], 50);
    await screen.findByText('No comments yet.');
    await post('fast');
    expect(screen.getByText('fast')).toBeInTheDocument();
    expect(screen.getByText('Sending')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Sending')).not.toBeInTheDocument());
    expect(screen.getByText('fast')).toBeInTheDocument();
  });

  it('offers a retry when loading comments fails', async () => {
    renderPage([0, 1]);
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('No comments yet.')).toBeInTheDocument();
  });
});
