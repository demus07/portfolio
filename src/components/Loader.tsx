"use client";

import { useEffect, useState } from "react";

/*
 * The sea face's Art Deco skyline, drawn as one line from left to right while the counter runs to
 * 100, its windows lighting as the line passes them, the name settling under it; then the curtain
 * lifts onto the bay.
 */

// the skyline, laid out once: a run of blocks of different heights on a ground line, in a 1000×240 box
const GROUND = 220;
const { path: SKYLINE, windows: WINDOWS } = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let d = `M 0 ${GROUND}`;
  const windows: { x: number; y: number }[] = [];
  let x = 0;
  while (x < 1000) {
    const bw = Math.min(1000 - x, 46 + rnd() * 62);
    const bh = 50 + rnd() * 140;
    const top = GROUND - bh;
    // a rounded Deco corner on some, a stepped crown on others
    if (rnd() > 0.5) d += ` L ${x} ${top + 12} Q ${x} ${top} ${x + 12} ${top}`;
    else d += ` L ${x} ${top}`;
    if (bw > 70 && rnd() > 0.4) d += ` L ${x + bw * 0.35} ${top} L ${x + bw * 0.35} ${top - 14} L ${x + bw * 0.65} ${top - 14} L ${x + bw * 0.65} ${top}`;
    d += ` L ${x + bw} ${top} L ${x + bw} ${GROUND}`;
    for (let wy = top + 18; wy < GROUND - 14; wy += 22)
      for (let wx = x + 10; wx < x + bw - 12; wx += 18) if (rnd() > 0.55) windows.push({ x: Math.round(wx), y: Math.round(wy) });
    x += bw + 6 + rnd() * 10;
    if (x < 1000) d += ` L ${Math.min(1000, x)} ${GROUND}`;
  }
  return { path: d, windows };
})();

const NAME = "Sumedh Kudav";
const DURATION = 2600;

export function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"count" | "lift" | "gone">("count");

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      html.classList.remove("is-loading");
      html.classList.add("is-loaded");
      window.dispatchEvent(new Event("loader:done"));
    };

    if (reduce) {
      const id = requestAnimationFrame(() => {
        setProgress(100);
        setPhase("gone");
        finish();
      });
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    let t1 = 0;
    let t2 = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / DURATION);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setProgress(Math.round(eased * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        t1 = window.setTimeout(() => {
          setPhase("lift");
          finish();
        }, 350);
        t2 = window.setTimeout(() => setPhase("gone"), 1500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`loader${phase === "lift" ? " is-lifting" : ""}`} aria-hidden="true">
      <div className="loader-center">
        <svg className="loader-skyline" viewBox="-4 -40 1008 268">
          <path d={SKYLINE} pathLength={1} className="loader-line" style={{ strokeDashoffset: 1 - progress / 100 }} />
          {WINDOWS.map((w, i) => (
            <rect
              key={i}
              x={w.x}
              y={w.y}
              width={6}
              height={8}
              className={`loader-window${progress >= (w.x / 1000) * 100 + 4 ? " is-on" : ""}`}
            />
          ))}
        </svg>
        <p className="loader-name">
          {[...NAME].map((ch, i) => (
            <span key={i} className={progress >= 30 + (i / NAME.length) * 60 ? "is-in" : ""}>
              {ch}
            </span>
          ))}
        </p>
      </div>
      <p className="loader-count">{progress}</p>
    </div>
  );
}
