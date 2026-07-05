import { useCallback, useEffect, useRef, useState } from "react";

interface UseResizableWidthOptions {
  /** localStorage key used to remember the width across sessions. */
  storageKey: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  /**
   * Which side of the drag handle the resized panel sits on.
   * "end" = panel is after the handle (dragging left grows it, e.g. a right-side panel).
   * "start" = panel is before the handle (dragging right grows it, e.g. a left sidebar).
   */
  panelPosition: "start" | "end";
}

function readStoredWidth(storageKey: string, fallback: number): number {
  const raw = window.localStorage.getItem(storageKey);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useResizableWidth({
  storageKey,
  defaultWidth,
  minWidth,
  maxWidth,
  panelPosition
}: UseResizableWidthOptions) {
  const [width, setWidth] = useState(() =>
    clamp(readStoredWidth(storageKey, defaultWidth), minWidth, maxWidth)
  );
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;

      if (!dragState) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;
      const signedDelta = panelPosition === "end" ? -deltaX : deltaX;

      setWidth(clamp(dragState.startWidth + signedDelta, minWidth, maxWidth));
    },
    [maxWidth, minWidth, panelPosition]
  );

  const stopDragging = useCallback(() => {
    dragStateRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
    document.body.style.removeProperty("cursor");

    setWidth((current) => {
      window.localStorage.setItem(storageKey, String(current));
      return current;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePointerMove, storageKey]);

  const startDragging = useCallback(
    (event: { clientX: number }) => {
      dragStateRef.current = { startX: event.clientX, startWidth: width };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopDragging);
      document.body.style.cursor = "col-resize";
    },
    [handlePointerMove, stopDragging, width]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [handlePointerMove, stopDragging]);

  return { width, startDragging };
}
