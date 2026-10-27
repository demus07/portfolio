"use client";

import { useEffect, useRef } from "react";
import { Work } from "./run/Work";
import { Card } from "./run/Card";
import { Roots } from "./run/Roots";
import { Method } from "./run/Method";
import { Kitchen } from "./run/Kitchen";
import { Fit } from "./run/Fit";
import s from "./ContourRun.module.css";

/*
 * The body: a walk along Marine Drive, one painted scene after another. The topographic wallpaper
 * from the rice stays underneath as the ground, in case anything shows between them.
 */

// One seamless tile of contour lines. Every octave wraps on the tile, so it repeats without a seam.
function contourTile(size: number, ink: string) {
  const c = document.createElement("canvas");
  const dpr = 2;
  c.width = c.height = size * dpr;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.scale(dpr, dpr);

  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const G = 64;
  const lattice = Array.from({ length: G * G }, rnd);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number, p: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const at = (i: number, j: number) => lattice[(((j % p) + p) % p) * G + (((i % p) + p) % p)];
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const cc = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (cc - a) * yf + (a - b - cc + d) * xf * yf;
  };
  const P = 5;
  const field = (x: number, y: number) => noise(x, y, P) * 0.62 + noise(x * 2, y * 2, P * 2) * 0.28 + noise(x * 4, y * 4, P * 4) * 0.1;

  const step = 5;
  const n = Math.round(size / step);
  const v = new Float32Array((n + 1) * (n + 1));
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) v[j * (n + 1) + i] = field((i / n) * P, (j / n) * P);

  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let l = 0.1; l < 0.95; l += 0.032) {
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = v[j * (n + 1) + i];
        const b = v[j * (n + 1) + i + 1];
        const cc = v[(j + 1) * (n + 1) + i + 1];
        const d = v[(j + 1) * (n + 1) + i];
        const x = i * step;
        const y = j * step;
        const pts: [number, number][] = [];
        if (a < l !== b < l) pts.push([x + ((l - a) / (b - a)) * step, y]);
        if (b < l !== cc < l) pts.push([x + step, y + ((l - b) / (cc - b)) * step]);
        if (d < l !== cc < l) pts.push([x + ((l - d) / (cc - d)) * step, y + step]);
        if (a < l !== d < l) pts.push([x, y + ((l - a) / (d - a)) * step]);
        for (let k = 0; k + 1 < pts.length; k += 2) {
          ctx.moveTo(pts[k][0], pts[k][1]);
          ctx.lineTo(pts[k + 1][0], pts[k + 1][1]);
        }
      }
    }
  }
  ctx.stroke();
  return c.toDataURL("image/png");
}

// The route runs down the left margin like a road along the coast: it never cuts across the
// reading, it only bends, a little more in the open space between sections.
export function ContourRun() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // one tile for each theme; the stylesheet picks the one that matches
    el.style.setProperty("--tile-light", `url(${contourTile(1200, "rgba(43, 45, 47, 0.1)")})`);
    el.style.setProperty("--tile-dark", `url(${contourTile(1200, "rgba(232, 229, 222, 0.075)")})`);
  }, []);

  return (
    <main ref={root} className={s.root}>
      <Kitchen />
      <Work />
      <Card />
      <Roots />
      <Method />
      <Fit />
    </main>
  );
}
