import { glow, rng, TAU, type Pal } from "./lib";
import { paintBay } from "./sneaker";
import type { Paint } from "./Painted";

/*
 * An Irani café on the sea face: a tall arched window onto the bay, a marble table, a laptop open on
 * it with the meeting assistant running, a cutting chai and a plate of bun maska beside it.
 */

export function cafeLayout(w: number, h: number) {
  const narrow = w < 760;
  const table = narrow ? h * 0.74 : h * 0.72;
  const lw = narrow ? w * 0.84 : Math.min(w * 0.5, h * 0.92);
  const cx = narrow ? w * 0.5 : w * 0.66;
  const base = table + (h - table) * 0.42;
  const lidH = lw * 0.64;
  const bezel = lw * 0.028;
  return {
    narrow,
    table,
    lw,
    cx,
    base,
    lidH,
    arch: narrow ? { x: w * 0.14, y: h * 0.47, w: w * 0.72, h: table - h * 0.47 } : { x: w * 0.4, y: h * 0.07, w: w * 0.54, h: table - h * 0.07 },
    screen: { x: cx - lw / 2 + bezel, y: base - lidH + bezel, w: lw - bezel * 2, h: lidH - bezel * 2.3 },
  };
}

const WALL = { light: ["#ebdfc8", "#d9c9ab"], dark: ["#17222c", "#111a22"] };
const BODY = { light: ["#d4d9de", "#aab1b8", "#e8ebee"], dark: ["#2c333a", "#1a1f24", "#3a434b"] };

export function laptop(c: CanvasRenderingContext2D, cx: number, base: number, lw: number, lidH: number, screen: { x: number; y: number; w: number; h: number }, pal: Pal) {
  const body = BODY[pal.dark ? "dark" : "light"];
  const x0 = cx - lw / 2;
  const deck = lw * 0.045;
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.5)" : "rgba(40, 40, 30, 0.22)";
  c.beginPath();
  c.ellipse(cx, base + deck * 1.1, lw * 0.6, deck * 0.7, 0, 0, TAU);
  c.fill();
  c.fillStyle = body[0];
  c.beginPath();
  c.moveTo(x0, base);
  c.lineTo(x0 + lw, base);
  c.lineTo(x0 + lw * 1.06, base + deck);
  c.lineTo(x0 - lw * 0.06, base + deck);
  c.closePath();
  c.fill();
  c.fillStyle = body[1];
  c.fillRect(x0 - lw * 0.06, base + deck, lw * 1.12, deck * 0.28);
  c.fillStyle = body[1];
  c.beginPath();
  c.roundRect(x0, base - lidH, lw, lidH, lw * 0.022);
  c.fill();
  c.fillStyle = "#0c1014";
  c.beginPath();
  c.roundRect(screen.x, screen.y, screen.w, screen.h, lw * 0.006);
  c.fill();
  c.fillStyle = body[2];
  c.fillRect(x0 + lw * 0.02, base - lw * 0.012, lw * 0.96, lw * 0.012);
}

export function cuttingChai(c: CanvasRenderingContext2D, x: number, y: number, s: number, pal: Pal, t: number) {
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.4)" : "rgba(40, 40, 30, 0.18)";
  c.beginPath();
  c.ellipse(x + s * 0.1, y + s * 0.02, s * 0.5, s * 0.07, 0, 0, TAU);
  c.fill();
  const glass = new Path2D();
  glass.moveTo(x - s * 0.3, y);
  glass.lineTo(x - s * 0.4, y - s);
  glass.lineTo(x + s * 0.4, y - s);
  glass.lineTo(x + s * 0.3, y);
  glass.closePath();
  c.fillStyle = pal.dark ? "rgba(200, 215, 230, 0.12)" : "rgba(255, 255, 255, 0.45)";
  c.fill(glass);
  c.save();
  c.clip(glass);
  c.fillStyle = pal.dark ? "#6b4128" : "#b9773f";
  c.fillRect(x - s, y - s * 0.68, s * 2, s);
  c.fillStyle = pal.dark ? "#8a5a38" : "#d39a5e";
  c.fillRect(x - s, y - s * 0.68, s * 2, s * 0.06);
  c.strokeStyle = "rgba(255, 255, 255, 0.25)";
  c.lineWidth = Math.max(1, s * 0.03);
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(x + i * s * 0.1, y);
    c.lineTo(x + i * s * 0.13, y - s);
    c.stroke();
  }
  c.restore();
  c.strokeStyle = pal.dark ? "rgba(220, 230, 240, 0.18)" : "rgba(255, 255, 255, 0.6)";
  c.lineWidth = Math.max(1.5, s * 0.06);
  c.lineCap = "round";
  for (let k = 0; k < 2; k++) {
    const rise = ((t * 0.9 + k * 2.1) % 3) / 3;
    c.globalAlpha = Math.sin(rise * Math.PI);
    const sx = x + (k - 0.5) * s * 0.3;
    const sy = y - s * 1.1 - rise * s * 0.4;
    c.beginPath();
    c.moveTo(sx, sy);
    c.bezierCurveTo(sx + s * 0.25, sy - s * 0.3, sx - s * 0.25, sy - s * 0.6, sx + s * 0.05, sy - s * 0.9);
    c.stroke();
  }
  c.globalAlpha = 1;
}

