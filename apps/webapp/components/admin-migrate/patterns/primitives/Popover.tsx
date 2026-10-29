"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  /**
   * Render the open surface in a portal on `document.body` with fixed
   * coordinates so ancestors with `overflow` can't clip it.
   */
  portal?: boolean;
};

const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 4;
const PORTAL_Z_INDEX = 1000;

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
  portal = false,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !portalRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (portal && event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reposition = useCallback(() => {
    const trigger = containerRef.current;
    const popup = portalRef.current;
    if (!trigger || !popup) return;
    const t = trigger.getBoundingClientRect();
    const w = popup.offsetWidth;
    const h = popup.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left =
      alignment === "end"
        ? t.right - w
        : alignment === "center"
          ? t.left + t.width / 2 - w / 2
          : t.left;
    left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, vw - w - VIEWPORT_MARGIN),
    );

    const spaceBelow = vh - t.bottom - TRIGGER_GAP - VIEWPORT_MARGIN;
    const spaceAbove = t.top - TRIGGER_GAP - VIEWPORT_MARGIN;
    let below = placement === "below";
    if (below && h > spaceBelow && spaceAbove > spaceBelow) below = false;
    else if (!below && h > spaceAbove && spaceBelow > spaceAbove) below = true;

    let top = below ? t.bottom + TRIGGER_GAP : t.top - TRIGGER_GAP - h;
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - h - VIEWPORT_MARGIN));

    setPortalStyle((prev) =>
      prev && prev.left === left && prev.top === top ? prev : { left, top },
    );
  }, [alignment, placement]);

  useLayoutEffect(() => {
    if (!portal || !open || !mounted) {
      setPortalStyle(null);
      return;
    }
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [portal, open, mounted, reposition]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen(!open)}>{children}</div>
      {open && portal ? (
        mounted
          ? createPortal(
              <div
                ref={portalRef}
                role="presentation"
                aria-label={label}
                style={{
                  position: "fixed",
                  zIndex: PORTAL_Z_INDEX,
                  width,
                  top: 0,
                  left: 0,
                  // Hidden until measured so it never flashes at 0,0.
                  visibility: portalStyle ? "visible" : "hidden",
                  ...portalStyle,
                  ...style,
                }}
              >
                {content}
              </div>,
              document.body,
            )
          : null
      ) : open ? (
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
