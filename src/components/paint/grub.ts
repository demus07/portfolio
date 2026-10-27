import { glow, rng, type Pal } from "./lib";
import { paintBay } from "./sneaker";
import type { Paint } from "./Painted";

/*
 * Close up on the sea wall: a laptop open on the parapet with a cutting chai beside it, the bay
 * behind, the Queen's Necklace lit along the far shore at night. The screen is left dark; the
 * terminal is laid over it in HTML so its text stays sharp and readable.
 */

export function grubLayout(w: number, h: number) {
  const narrow = w < 760;
  const lw = narrow ? w * 0.86 : Math.min(w * 0.46, h * 0.98);
  const cx = narrow ? w * 0.5 : w * 0.63;
  const ledge = narrow ? h * 0.7 : h * 0.74;
  const base = ledge + h * 0.045;
  const lidH = lw * 0.64;
  const bezel = lw * 0.03;
  return {
    narrow,
    lw,
    cx,
    ledge,
    base,
    lidH,
    horizon: narrow ? h * 0.54 : h * 0.52,
    screen: { x: cx - lw / 2 + bezel, y: base - lidH + bezel, w: lw - bezel * 2, h: lidH - bezel * 2.3 },
    // the face of the sea wall, below its top, where the distros are cut into the stone
    face: { y: ledge + h * 0.09, h: h - ledge - h * 0.09 },
  };
}

const BODY = { light: ["#d4d9de", "#aab1b8", "#e8ebee"], dark: ["#2c333a", "#1a1f24", "#3a434b"] };

function chai(c: CanvasRenderingContext2D, x: number, y: number, s: number, pal: Pal, t: number) {
  // the glass: narrow at the foot, flared at the lip, two thirds full of tea
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.4)" : "rgba(40, 40, 30, 0.18)";
  c.beginPath();
  c.ellipse(x + s * 0.1, y + s * 0.02, s * 0.5, s * 0.07, 0, 0, Math.PI * 2);
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
  // the ridges of a cutting glass
  c.strokeStyle = "rgba(255, 255, 255, 0.25)";
  c.lineWidth = Math.max(1, s * 0.03);
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(x + i * s * 0.1, y);
    c.lineTo(x + i * s * 0.13, y - s);
    c.stroke();
  }
  c.restore();
  c.strokeStyle = pal.dark ? "rgba(220, 230, 240, 0.35)" : "rgba(255, 255, 255, 0.9)";
  c.lineWidth = Math.max(1, s * 0.035);
  c.beginPath();
  c.moveTo(x - s * 0.4, y - s);
  c.lineTo(x + s * 0.4, y - s);
  c.stroke();
  // steam
  c.strokeStyle = pal.dark ? "rgba(220, 230, 240, 0.18)" : "rgba(255, 255, 255, 0.55)";
  c.lineWidth = Math.max(1.5, s * 0.06);
  c.lineCap = "round";
  for (let k = 0; k < 2; k++) {
    const ph = t * 0.9 + k * 2.1;
    const rise = (ph % 3) / 3;
    c.globalAlpha = Math.sin(rise * Math.PI);
    c.beginPath();
    const sx = x + (k - 0.5) * s * 0.3;
    c.moveTo(sx, y - s * 1.1 - rise * s * 0.4);
    c.bezierCurveTo(sx + s * 0.25, y - s * 1.4 - rise * s * 0.4, sx - s * 0.25, y - s * 1.7 - rise * s * 0.4, sx + s * 0.05, y - s * 2 - rise * s * 0.4);
    c.stroke();
  }
  c.globalAlpha = 1;
}