export const paintCafe: Paint = (c, w, h, { pal, t }) => {
  const L = cafeLayout(w, h);
  const wall = WALL[pal.dark ? "dark" : "light"];

  // the café's back wall, plaster with a darker dado below
  c.fillStyle = wall[0];
  c.fillRect(0, 0, w, L.table);
  c.fillStyle = wall[1];
  c.fillRect(0, L.table - h * 0.16, w, h * 0.16);
  const r = rng(6);
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.06)" : "rgba(120, 90, 50, 0.025)";
  for (let i = 0; i < 120; i++) {
    c.beginPath();
    c.ellipse(r() * w, r() * L.table, 8 + r() * 50, 4 + r() * 18, r() * 3, 0, TAU);
    c.fill();
  }

  // the arched window onto the bay
  const a = L.arch;
  const rad = a.w / 2;
  const opening = new Path2D();
  opening.moveTo(a.x, a.y + a.h);
  opening.lineTo(a.x, a.y + rad);
  opening.arc(a.x + rad, a.y + rad, rad, Math.PI, 0);
  opening.lineTo(a.x + a.w, a.y + a.h);
  opening.closePath();
  c.save();
  c.clip(opening);
  c.translate(a.x, 0);
  paintBay(c, a.w, h, a.y + a.h * 0.62, a.y + a.h, pal, t);
  c.restore();
  // its frame and glazing bars
  const bar = Math.max(4, a.w * 0.012);
  c.strokeStyle = pal.dark ? "#2a1d14" : "#5a4330";
  c.lineWidth = bar * 2.2;
  c.stroke(opening);
  c.lineWidth = bar;
  c.beginPath();
  for (let k = 1; k < 4; k++) {
    c.moveTo(a.x + (a.w / 4) * k, a.y + rad * (1 - Math.sqrt(1 - ((k / 2 - 1) ** 2))));
    c.lineTo(a.x + (a.w / 4) * k, a.y + a.h);
  }
  c.moveTo(a.x, a.y + rad);
  c.lineTo(a.x + a.w, a.y + rad);
  c.stroke();
  // the sea air coming in: a light falling across the wall
  if (!pal.dark) glow(c, a.x + a.w / 2, a.y + a.h * 0.6, a.w * 0.9, "255, 247, 222", 0.25);
  else glow(c, L.cx, L.base - L.lidH / 2, L.lw, "120, 190, 255", 0.12);

  // the marble table top
  const tg = c.createLinearGradient(0, L.table, 0, h);
  tg.addColorStop(0, pal.dark ? "#3a4148" : "#f4f1ec");
  tg.addColorStop(1, pal.dark ? "#262b31" : "#dcd7cf");
  c.fillStyle = tg;
  c.fillRect(0, L.table, w, h - L.table);
  c.fillStyle = pal.dark ? "#1b1f24" : "#8a7a66";
  c.fillRect(0, L.table, w, Math.max(3, h * 0.006));
  c.strokeStyle = pal.dark ? "rgba(255, 255, 255, 0.05)" : "rgba(90, 90, 100, 0.12)";
  c.lineWidth = 1.2;
  const v = rng(2);
  for (let i = 0; i < 9; i++) {
    let x = v() * w;
    let y = L.table + v() * (h - L.table);
    c.beginPath();
    c.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += 30 + v() * 60;
      y += (v() - 0.5) * 30;
      c.lineTo(x, y);
    }
    c.stroke();
  }

  laptop(c, L.cx, L.base, L.lw, L.lidH, L.screen, pal);
  // on a phone the replay runs below the scene, so the screen just shows the call's colour
  if (L.narrow) {
    c.fillStyle = "#1a2f42";
    c.fillRect(L.screen.x, L.screen.y, L.screen.w, L.screen.h);
  }

  // chai and bun maska
  const s = L.lw * 0.1;
  const left = L.cx - L.lw * 0.62;
  cuttingChai(c, left, L.base + s * 0.4, s, pal, t);
  if (!L.narrow) {
    const px = left - s * 2.6;
    const py = L.base + s * 0.7;
    c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.4)" : "rgba(40, 40, 30, 0.15)";
    c.beginPath();
    c.ellipse(px, py + s * 0.12, s * 1.3, s * 0.32, 0, 0, TAU);
    c.fill();
    c.fillStyle = pal.dark ? "#9aa0a6" : "#fbf8f2";
    c.beginPath();
    c.ellipse(px, py, s * 1.25, s * 0.3, 0, 0, TAU);
    c.fill();
    c.fillStyle = pal.dark ? "#8a6236" : "#d9a35c";
    c.beginPath();
    c.ellipse(px - s * 0.2, py - s * 0.22, s * 0.62, s * 0.3, 0, Math.PI, TAU);
    c.fill();
    c.fillStyle = pal.dark ? "#c8b48a" : "#fff3c8";
    c.fillRect(px - s * 0.8, py - s * 0.24, s * 1.2, s * 0.06);
  }
};
