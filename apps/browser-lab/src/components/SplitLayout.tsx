import React, { useState, useRef, useEffect } from 'react';

interface SplitLayoutProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  defaultLeftWidth?: number;
}

export function SplitLayout({ leftPane, rightPane, defaultLeftWidth = 320 }: SplitLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const isDragging = useRef(false);

  const startDragging = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
  };

  const stopDragging = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
  };

  const onDrag = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const newWidth = Math.max(250, Math.min(e.clientX, window.innerWidth - 300));
    setLeftWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDragging);
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDragging);
    };
  }, []);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div 
        className="flex-shrink-0 flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800"
        style={{ width: `${leftWidth}px` }}
      >
        {leftPane}
      </div>
      <div 
        className="w-1.5 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 transition-colors z-10 -ml-0.5"
        onMouseDown={startDragging}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-zinc-950">
        {rightPane}
      </div>
    </div>
  );
}
