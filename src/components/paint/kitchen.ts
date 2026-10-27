import { glow, rng } from "./lib";
import type { Paint } from "./Painted";

/*
 * A restaurant's window on a Mumbai street: a striped awning, plaster wall, and through the glass
 * a warm kitchen pass with a plate under the lamp. As you scroll the ingredients thrown on the
 * wall go in through the window and the plate fills, dab by dab, until it steams.
 */

export function kitchenLayout(w: number, h: number) {
  const narrow = w < 760;
  const win = narrow
    ? { x: w * 0.07, y: h * 0.4, w: w * 0.86, h: h * 0.4 }
    : { x: w * 0.47, y: h * 0.2, w: Math.min(w * 0.45, h * 0.95), h: h * 0.6 };
  const counter = win.y + win.h * 0.76;
  const plate = { x: win.x + win.w * 0.5, y: counter + win.h * 0.075, rx: win.w * 0.21, ry: win.w * 0.056 };
  return { narrow, win, counter, plate };
}

const TONE = {
  light: { wall: "#e7d8bf", wallDark: "rgba(120, 90, 50, 0.025)", street: "#c9bea9", frame: "#3d2e22", awning: ["#3c6e71", "#f1e8d6"], sill: "#d6c6aa" },
  dark: { wall: "#1a232d", wallDark: "rgba(0, 0, 0, 0.07)", street: "#0f151b", frame: "#1d140d", awning: ["#1f3c3e", "#5d574c"], sill: "#26303a" },
};

