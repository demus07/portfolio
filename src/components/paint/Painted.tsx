"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useTheme } from "@/lib/useTheme";
import { PAL, grain, type Pal } from "./lib";
import s from "./Painted.module.css";

export type Paint = (c: CanvasRenderingContext2D, w: number, h: number, o: { pal: Pal; t: number; p: number }) => void;

// A canvas that paints a scene to fill its box. It repaints on resize, on a theme change, when its
// scroll progress moves, and every frame while it is on screen if the scene is alive.
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
    let queued = 0;
    let visible = false;

    const draw = (now: number) => {
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintRef.current(ctx, w, h, { pal, t: still ? 0 : now / 1000, p: progress?.get() ?? 0 });
    };
    const request = () => {
      if (queued || raf) return;
      queued = requestAnimationFrame((now) => {
        queued = 0;
        draw(now);
      });
    };
    const loop = (now: number) => {
      draw(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      if (visible && live && !still && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(cv);
    const off = progress?.on("change", request);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(queued);
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
