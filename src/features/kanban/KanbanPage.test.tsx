import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanPage from './KanbanPage.tsx';

function column(name: string) {
  return screen.getByRole('region', { name });
}

async function addCard(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(screen.getByLabelText('Title'), title);
  await user.click(screen.getByRole('button', { name: 'Add card' }));
}

describe('KanbanPage', () => {
  it('requires a title before adding a card', async () => {
    const user = userEvent.setup();
    render(<KanbanPage />);

    await user.type(screen.getByLabelText('Title'), '   ');
    await user.click(screen.getByRole('button', { name: 'Add card' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required.');
    expect(within(column('To do')).getByText('0 cards')).toBeInTheDocument();
  });

  it('adds, moves with the keyboard controls and survives a remount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<KanbanPage />);

    await addCard(user, 'Write spec');
    await addCard(user, 'Ship it');
    expect(within(column('To do')).getByText('2 cards')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Move Write spec to column' }),
      'In progress',
    );
    expect(within(column('To do')).getByText('1 card')).toBeInTheDocument();
    expect(within(column('In progress')).getByText('1 card')).toBeInTheDocument();
    expect(within(column('In progress')).getByText('Write spec')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Move Ship it to column' }),
      'In progress',
    );
    await user.click(screen.getByRole('button', { name: 'Move Ship it up' }));
    const titles = within(column('In progress'))
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(['Ship it', 'Write spec']);

    unmount();
    render(<KanbanPage />);
    expect(within(column('In progress')).getByText('2 cards')).toBeInTheDocument();
    expect(within(column('To do')).getByText('0 cards')).toBeInTheDocument();
  });

  it('edits and deletes a card', async () => {
    const user = userEvent.setup();
    render(<KanbanPage />);
    await addCard(user, 'Draft');

    await user.click(screen.getByRole('button', { name: 'Edit Draft' }));
    const todo = column('To do');
    const titleInput = within(todo).getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Final');
    await user.click(within(todo).getByRole('button', { name: 'Save' }));
    expect(within(todo).getByText('Final')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Final' }));
    expect(within(todo).getByText('0 cards')).toBeInTheDocument();
  });
});
