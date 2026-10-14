import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

const WIDTHS = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
} as const;

interface PageProps {
  title: string;
  description?: string;
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}

function Page({ title, description, width = 'md', className, children }: PageProps) {
  return (
    <section className={cn('mx-auto w-full space-y-6', WIDTHS[width], className)}>
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="text-base text-muted">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export default Page;
