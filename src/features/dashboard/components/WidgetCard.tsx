import { useId, type ReactNode } from 'react';

interface WidgetCardProps {
  title: string;
  children: ReactNode;
}

function WidgetCard({ title, children }: WidgetCardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="space-y-3 rounded-xl border border-border bg-white p-5 shadow-sm"
    >
      <h2 id={headingId} className="text-sm font-semibold tracking-wide text-muted uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default WidgetCard;
