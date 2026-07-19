import React, { useRef, useState, useEffect } from 'react';

interface AutoSizerProps {
  children: (props: { width: number; height: number }) => React.ReactNode;
}

export function AutoSizer({ children }: AutoSizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {size.width > 0 && size.height > 0 && children(size)}
    </div>
  );
}
