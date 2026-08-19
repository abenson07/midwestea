"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type LayerPlacement = "below" | "above";
export type LayerAlignment = "start" | "end" | "center";

export type PopoverProps = {
  trigger?: ReactNode;
  children?: ReactNode;
  content: ReactNode;
  label?: string;
  placement?: LayerPlacement;
  alignment?: LayerAlignment;
  width?: number | string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hasCloseButton?: boolean;
  style?: CSSProperties;
};

const alignmentStyle: Record<LayerAlignment, CSSProperties> = {
  start: { left: 0 },
  end: { right: 0 },
  center: { left: "50%", transform: "translateX(-50%)" },
};

/** Trigger-anchored popover surface — click-outside closes when uncontrolled. */
export function Popover({
  children,
  content,
  label,
  placement = "below",
  alignment = "start",
  width,
  isOpen,
  onOpenChange,
  style,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen(!open)}>{children}</div>
      {open ? (
        <div
          role="presentation"
          aria-label={label}
          style={{
            position: "absolute",
            zIndex: 50,
            width,
            [placement === "below" ? "top" : "bottom"]: "calc(100% + 4px)",
            ...alignmentStyle[alignment],
            ...style,
          }}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}
