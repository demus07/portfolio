import { cloud, deco, glow, lampPost, moon, promenade, rng, sky, stars, TAU } from "./lib";
import { paintBay } from "./sneaker";
import type { Paint } from "./Painted";

/*
 * Two views along the Queen's Necklace. The first looks across the road at the Art Deco blocks, where
 * a hoarding on a facade carries Typestorm, lit from below. The second stands on the promenade at a
 * bus shelter, the bay behind it, its backlit ad panel showing the redesign.
 */

export function hoardingLayout(w: number, h: number) {
  const narrow = w < 760;
  const board = narrow
    ? { x: w * 0.06, y: h * 0.36, w: w * 0.88, h: w * 0.88 * 0.56 }
    : { x: w * 0.38, y: h * 0.1, w: w * 0.56, h: Math.min(w * 0.56 * 0.56, h * 0.58) };
  return { narrow, board, street: narrow ? h * 0.86 : h * 0.84 };
}

export const paintHoarding: Paint = (c, w, h, { pal, t }) => {
  const { board, street } = hoardingLayout(w, h);
  sky(c, w, 0, street, pal.sky);
  if (pal.dark) {
    stars(c, w, h * 0.4, 180, 19, t);
    moon(c, w * 0.12, h * 0.12, Math.min(w, h) * 0.02);
  } else {
    glow(c, w * 0.9, -h * 0.1, w * 0.6, pal.glow, 0.8);
    cloud(c, w * 0.18, h * 0.16, Math.min(w, h) * 0.06, pal, 3);
  }
  // the row of blocks across the road, the middle one carrying the hoarding
  const r = rng(40);
  // the blocks stand to the right, leaving the sky on the left for the words
  let x = w < 760 ? -w * 0.04 : w * 0.3;
  let i = 0;
  while (x < w) {
    const bw = w * (0.13 + r() * 0.1);
    const bh = h * (0.38 + r() * 0.3);
    deco(c, x, street, bw, bh, pal, i + 1);
    x += bw + w * 0.004;
    i++;
  }
  // the hoarding's own block, taller, behind its frame
  deco(c, board.x - board.w * 0.06, street, board.w * 1.12, street - board.y + board.h * 0.12, pal, 2);
  // the hoarding: a steel frame, and lamps on arms throwing light up onto it
  const f = Math.max(6, board.w * 0.014);
  c.fillStyle = pal.dark ? "#0b0f13" : "#3a4248";
  c.fillRect(board.x - f, board.y - f, board.w + f * 2, board.h + f * 2);
  c.fillStyle = "#16151f";
  c.fillRect(board.x, board.y, board.w, board.h);
  for (let k = 0; k < 4; k++) {
    const lx = board.x + board.w * (0.12 + k * 0.25);
    const ly = board.y + board.h + f * 3.2;
    c.strokeStyle = pal.dark ? "#0b0f13" : "#3a4248";
    c.lineWidth = Math.max(2, f * 0.35);
    c.beginPath();
    c.moveTo(lx, board.y + board.h + f);
    c.lineTo(lx, ly);
    c.stroke();
    c.fillStyle = pal.dark ? "#c9cfd4" : "#5b646a";
    c.beginPath();
    c.ellipse(lx, ly, f * 1.1, f * 0.5, 0, 0, TAU);
    c.fill();
    if (pal.dark) glow(c, lx, board.y + board.h * 0.85, board.w * 0.2, "220, 225, 255", 0.12);
  }
  // the road: kerb, tarmac, and the light trails of the traffic
  c.fillStyle = pal.dark ? "#11181f" : "#6f7479";
  c.fillRect(0, street, w, h - street);
  c.fillStyle = pal.dark ? "#2a3138" : "#b9b3a8";
  c.fillRect(0, street, w, Math.max(4, h * 0.012));
  const lane = street + (h - street) * 0.55;
  c.strokeStyle = pal.dark ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.7)";
  c.lineWidth = 2;
  c.setLineDash([24, 22]);
  c.lineDashOffset = -t * 40;
  c.beginPath();
  c.moveTo(0, lane);
  c.lineTo(w, lane);
  c.stroke();
  c.setLineDash([]);
  if (pal.dark) {
    for (let k = 0; k < 3; k++) {
      const p = ((t * 0.25 + k * 0.37) % 1.4) - 0.2;
      const cx = p * w;
      const g = c.createLinearGradient(cx - w * 0.2, 0, cx, 0);
      g.addColorStop(0, "rgba(255, 90, 70, 0)");
      g.addColorStop(1, "rgba(255, 90, 70, 0.55)");
      c.fillStyle = g;
      c.fillRect(cx - w * 0.2, lane + (h - lane) * 0.3, w * 0.2, 2.5);
    }
  }
  // lamps along the kerb
  for (let k = 0; k < 4; k++) lampPost(c, w * (0.08 + k * 0.3), street + 2, h * 0.32, pal, pal.dark ? 1 : 0);
};

