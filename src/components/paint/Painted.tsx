"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useTheme } from "@/lib/useTheme";
import { PAL, grain, type Pal } from "./lib";
import s from "./Painted.module.css";

export type Paint = (c: CanvasRenderingContext2D, w: number, h: number, o: { pal: Pal; t: number; p: number }) => void;

// A canvas that paints a scene to fill its box. It repaints on resize, on a theme change, in the same
// frame its scroll progress moves (so it never trails the scroll), and, if the scene is alive, at
// about 30fps while it is on screen: the drift of clouds and water needs no more, and scrolling keeps
// the rest of the frame.
export function Painted({
  paint,
  progress,
  live = false,
  label,
  className,
  onSize,
  children,
}: {
  paint: Paint;
  progress?: MotionValue<number>;
  live?: boolean;
  label: string;
  className?: string;
  onSize?: (w: number, h: number) => void;
  children?: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const paintRef = useRef(paint);
  const sizeRef = useRef(onSize);
  const [theme] = useTheme();

  useEffect(() => {
    paintRef.current = paint;
    sizeRef.current = onSize;
  });

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    if (grainRef.current) grainRef.current.style.backgroundImage = `url(${grain()})`;
    const pal = PAL[theme];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = false;
    let last = -1e9;

    const draw = (now: number) => {
      if (!w || !h) return;
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintRef.current(ctx, w, h, { pal, t: still ? 0 : now / 1000, p: progress?.get() ?? 0 });
    };
    const moved = () => {
      if (visible) draw(performance.now());
    };
    const loop = (now: number) => {
      raf = visible ? requestAnimationFrame(loop) : 0;
      if (now - last > 30) draw(now);
    };
    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      // painted, grained scenes hold up at 1.5x, and it saves nearly half the pixels of 2x
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      sizeRef.current?.(w, h);
      draw(performance.now());
    };

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) draw(performance.now());
      if (visible && live && !still && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(cv);
    const off = progress?.on("change", moved);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      off?.();
    };
  }, [theme, live, progress]);

  return (
    <div className={`${s.painted} ${className ?? ""}`} role="img" aria-label={label}>
      <canvas ref={canvasRef} className={s.canvas} />
      <div ref={grainRef} className={s.grain} />
      {children}
    </div>
  );
}
