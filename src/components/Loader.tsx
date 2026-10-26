"use client";

import { useEffect, useState } from "react";

/*
 * The Queen's Necklace lights up lamp by lamp while the counter runs to 100,
 * the name settles under it, and the curtain lifts onto the bay.
 */

const LAMPS = 30;
const P = [
  { x: 30, y: 150 },
  { x: 190, y: 40 },
  { x: 420, y: 52 },
  { x: 590, y: 128 },
];

const lamps = Array.from({ length: LAMPS }, (_, i) => {
  const t = i / (LAMPS - 1);
  const u = 1 - t;
  const x = u ** 3 * P[0].x + 3 * u * u * t * P[1].x + 3 * u * t * t * P[2].x + t ** 3 * P[3].x;
  const y = u ** 3 * P[0].y + 3 * u * u * t * P[1].y + 3 * u * t * t * P[2].y + t ** 3 * P[3].y;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
});

const NAME = "SUMEDH KUDAV";
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
        <svg className="loader-necklace" viewBox="0 0 620 190">
          <defs>
            <filter id="lamp-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <path
            d={`M ${P[0].x} ${P[0].y + 6} C ${P[1].x} ${P[1].y + 6}, ${P[2].x} ${P[2].y + 6}, ${P[3].x} ${P[3].y + 6}`}
            className="loader-road"
            pathLength={1}
            style={{ strokeDashoffset: 1 - progress / 100 }}
          />
          {lamps.map((l, i) => {
            const on = progress >= ((i + 1) / LAMPS) * 100;
            return (
              <g key={i} className={`loader-lamp${on ? " is-on" : ""}`}>
                <circle cx={l.x} cy={l.y} r={7} filter="url(#lamp-glow)" className="loader-lamp-glow" />
                <circle cx={l.x} cy={l.y} r={2.4} className="loader-lamp-core" />
              </g>
            );
          })}
        </svg>
        <p className="loader-name">
          {[...NAME].map((ch, i) => (
            <span
              key={i}
              className={progress >= 20 + (i / NAME.length) * 70 ? "is-in" : ""}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      <p className="loader-meta">
        Software engineer
        <br />
        Mumbai, India
        <br />
        Portfolio — 2026
      </p>
      <p className="loader-count">{progress}</p>
      <span className="loader-bar" style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}