export function shelterLayout(w: number, h: number) {
  const narrow = w < 760;
  const panel = narrow
    ? { x: w * 0.1, y: h * 0.42, w: w * 0.8, h: w * 0.8 * 0.6 }
    : { x: w * 0.44, y: h * 0.2, w: w * 0.46, h: w * 0.46 * 0.6 };
  return { narrow, panel, floor: panel.y + panel.h + (narrow ? h * 0.08 : h * 0.12), horizon: narrow ? h * 0.36 : h * 0.42 };
}

export const paintShelter: Paint = (c, w, h, { pal, t }) => {
  const { panel, floor, horizon } = shelterLayout(w, h);
  const wall = horizon + (floor - horizon) * 0.55;
  paintBay(c, w, h, horizon, wall, pal, t, 0.3);
  promenade(c, w, wall, h, pal, w * 0.3);
  // the shelter: a long roof slab on posts, the backlit panel at one end, a bench
  const roofY = panel.y - h * 0.08;
  const left = panel.x - w * 0.3;
  const right = panel.x + panel.w + w * 0.03;
  const steel = pal.dark ? "#1c2329" : "#4f5a61";
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.35)" : "rgba(40, 40, 30, 0.14)";
  c.beginPath();
  c.ellipse((left + right) / 2, floor + h * 0.01, (right - left) * 0.55, h * 0.02, 0, 0, TAU);
  c.fill();
  c.fillStyle = steel;
  [left + w * 0.01, panel.x - w * 0.012, right - w * 0.008].forEach((px) => c.fillRect(px, roofY, Math.max(4, w * 0.005), floor - roofY));
  c.fillStyle = pal.dark ? "#a2453a" : "#b8463b";
  c.beginPath();
  c.moveTo(left - w * 0.02, roofY);
  c.lineTo(right + w * 0.02, roofY);
  c.lineTo(right + w * 0.01, roofY - h * 0.035);
  c.lineTo(left - w * 0.01, roofY - h * 0.035);
  c.closePath();
  c.fill();
  c.fillStyle = "rgba(0, 0, 0, 0.18)";
  c.fillRect(left - w * 0.02, roofY - h * 0.006, right - left + w * 0.04, h * 0.006);
  // bench
  const by = floor - h * 0.09;
  c.fillStyle = steel;
  c.fillRect(left + w * 0.04, by, panel.x - left - w * 0.09, h * 0.014);
  c.fillRect(left + w * 0.06, by, Math.max(3, w * 0.003), floor - by);
  c.fillRect(panel.x - w * 0.07, by, Math.max(3, w * 0.003), floor - by);
  // the panel's frame and its light
  const f = Math.max(6, panel.w * 0.018);
  c.fillStyle = steel;
  c.fillRect(panel.x - f, panel.y - f, panel.w + f * 2, panel.h + f * 2);
  c.fillRect(panel.x + panel.w * 0.2, panel.y + panel.h + f, Math.max(4, f * 0.5), floor - panel.y - panel.h - f);
  c.fillRect(panel.x + panel.w * 0.8, panel.y + panel.h + f, Math.max(4, f * 0.5), floor - panel.y - panel.h - f);
  if (pal.dark) glow(c, panel.x + panel.w / 2, panel.y + panel.h / 2, panel.w * 0.9, "230, 235, 255", 0.12);
  // a stop sign on its pole
  const sx = right + w * 0.035;
  c.fillStyle = steel;
  c.fillRect(sx, roofY - h * 0.06, Math.max(3, w * 0.003), floor - roofY + h * 0.06);
  c.fillStyle = pal.dark ? "#a2453a" : "#b8463b";
  c.beginPath();
  c.arc(sx + 1.5, roofY - h * 0.08, Math.min(w, h) * 0.025, 0, TAU);
  c.fill();
  c.fillStyle = "#f6f1e6";
  c.beginPath();
  c.arc(sx + 1.5, roofY - h * 0.08, Math.min(w, h) * 0.015, 0, TAU);
  c.fill();
};
