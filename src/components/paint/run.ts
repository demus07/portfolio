import { lampPost, runner } from "./lib";
import { paintBay } from "./sneaker";
import type { Paint } from "./Painted";

/*
 * A run along the promenade, side on, the bay behind. As you scroll the runner goes left to right
 * past four lamps, one for each pass I make at a thing; each lamp lights as they reach it.
 */

// where the four lamps stand, as shares of the width; on a phone they spread across it
export const lampsAt = (narrow: boolean) => (narrow ? [0.14, 0.38, 0.62, 0.86] : [0.38, 0.55, 0.72, 0.89]);

export function runLayout(w: number, h: number) {
  const narrow = w < 760;
  const wall = narrow ? h * 0.6 : h * 0.62;
  const floor = narrow ? h * 0.8 : h * 0.84;
  return { narrow, wall, floor, lamps: lampsAt(narrow).map((x) => ({ x: x * w, f: x, y: floor })) };
}

// where the runner is, as a share of the width, for a scroll position
export const runnerAt = (p: number) => -0.04 + Math.min(1, Math.max(0, (p - 0.04) / 0.86)) * 1.0;

export const paintRun: Paint = (c, w, h, { pal, t, p }) => {
  const { wall, floor, narrow } = runLayout(w, h);
  paintBay(c, w, h, wall - h * 0.16, wall, pal, t, 0.6);
  // the sea wall's top edge, then the walk, side on
  c.fillStyle = pal.lip;
  c.fillRect(0, wall, w, h * 0.012);
  const g = c.createLinearGradient(0, wall, 0, h);
  g.addColorStop(0, pal.walk[1]);
  g.addColorStop(1, pal.walk[0]);
  c.fillStyle = g;
  c.fillRect(0, wall + h * 0.012, w, h - wall);
  c.strokeStyle = pal.dark ? "rgba(0, 0, 0, 0.25)" : "rgba(60, 50, 40, 0.1)";
  c.lineWidth = 1;
  c.beginPath();
  for (let x = 0; x < w; x += w / 14) {
    c.moveTo(x, wall + h * 0.012);
    c.lineTo(x - w * 0.02, h);
  }
  c.moveTo(0, floor);
  c.lineTo(w, floor);
  c.stroke();

  const x = runnerAt(p) * w;
  lampsAt(narrow).forEach((lx) => {
    const reached = x >= lx * w - w * 0.01;
    lampPost(c, lx * w, wall + h * 0.03, (wall - h * 0.06) * (narrow ? 0.34 : 0.62), pal, reached ? 1 : 0);
  });
  // the runner's shadow, then the runner; the stride keeps time with the scroll and the clock
  const s = narrow ? h * 0.14 : h * 0.2;
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.4)" : "rgba(40, 40, 30, 0.18)";
  c.beginPath();
  c.ellipse(x, floor + s * 0.02, s * 0.22, s * 0.03, 0, 0, Math.PI * 2);
  c.fill();
  runner(c, x, floor - s * 0.02, s, p * 60 + t * 2, pal);
};
