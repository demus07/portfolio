"use client";

import { useEffect, useRef, useState } from "react";
import { Work } from "./run/Work";
import { Card } from "./run/Card";
import { Roots } from "./run/Roots";
import { Method } from "./run/Method";
import { Kitchen } from "./run/Kitchen";
import { Fit } from "./run/Fit";
import s from "./ContourRun.module.css";

/*
 * Contour run. The topographic wallpaper from the rice becomes the ground of the whole page, and one
 * route, like a run along the Coastal Road, is drawn through it as you scroll.
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
function useRoute(root: React.RefObject<HTMLElement | null>) {
  const [geo, setGeo] = useState<{ w: number; h: number; d: string } | null>(null);
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const build = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const narrow = w < 760;
      const cw = Math.min(1240, w - 2 * Math.min(96, Math.max(20, w * 0.05)));
      const gutter = (w - cw) / 2;
      const x = narrow ? 16 : Math.max(20, gutter / 2);
      const stops = Array.from(el.querySelectorAll<HTMLElement>("[data-stop]"));
      const abs = (n: Element) => n.getBoundingClientRect();
      // the open space between sections, where the road may bend further out
      const gaps = stops.slice(1).map((sec) => {
        const prev = sec.previousElementSibling ?? sec;
        return [abs(prev).bottom + window.scrollY - top, abs(sec.firstElementChild ?? sec).top + window.scrollY - top];
      });
      const inGap = (y: number) => gaps.some(([a, b]) => y > a && y < b);
      let d = `M ${x} 0`;
      const leg = narrow ? 260 : 360;
      let y = 0;
      let k = 0;
      while (y < h) {
        const yb = Math.min(h, y + leg);
        const mid = (y + yb) / 2;
        const amp = (narrow ? 4 : inGap(mid) ? 22 : 9) * (k % 2 ? -1 : 1);
        d += ` C ${x + amp} ${y + (yb - y) / 3}, ${x + amp} ${y + (2 * (yb - y)) / 3}, ${x} ${yb}`;
        y = yb;
        k++;
      }
      setGeo({ w, h, d });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [root]);

  useEffect(() => {
    const p = path.current;
    const el = root.current;
    if (!p || !el || !geo) return;
    const total = p.getTotalLength();
    p.style.strokeDasharray = `${total}`;
    let raf = 0;
    const update = () => {
      raf = 0;
      // find the length along the route whose height matches the reading line
      const top = el.getBoundingClientRect().top + window.scrollY;
      const target = window.scrollY + window.innerHeight * 0.62 - top;
      let lo = 0;
      let hi = total;
      for (let k = 0; k < 22; k++) {
        const mid = (lo + hi) / 2;
        if (p.getPointAtLength(mid).y < target) lo = mid;
        else hi = mid;
      }
      p.style.strokeDashoffset = `${total - lo}`;
      const pt = p.getPointAtLength(lo);
      dot.current?.setAttribute("cx", String(pt.x));
      dot.current?.setAttribute("cy", String(pt.y));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [geo, root]);

  return { geo, path, dot };
}

export function ContourRun() {
  const root = useRef<HTMLElement>(null);
  const { geo, path, dot } = useRoute(root);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // one tile for each theme; the stylesheet picks the one that matches
    el.style.setProperty("--tile-light", `url(${contourTile(1200, "rgba(43, 45, 47, 0.1)")})`);
    el.style.setProperty("--tile-dark", `url(${contourTile(1200, "rgba(232, 229, 222, 0.075)")})`);
  }, []);

  return (
    <main ref={root} className={s.root}>
      {geo && (
        <svg className={s.route} width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
          <path d={geo.d} className={s.routeGhost} />
          <path ref={path} d={geo.d} className={s.routeLine} />
          <circle ref={dot} r={6} className={s.runner} />
        </svg>
      )}
      <Kitchen />
      <Work />
      <Card />
      <Roots />
      <Method />
      <Fit />
    </main>
  );
}