function dish(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, q: number, t: number) {
  // the plate, with its well
  c.fillStyle = "rgba(60, 30, 10, 0.25)";
  c.beginPath();
  c.ellipse(x, y + ry * 0.35, rx * 1.05, ry * 1.05, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#fbf8f2";
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#efe9de";
  c.beginPath();
  c.ellipse(x, y + ry * 0.05, rx * 0.66, ry * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  // what the kitchen makes of the ingredients, a few strokes at a time
  const at = (from: number) => Math.min(1, Math.max(0, (q - from) / 0.18));
  const sauce = at(0);
  if (sauce > 0) {
    c.strokeStyle = "#9c3b2a";
    c.lineWidth = ry * 0.32;
    c.lineCap = "round";
    c.beginPath();
    c.ellipse(x, y + ry * 0.05, rx * 0.46, ry * 0.4, 0, Math.PI * 0.85, Math.PI * (0.85 + 1.1 * sauce));
    c.stroke();
  }
  const pieces = [
    [-0.22, -0.05, "#d9a45b"],
    [0.02, -0.12, "#e0b067"],
    [0.24, -0.02, "#d39a52"],
  ] as const;
  pieces.forEach(([dx, dy, col], i) => {
    const k = at(0.18 + i * 0.12);
    if (!k) return;
    c.fillStyle = "rgba(80, 40, 10, 0.25)";
    c.beginPath();
    c.ellipse(x + dx * rx, y + dy * ry + ry * 0.22, rx * 0.12 * k, ry * 0.18 * k, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(x + dx * rx, y + dy * ry - ry * 0.12 * k, rx * 0.11 * k, ry * 0.32 * k, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255, 240, 200, 0.5)";
    c.beginPath();
    c.ellipse(x + dx * rx - rx * 0.03, y + dy * ry - ry * 0.28 * k, rx * 0.04 * k, ry * 0.08 * k, -0.4, 0, Math.PI * 2);
    c.fill();
  });
  // herbs and a drizzle to finish
  const herbs = at(0.6);
  if (herbs) {
    const r = rng(31);
    for (let i = 0; i < 14 * herbs; i++) {
      c.fillStyle = r() > 0.5 ? "#4f7a3a" : "#7fa055";
      c.beginPath();
      c.ellipse(x + (r() - 0.5) * rx * 0.9, y + (r() - 0.6) * ry * 0.7, rx * 0.025, ry * 0.07, r() * 3, 0, Math.PI * 2);
      c.fill();
    }
  }
  const drizzle = at(0.75);
  if (drizzle) {
    c.strokeStyle = "rgba(250, 240, 215, 0.9)";
    c.lineWidth = ry * 0.06;
    c.beginPath();
    for (let i = 0; i <= 20 * drizzle; i++) {
      const f = i / 20;
      const px = x - rx * 0.4 + f * rx * 0.8;
      const py = y - ry * 0.1 + Math.sin(f * 14) * ry * 0.15;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.stroke();
  }
  // steam, once it is a meal
  if (q > 0.92) {
    c.strokeStyle = "rgba(255, 255, 255, 0.35)";
    c.lineWidth = ry * 0.12;
    for (let k = 0; k < 3; k++) {
      const rise = ((t * 0.5 + k / 3) % 1);
      c.globalAlpha = Math.sin(rise * Math.PI) * Math.min(1, (q - 0.92) * 12);
      const sx = x + (k - 1) * rx * 0.25;
      const sy = y - ry * 0.6 - rise * ry * 3;
      c.beginPath();
      c.moveTo(sx, sy);
      c.bezierCurveTo(sx + rx * 0.08, sy - ry, sx - rx * 0.08, sy - ry * 1.8, sx + rx * 0.02, sy - ry * 2.6);
      c.stroke();
    }
    c.globalAlpha = 1;
  }
}

export const paintKitchen: Paint = (c, w, h, { pal, t, p }) => {
  const { win, counter, plate } = kitchenLayout(w, h);
  const tone = TONE[pal.dark ? "dark" : "light"];
  const q = Math.min(1, Math.max(0, (p - 0.28) / 0.5));

  // the wall, its plaster patched and stained the way Mumbai walls are
  c.fillStyle = tone.wall;
  c.fillRect(0, 0, w, h);
  const r = rng(12);
  c.fillStyle = tone.wallDark;
  for (let i = 0; i < 140; i++) {
    c.beginPath();
    c.ellipse(r() * w, r() * h, 8 + r() * 50, 4 + r() * 18, r() * 3, 0, Math.PI * 2);
    c.fill();
  }
  // the street at its foot
  const street = h * 0.9;
  c.fillStyle = tone.street;
  c.fillRect(0, street, w, h - street);
  c.fillStyle = pal.dark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.35)";
  c.fillRect(0, street, w, 3);

  // the kitchen's light, spilling out onto the wall and the pavement
  const lit = pal.dark ? 1 : 0.45;
  glow(c, win.x + win.w / 2, win.y + win.h * 0.6, win.w * 1.1, pal.lamp, 0.22 * lit);
  c.fillStyle = `rgba(${pal.lamp}, ${0.1 * lit})`;
  c.beginPath();
  c.moveTo(win.x, street);
  c.lineTo(win.x + win.w, street);
  c.lineTo(win.x + win.w * 1.2, h);
  c.lineTo(win.x - win.w * 0.2, h);
  c.closePath();
  c.fill();

  // frame, then the room beyond the glass
  const f = win.w * 0.03;
  c.fillStyle = tone.frame;
  c.fillRect(win.x - f, win.y - f, win.w + f * 2, win.h + f * 2);
  const room = c.createLinearGradient(0, win.y, 0, win.y + win.h);
  room.addColorStop(0, pal.dark ? "#f2bd73" : "#f0cf9c");
  room.addColorStop(1, pal.dark ? "#c47c3c" : "#d9a46a");
  c.fillStyle = room;
  c.fillRect(win.x, win.y, win.w, win.h);

  c.save();
  c.beginPath();
  c.rect(win.x, win.y, win.w, win.h);
  c.clip();
  // tiles on the back wall
  c.strokeStyle = "rgba(120, 70, 30, 0.12)";
  c.lineWidth = 1;
  c.beginPath();
  for (let y = win.y + win.h * 0.45; y < counter; y += win.h * 0.06) {
    c.moveTo(win.x, y);
    c.lineTo(win.x + win.w, y);
  }
  c.stroke();
  // shelves of jars and copper
  const jars = rng(4);
  [0.24, 0.4].forEach((sv) => {
    const sy = win.y + win.h * sv;
    c.fillStyle = "rgba(90, 50, 20, 0.55)";
    c.fillRect(win.x + win.w * 0.06, sy, win.w * 0.88, win.h * 0.012);
    for (let x = win.x + win.w * 0.08; x < win.x + win.w * 0.9; ) {
      const jw = win.w * (0.03 + jars() * 0.035);
      const jh = win.h * (0.05 + jars() * 0.06);
      const cols = ["rgba(110, 60, 30, 0.55)", "rgba(150, 90, 40, 0.5)", "rgba(80, 100, 70, 0.45)", "rgba(170, 110, 60, 0.5)"];
      c.fillStyle = cols[Math.floor(jars() * cols.length)];
      c.beginPath();
      c.roundRect(x, sy - jh, jw, jh, jw * 0.2);
      c.fill();
      x += jw + win.w * (0.01 + jars() * 0.03);
    }
  });
  // the lamp over the pass, and its pool of light
  const lx = plate.x;
  const ly = win.y + win.h * 0.5;
  c.strokeStyle = "rgba(50, 30, 15, 0.7)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(lx, win.y);
  c.lineTo(lx, ly - win.w * 0.03);
  c.stroke();
  const cone = c.createLinearGradient(0, ly, 0, counter);
  cone.addColorStop(0, "rgba(255, 244, 214, 0.55)");
  cone.addColorStop(1, "rgba(255, 244, 214, 0.08)");
  c.fillStyle = cone;
  c.beginPath();
  c.moveTo(lx - win.w * 0.05, ly);
  c.lineTo(lx + win.w * 0.05, ly);
  c.lineTo(lx + win.w * 0.3, counter);
  c.lineTo(lx - win.w * 0.3, counter);
  c.closePath();
  c.fill();
  c.fillStyle = "#2c3e3f";
  c.beginPath();
  c.moveTo(lx - win.w * 0.025, ly - win.w * 0.035);
  c.lineTo(lx + win.w * 0.025, ly - win.w * 0.035);
  c.lineTo(lx + win.w * 0.06, ly);
  c.lineTo(lx - win.w * 0.06, ly);
  c.closePath();
  c.fill();
  glow(c, lx, ly, win.w * 0.08, "255, 244, 214", 0.9);
  // the pass: a steel counter
  const steel = c.createLinearGradient(0, counter, 0, win.y + win.h);
  steel.addColorStop(0, "#e2ddd3");
  steel.addColorStop(0.08, "#b8b1a4");
  steel.addColorStop(1, "#8f887c");
  c.fillStyle = steel;
  c.fillRect(win.x, counter, win.w, win.y + win.h - counter);
  dish(c, plate.x, plate.y, plate.rx, plate.ry, q, t);
  // the chef's hand, reaching in with tweezers while the plate is being made
  const reach = Math.sin(Math.min(1, Math.max(0, (q - 0.05) / 0.9)) * Math.PI);
  if (reach > 0.01) {
    const hx = win.x + win.w * (1.05 - reach * 0.38) + Math.sin(t * 3) * win.w * 0.004;
    const hy = plate.y - plate.ry * 2.6;
    c.strokeStyle = "#f7f4ee";
    c.lineCap = "round";
    c.lineWidth = win.w * 0.07;
    c.beginPath();
    c.moveTo(win.x + win.w * 1.15, hy - win.h * 0.12);
    c.lineTo(hx + win.w * 0.06, hy - win.h * 0.02);
    c.stroke();
    c.fillStyle = "#b07a58";
    c.beginPath();
    c.ellipse(hx + win.w * 0.02, hy, win.w * 0.03, win.w * 0.022, 0.4, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#9aa1a6";
    c.lineWidth = Math.max(1.5, win.w * 0.004);
    c.beginPath();
    c.moveTo(hx, hy);
    c.lineTo(hx - win.w * 0.06, plate.y - plate.ry * 0.6);
    c.moveTo(hx + win.w * 0.004, hy + win.w * 0.004);
    c.lineTo(hx - win.w * 0.055, plate.y - plate.ry * 0.5);
    c.stroke();
  }
  // reflections on the glass
  c.fillStyle = pal.dark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.14)";
  c.beginPath();
  c.moveTo(win.x + win.w * 0.1, win.y);
  c.lineTo(win.x + win.w * 0.22, win.y);
  c.lineTo(win.x + win.w * 0.02, win.y + win.h);
  c.lineTo(win.x - win.w * 0.1, win.y + win.h);
  c.closePath();
  c.moveTo(win.x + win.w * 0.28, win.y);
  c.lineTo(win.x + win.w * 0.32, win.y);
  c.lineTo(win.x + win.w * 0.12, win.y + win.h);
  c.lineTo(win.x + win.w * 0.08, win.y + win.h);
  c.closePath();
  c.fill();
  c.restore();

  // the transom bar, and the sill
  c.fillStyle = tone.frame;
  c.fillRect(win.x, win.y + win.h * 0.14, win.w, f * 0.7);
  c.fillStyle = tone.sill;
  c.fillRect(win.x - f * 2, win.y + win.h + f, win.w + f * 4, f * 1.2);
  c.fillStyle = "rgba(0, 0, 0, 0.15)";
  c.fillRect(win.x - f * 2, win.y + win.h + f * 2.2, win.w + f * 4, f * 0.8);

  // the awning, striped, scalloped along its edge
  const ay = win.y - f * 1.4;
  const ah = win.h * 0.13;
  const ax = win.x - f * 3;
  const aw = win.w + f * 6;
  const stripes = 9;
  for (let i = 0; i < stripes; i++) {
    c.fillStyle = tone.awning[i % 2];
    const sw = aw / stripes;
    const x0 = ax + sw * i;
    c.beginPath();
    c.rect(x0, ay - ah, sw + 0.5, ah);
    c.moveTo(x0 + sw, ay);
    c.arc(x0 + sw / 2, ay, sw / 2, 0, Math.PI);
    c.fill();
  }
  c.fillStyle = "rgba(0, 0, 0, 0.12)";
  c.fillRect(ax, ay - ah, aw, ah * 0.12);
};
