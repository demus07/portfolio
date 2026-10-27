"use client";

import { useCallback, useState, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { Painted, type Paint } from "./Painted";
import s from "./Painted.module.css";

export type Rect = { x: number; y: number; w: number; h: number };
export type Layout<R> = { narrow: boolean } & R;

// A painted scene that knows where things sit in it: the layout is measured from the scene's size,
// and whatever is laid over the painting (a screen's contents, a sign's words) is placed by it.
export function Scene<R>({
  paint,
  layout,
  progress,
  live = true,
  label,
  className,
  children,
}: {
  paint: Paint;
  layout: (w: number, h: number) => Layout<R>;
  progress?: MotionValue<number>;
  live?: boolean;
  label: string;
  className?: string;
  children?: (l: Layout<R>) => ReactNode;
}) {
  const [l, setL] = useState<Layout<R> | null>(null);
  const onSize = useCallback((w: number, h: number) => setL(layout(w, h)), [layout]);
  return (
    <Painted paint={paint} progress={progress} live={live} label={label} className={className} onSize={onSize}>
      {l && children?.(l)}
    </Painted>
  );
}

// Something real (a component, a screenshot) set into a rectangle of the painting, designed at a
// fixed width and scaled to fit, so it reads as part of the picture.
export function Slot({ rect, design, children, className }: { rect: Rect; design: number; children: ReactNode; className?: string }) {
  const k = rect.w / design;
  return (
    <div className={`${s.slot} ${className ?? ""}`} style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
      <div style={{ width: design, height: rect.h / k, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>
    </div>
  );
}
