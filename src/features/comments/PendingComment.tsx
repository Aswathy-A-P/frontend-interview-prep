import { cn } from '../../lib/cn.ts';
import type { OutboxItem, OutboxStatus } from './types.ts';

const STATUS_LABELS: Record<OutboxStatus['kind'], string> = {
  queued: 'Queued',
  sending: 'Sending',
  failed: 'Failed',
};

interface PendingCommentProps {
  item: OutboxItem;
  onRetry: (clientId: string) => void;
}

function PendingComment({ item, onRetry }: PendingCommentProps) {
  const { status } = item;
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-lg border border-dashed border-border bg-white p-3',
        status.kind === 'failed' && 'border-danger',
      )}
    >
      <p className="flex-1 text-muted">{item.text}</p>
      <span
        className={cn(
          'rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted',
          status.kind === 'failed' && 'bg-danger/10 text-danger',
        )}
        title={status.kind === 'failed' ? status.error : undefined}
      >
        {STATUS_LABELS[status.kind]}
      </span>
      {status.kind === 'failed' ? (
        <button
          type="button"
          onClick={() => onRetry(item.clientId)}
          className="rounded-lg border border-border px-3 py-1 text-sm font-medium hover:bg-surface"
        >
          Retry
        </button>
      ) : null}
    </li>
  );
}

export default PendingComment;
