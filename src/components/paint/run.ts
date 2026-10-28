import { drift, glow, lampPost, moon, moonPath, rng, runner, sea, sky, stars } from "./lib";
import type { Paint } from "./Painted";

/*
 * A run along the promenade, side on, the bay behind, with the camera running alongside: the
 * runner holds the middle of the frame and the world slides past, for good. The first four lamps
 * are the four passes I make at a thing; each lights, pooling light on the walk, as the runner goes
 * under it, and the lamps after them just keep coming.
 * `p` here is not a share of the scroll but the seconds the runner has been running.
 */

// where the runner holds in the frame, and how fast the world goes by, in widths a second
export const RUNNER_X = 0.45;
const SPEED = 0.2;
const FIRST = 0.72;
const GAP = 0.55;

// where lamp i stands on screen, as a share of the width, after e seconds
export const lampAt = (i: number, e: number) => FIRST + i * GAP - e * SPEED;
// the seconds at which the runner passes under lamp i
export const passAt = (i: number) => (FIRST + i * GAP - RUNNER_X) / SPEED;

export function runLayout(w: number, h: number) {
  const narrow = w < 760;
  const wall = narrow ? h * 0.6 : h * 0.62;
  const floor = narrow ? h * 0.76 : h * 0.84;
  return { narrow, w, h, wall, floor };
}

export const paintRun: Paint = (c, w, h, { pal, t, p }) => {
  const { wall, floor, narrow } = runLayout(w, h);
  const cam = p * SPEED * w;
  const horizon = wall - h * 0.16;

  // the far things barely move, the near ones move with the camera
  sky(c, w, 0, horizon, pal.sky);
  if (pal.dark) {
    stars(c, w, horizon * 0.95, 220, 11, t);
    moon(c, w * 0.78, h * 0.13, Math.min(w, h) * 0.022);
  } else {
    glow(c, w * 0.1, -h * 0.08, w * 0.7, pal.glow, 0.85);
    drift(c, w, t, pal, narrow ? 0 : w * 0.42, [
      { at: 0.3, y: horizon * (narrow ? 0.72 : 0.36), s: Math.min(w, h) * 0.07, v: 9, seed: 4 },
      { at: 0.8, y: horizon * (narrow ? 0.88 : 0.62), s: Math.min(w, h) * 0.045, v: 6, seed: 7 },
    ]);
  }
  const r = rng(21);
  c.fillStyle = pal.far;
  const far = cam * 0.04;
  for (let x = -far % (w * 0.6) - w * 0.6; x < w; ) {
    const bw = 8 + r() * 26;
    const bh = 4 + r() * 16;
    c.fillRect(x, horizon - bh, bw, bh + 1);
    if (pal.dark && r() > 0.5) {
      c.fillStyle = `rgba(${pal.lamp}, 0.7)`;
      c.fillRect(x + bw * 0.3, horizon - bh * 0.6, 1.5, 1.5);
      c.fillStyle = pal.far;
    }
    x += bw + r() * 6;
  }
  sea(c, w, horizon, wall, pal, t, 13);
  if (pal.dark) moonPath(c, w * 0.78, horizon, wall, t);

  // the sea wall's top edge, then the walk, its joints sliding past at the camera's speed
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
  const joint = w / 9;
  for (let x = -(cam % joint); x < w + joint; x += joint) {
    c.moveTo(x, wall + h * 0.012);
    c.lineTo(x - w * 0.03, h);
  }
  c.moveTo(0, floor);
  c.lineTo(w, floor);
  c.stroke();

  // the lamps, lit once the runner has passed under them, each pooling light on the walk
  const ht = (wall - h * 0.06) * (narrow ? 0.4 : 0.66);
  const near = Math.floor((p * SPEED - FIRST) / GAP);
  for (let i = Math.max(0, near - 1); i < near + 4; i++) {
    const lx = lampAt(i, p) * w;
    if (lx < -w * 0.3 || lx > w * 1.3) continue;
    const on = Math.min(1, Math.max(0, (RUNNER_X * w - lx) / (w * 0.04)));
    if (on > 0) {
      c.fillStyle = `rgba(${pal.lamp}, ${(pal.dark ? 0.22 : 0.12) * on})`;
      c.beginPath();
      c.ellipse(lx + ht * 0.13, floor - h * 0.02, w * (narrow ? 0.2 : 0.12), h * 0.035, 0, 0, Math.PI * 2);
      c.fill();
    }
    lampPost(c, lx, wall + h * 0.03, ht, pal, on);
  }

  // the runner, holding the middle; the stride keeps time with the clock
  const s = narrow ? h * 0.15 : h * 0.22;
  const x = RUNNER_X * w;
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.4)" : "rgba(40, 40, 30, 0.18)";
  c.beginPath();
  c.ellipse(x, floor + s * 0.02, s * 0.22, s * 0.03, 0, 0, Math.PI * 2);
  c.fill();
  runner(c, x, floor - s * 0.02, s, p * 9, pal);
};
