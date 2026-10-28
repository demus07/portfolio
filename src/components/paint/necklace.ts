import { deco, drift, glow, moon, rng, sea, sky, stars, TAU } from "./lib";
import type { Paint } from "./Painted";

/*
 * The Queen's Necklace from Malabar Hill: the bay in the middle, Marine Drive curving round it to the
 * towers at Nariman Point, its lamps strung along the curve. A light runs the curve for good, and
 * the steps of the loop I work in sit along it, each lighting as the light goes by.
 */

const LOOP = 10; // seconds for the light to run the whole curve

// the curve of the promenade, from the near end at the left to Nariman Point on the right
function curve(w: number, h: number, narrow: boolean) {
  // it bows towards you and away to the right, the bay held inside the curve
  const p0 = { x: narrow ? -w * 0.02 : w * 0.42, y: h * 1.02 };
  const p1 = { x: narrow ? w * 0.62 : w * 0.82, y: h * 0.9 };
  const p2 = { x: w * 1.04, y: h * 0.44 };
  return (u: number) => ({
    x: (1 - u) ** 2 * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x,
    y: (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y,
  });
}

export const STEP_AT = [0.06, 0.24, 0.42, 0.6, 0.78];

export function necklaceLayout(w: number, h: number) {
  const narrow = w < 760;
  const at = curve(w, h, narrow);
  return { narrow, horizon: h * 0.4, steps: STEP_AT.map((u) => at(u)), loop: LOOP };
}

export const paintNecklace: Paint = (c, w, h, { pal, t }) => {
  const { narrow, horizon } = necklaceLayout(w, h);
  const at = curve(w, h, narrow);
  sky(c, w, 0, horizon, pal.sky);
  if (pal.dark) {
    stars(c, w, horizon, 220, 23, t);
    moon(c, w * 0.86, h * 0.1, Math.min(w, h) * 0.02);
  } else {
    glow(c, w * 0.7, -h * 0.1, w * 0.6, pal.glow, 0.8);
    drift(c, w, t, pal, w < 760 ? 0 : w * 0.46, [
      { at: 0.35, y: h * 0.14, s: Math.min(w, h) * 0.05, v: 7, seed: 9 },
      { at: 0.85, y: h * 0.25, s: Math.min(w, h) * 0.035, v: 5, seed: 2 },
    ]);
  }
  sea(c, w, horizon, h, pal, t, 29);

  // the land outside the curve: the city, falling away to the near shore
  const land = new Path2D();
  land.moveTo(at(0).x, h);
  for (let i = 0; i <= 60; i++) {
    const p = at(i / 60);
    land.lineTo(p.x, p.y);
  }
  land.lineTo(w, at(1).y);
  land.lineTo(w, h);
  land.closePath();
  // the city sits behind the curve, so it is painted first, standing along it
  const r = rng(33);
  for (let i = 0; i < 46; i++) {
    const u = i / 45;
    const p = at(u);
    const depth = 1 - u * 0.8;
    const bw = (18 + r() * 26) * depth * (w / 1440) * 1.4;
    const bh = (40 + r() * 90) * depth * (h / 900) * 1.2 + (u > 0.85 ? (u - 0.85) * h * 1.2 : 0);
    deco(c, p.x - bw * 0.2, p.y + 2, bw, bh, pal, i);
  }
  c.save();
  c.clip(land);
  const lg = c.createLinearGradient(0, horizon, 0, h);
  lg.addColorStop(0, pal.dark ? "#141d26" : "#c9c0ad");
  lg.addColorStop(1, pal.dark ? "#0b1117" : "#a99f8b");
  c.fillStyle = lg;
  c.fillRect(0, 0, w, h);
  // streets and windows down in the city
  for (let i = 0; i < 500; i++) {
    const x = r() * w;
    const y = horizon + r() * (h - horizon);
    c.fillStyle = pal.dark ? `rgba(${pal.lamp}, ${0.15 + r() * 0.5})` : "rgba(90, 80, 60, 0.12)";
    c.fillRect(x, y, 2, 2);
  }
  c.restore();

  // the promenade itself, a pale band along the curve
  c.strokeStyle = pal.dark ? "#3a434b" : "#efe9dc";
  c.lineWidth = Math.max(3, h * 0.008);
  c.beginPath();
  for (let i = 0; i <= 80; i++) {
    const p = at(i / 80);
    if (i) c.lineTo(p.x, p.y);
    else c.moveTo(p.x, p.y);
  }
  c.stroke();

  // the necklace: lamps all along it
  for (let i = 0; i <= 90; i++) {
    const u = i / 90;
    const p = at(u);
    const size = 1.5 + (1 - u) * 2.5;
    if (pal.dark) glow(c, p.x, p.y - size, size * 5, pal.lamp, 0.35);
    c.fillStyle = pal.dark ? `rgba(${pal.lamp}, 0.95)` : "rgba(70, 80, 90, 0.6)";
    c.beginPath();
    c.arc(p.x, p.y - size * 1.4, size * 0.7, 0, TAU);
    c.fill();
  }

  // the light that runs the loop, with a short trail, and a ring at each step it lights
  const run = ((t / LOOP) % 1 + 1) % 1;
  for (let k = 0; k < 14; k++) {
    const u = run - k * 0.006;
    if (u < 0) continue;
    const p = at(u);
    c.fillStyle = `rgba(${pal.dark ? "160, 230, 228" : "60, 110, 113"}, ${(1 - k / 14) * 0.8})`;
    c.beginPath();
    c.arc(p.x, p.y - 4, (1 - k / 14) * 5 + 1, 0, TAU);
    c.fill();
  }
  const head = at(run);
  glow(c, head.x, head.y - 4, 40, pal.dark ? "160, 230, 228" : "60, 110, 113", 0.45);
  STEP_AT.forEach((u) => {
    const p = at(u);
    const since = (((run - u) % 1) + 1) % 1;
    const lit = since < 0.12 ? 1 - since / 0.12 : 0;
    c.strokeStyle = pal.dark ? `rgba(160, 230, 228, ${0.35 + lit * 0.65})` : `rgba(60, 110, 113, ${0.4 + lit * 0.6})`;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(p.x, p.y - 4, 7 + lit * 5, 0, TAU);
    c.stroke();
  });
};
