import { useEffect, useRef } from 'react';

interface LoadMoreSentinelProps {
  onVisible: () => void;
}

function LoadMoreSentinel({ onVisible }: LoadMoreSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onVisible();
      },
      { rootMargin: '300px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={ref} aria-hidden="true" className="h-px" />;
}

export default LoadMoreSentinel;
