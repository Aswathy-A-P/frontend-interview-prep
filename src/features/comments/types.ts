export interface Comment {
  clientId: string;
  text: string;
  createdAt: number;
}

export type OutboxStatus =
  { kind: 'queued' } | { kind: 'sending' } | { kind: 'failed'; error: string };

export interface OutboxItem {
  clientId: string;
  text: string;
  createdAt: number;
  status: OutboxStatus;
}
