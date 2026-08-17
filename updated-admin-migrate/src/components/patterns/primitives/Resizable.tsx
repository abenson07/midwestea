"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";

export type UseResizableOptions = {
  defaultSize: number;
  minSizePx: number;
  maxSizePx: number;
};

export type ResizableHandleProps = {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
};

export function useResizable({ defaultSize, minSizePx, maxSizePx }: UseResizableOptions) {
  const [size, setSize] = useState(defaultSize);
  const dragState = useRef<{ startX: number; startSize: number } | null>(null);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      dragState.current = { startX: event.clientX, startSize: size };
      (event.target as Element).setPointerCapture(event.pointerId);
    },
    [size],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragState.current) return;
      const delta = event.clientX - dragState.current.startX;
      const next = Math.min(
        maxSizePx,
        Math.max(minSizePx, dragState.current.startSize + delta),
      );
      setSize(next);
    },
    [minSizePx, maxSizePx],
  );

  const onPointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  return {
    size,
    props: { onPointerDown, onPointerMove, onPointerUp } satisfies ResizableHandleProps,
  };
}

export type ResizeHandleProps = {
  direction?: "horizontal" | "vertical";
  position?: "overlay" | "inline";
  resizable: ResizableHandleProps;
  isAlwaysVisible?: boolean;
  label: string;
};

export function ResizeHandle({ resizable, label }: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      onPointerDown={resizable.onPointerDown}
      onPointerMove={resizable.onPointerMove}
      onPointerUp={resizable.onPointerUp}
      style={{
        position: "absolute",
        top: 0,
        right: -3,
        width: 6,
        height: "100%",
        cursor: "col-resize",
        zIndex: 10,
        touchAction: "none",
      }}
    />
  );
}