export const paintGrub: Paint = (c, w, h, { pal, t }) => {
  const L = grubLayout(w, h);
  paintBay(c, w, h, L.horizon, L.ledge, pal, t);

  // the Queen's Necklace: lamps strung round the far curve of the bay
  if (pal.dark) {
    const r = rng(17);
    for (let i = 0; i < 70; i++) {
      const f = i / 69;
      const x = f * w * 0.5;
      const y = L.horizon - 2 + Math.sin(f * Math.PI) * -4 + f * 3;
      const a = 0.6 + 0.4 * Math.sin(t * 2 + r() * 6);
      c.fillStyle = `rgba(${pal.lamp}, ${a})`;
      c.fillRect(x, y, 2, 2);
    }
    glow(c, w * 0.25, L.horizon, w * 0.3, pal.lamp, 0.08);
  }

  // the parapet: its worn top, then its face falling away below
  const top = L.ledge;
  const lip = h * 0.09;
  const tg = c.createLinearGradient(0, top, 0, top + lip);
  tg.addColorStop(0, pal.dark ? "#48505a" : "#d9d3c6");
  tg.addColorStop(1, pal.dark ? "#363d45" : "#c7c0b2");
  c.fillStyle = tg;
  c.fillRect(0, top, w, lip);
  c.fillStyle = pal.dark ? "#1a1f25" : "#a49d90";
  c.fillRect(0, top + lip, w, h - top - lip);
  c.strokeStyle = pal.dark ? "rgba(0, 0, 0, 0.35)" : "rgba(60, 50, 40, 0.14)";
  c.lineWidth = 1;
  c.beginPath();
  for (let x = (w % 180) / 2; x < w; x += 180) {
    c.moveTo(x, top + lip);
    c.lineTo(x, h);
  }
  c.moveTo(0, top + lip + (h - top - lip) * 0.5);
  c.lineTo(w, top + lip + (h - top - lip) * 0.5);
  c.stroke();
  // weathering on the stone
  const r = rng(8);
  for (let i = 0; i < 40; i++) {
    c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.12)" : "rgba(80, 70, 55, 0.06)";
    c.beginPath();
    c.ellipse(r() * w, top + r() * lip, 6 + r() * 30, 1 + r() * 3, 0, 0, Math.PI * 2);
    c.fill();
  }

  // the screen's light on the stone, at night
  if (pal.dark) glow(c, L.cx, L.base, L.lw * 0.9, "120, 190, 255", 0.16);

  // the laptop
  const body = BODY[pal.dark ? "dark" : "light"];
  const x0 = L.cx - L.lw / 2;
  const deck = L.lw * 0.045;
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.5)" : "rgba(40, 40, 30, 0.22)";
  c.beginPath();
  c.ellipse(L.cx, L.base + deck * 1.1, L.lw * 0.6, deck * 0.7, 0, 0, Math.PI * 2);
  c.fill();
  // the keyboard deck, seen from just above
  c.fillStyle = body[0];
  c.beginPath();
  c.moveTo(x0, L.base);
  c.lineTo(x0 + L.lw, L.base);
  c.lineTo(x0 + L.lw * 1.06, L.base + deck);
  c.lineTo(x0 - L.lw * 0.06, L.base + deck);
  c.closePath();
  c.fill();
  c.fillStyle = body[1];
  c.fillRect(x0 - L.lw * 0.06, L.base + deck, L.lw * 1.12, deck * 0.28);
  // the lid
  c.fillStyle = body[1];
  c.beginPath();
  c.roundRect(x0, L.base - L.lidH, L.lw, L.lidH, L.lw * 0.022);
  c.fill();
  c.fillStyle = "#0c1014";
  c.beginPath();
  c.roundRect(L.screen.x, L.screen.y, L.screen.w, L.screen.h, L.lw * 0.006);
  c.fill();
  c.fillStyle = body[2];
  c.fillRect(x0 + L.lw * 0.02, L.base - L.lw * 0.012, L.lw * 0.96, L.lw * 0.012);

  // the chai, a little in front and to one side
  const s = L.lw * 0.11;
  chai(c, L.narrow ? L.cx - L.lw * 0.36 : x0 - s * 1.4, L.narrow ? L.base + deck + s * 0.9 : L.base + deck * 0.6, s, pal, t);
};
