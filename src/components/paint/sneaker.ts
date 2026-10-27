import { cloud, glow, moon, moonPath, rng, sea, sky, stars, type Pal } from "./lib";
import type { Paint } from "./Painted";

/*
 * A running shoe on the promenade at Marine Drive, sea and sky behind it. At the start of the
 * scroll it is the perfect pair from the photo; as you scroll the upper lifts off the sole at the
 * toe, the glue strings stretch and snap, and a crack runs back through the midsole.
 * The shoe is drawn in units of its own length, heel at u = 0, toe at u = 1, ground at v = 0.
 */

type ShoeTone = {
  upper: string;
  shade: string;
  stripe: string;
  accent: string;
  mid: string;
  midShade: string;
  out: string;
  lace: string;
  inner: string;
  rim: string | null;
};

const SHOE: Record<"light" | "dark", ShoeTone> = {
  light: {
    upper: "#f6f3ec",
    shade: "#d8d2c5",
    stripe: "#284b63",
    accent: "#3c6e71",
    mid: "#fdfaf4",
    midShade: "#e2dccf",
    out: "#353535",
    lace: "#ffffff",
    inner: "#2a2622",
    rim: null,
  },
  dark: {
    upper: "#a3abb4",
    shade: "#6c7580",
    stripe: "#1d3a50",
    accent: "#2c5658",
    mid: "#b9bec4",
    midShade: "#868c94",
    out: "#121518",
    lace: "#cdd3d9",
    inner: "#06080a",
    rim: "rgba(225, 235, 245, 0.45)",
  },
};

// the sole's lines: the ground, the top of the outsole, and the top of the midsole (where the upper is glued)
// all three meet in a rounded point at the toe, which springs up off the ground
const TIP = 1.015;
const TIP_V = -0.1;
const toe = (u: number) => Math.min(1, Math.max(0, (u - 0.84) / (TIP - 0.84)) ** 2);
const ground = (u: number) => TIP_V * toe(u) * 0.85 - (u < 0.05 ? ((0.05 - u) / 0.05) ** 2 * 0.02 : 0);
const outTop = (u: number) => ground(u) - 0.022 * (1 - toe(u)) ** 0.7;
const midTop = (u: number) => (-0.1 + 0.035 * u) * (1 - toe(u)) + TIP_V * toe(u) - 0.012 * Math.sin(Math.PI * toe(u));

// how far the upper has pulled off the sole at u: nothing at the heel, most at the toe
const liftAt = (u: number, peel: number) => peel * 0.08 * Math.max(0, (u - 0.4) / 0.6) ** 1.8;
const END = TIP;

let buffer: HTMLCanvasElement | null = null;

function shoe(c: CanvasRenderingContext2D, x0: number, y0: number, L: number, peel: number, tone: ShoeTone, t: number) {
  const X = (u: number) => x0 + u * L;
  const Y = (v: number) => y0 + v * L;
  const steps = 60;
  const along = (f: (u: number) => number, from = 0, to = END) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const u = from + ((to - from) * i) / steps;
      return [u, f(u)] as const;
    });
  const trace = (ctx: CanvasRenderingContext2D | Path2D, pts: (readonly [number, number])[], join = false) =>
    pts.forEach(([u, v], i) => (i || join ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v))));

  // outsole, with a little tread
  c.fillStyle = tone.out;
  c.beginPath();
  trace(c, along(ground));
  trace(c, along(outTop).reverse(), true);
  c.closePath();
  c.fill();

  // midsole
  const mg = c.createLinearGradient(0, Y(-0.1), 0, Y(-0.02));
  mg.addColorStop(0, tone.mid);
  mg.addColorStop(1, tone.midShade);
  c.fillStyle = mg;
  c.beginPath();
  trace(c, along(outTop));
  trace(c, along(midTop).reverse(), true);
  c.closePath();
  c.fill();
  // the moulded line along the midsole
  c.strokeStyle = "rgba(0, 0, 0, 0.08)";
  c.lineWidth = L * 0.0025;
  c.beginPath();
  trace(c, along((u) => (midTop(u) + outTop(u)) / 2 + 0.008, 0.06, 0.9));
  c.stroke();

  // the crack, running back from the toe as the sole gives
  if (peel > 0.2) {
    const r = rng(3);
    const reach = 1 - (peel - 0.2) * 0.5;
    c.strokeStyle = tone.inner;
    c.lineWidth = L * 0.0028;
    c.beginPath();
    for (let u = 0.985; u >= reach; u -= 0.016) {
      const v = (midTop(u) + outTop(u)) / 2 + (r() - 0.5) * 0.014;
      if (u > 0.98) c.moveTo(X(u), Y(v));
      else c.lineTo(X(u), Y(v));
    }
    c.stroke();
  }

  // the mouth that opens at the toe, and the glue strings across it
  if (peel > 0) {
    c.fillStyle = tone.inner;
    c.beginPath();
    trace(c, along(midTop, 0.4));
    trace(c, along((u) => midTop(u) - liftAt(u, peel), 0.4).reverse(), true);
    c.closePath();
    c.fill();
    [0.62, 0.74, 0.84, 0.93].forEach((u, i) => {
      const snap = 0.35 + i * 0.14;
      const sy = Y(midTop(u));
      const ly = sy - liftAt(u, peel) * L;
      const sx = X(u);
      c.strokeStyle = "rgba(236, 226, 196, 0.7)";
      c.lineWidth = L * 0.0016;
      c.beginPath();
      if (peel < snap) {
        c.moveTo(sx, sy);
        c.quadraticCurveTo(sx + L * 0.006, (sy + ly) / 2, sx, ly);
      } else {
        const k = 0.2 + Math.min(1, (peel - snap) * 5) * 0.15;
        c.moveTo(sx, sy);
        c.quadraticCurveTo(sx + L * 0.004, sy - (sy - ly) * k * 0.5, sx + L * 0.006, sy - (sy - ly) * k);
        c.moveTo(sx, ly);
        c.quadraticCurveTo(sx - L * 0.004, ly + (sy - ly) * k * 0.5, sx - L * 0.005, ly + (sy - ly) * k);
      }
      c.stroke();
    });
  }

  // the upper is painted flat into a buffer, then laid on in thin slices, each lifted by how far
  // that part of it has pulled off the sole; so it bends at the toe instead of tipping over
  const k = c.getTransform().a;
  const bx = x0 - L * 0.04;
  const by = y0 - L * 0.48;
  const bw = Math.ceil(L * 1.1 * k);
  const bh = Math.ceil(L * 0.5 * k);
  buffer ??= document.createElement("canvas");
  if (buffer.width !== bw || buffer.height !== bh) {
    buffer.width = bw;
    buffer.height = bh;
  }
  const b = buffer.getContext("2d")!;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, bw, bh);
  b.setTransform(k, 0, 0, k, -bx * k, -by * k);
  upper(b, X, Y, L, tone, t, along, trace);
  const slice = Math.max(2, Math.round(k * 3));
  for (let sx = 0; sx < bw; sx += slice) {
    const dx = bx + sx / k;
    const lift = liftAt((dx - x0) / L, peel) * L;
    c.drawImage(buffer, sx, 0, slice, bh, dx, by - lift, slice / k + 0.4, bh / k);
  }
}

type Along = (f: (u: number) => number, from?: number, to?: number) => (readonly [number, number])[];
type Trace = (ctx: CanvasRenderingContext2D | Path2D, pts: (readonly [number, number])[], join?: boolean) => void;

function upper(c: CanvasRenderingContext2D, X: (u: number) => number, Y: (v: number) => number, L: number, tone: ShoeTone, t: number, along: Along, trace: Trace) {
  const shape = new Path2D();
  shape.moveTo(X(0.004), Y(midTop(0.004)));
  shape.bezierCurveTo(X(-0.02), Y(-0.19), X(-0.006), Y(-0.3), X(0.045), Y(-0.335));
  shape.bezierCurveTo(X(0.08), Y(-0.355), X(0.13), Y(-0.3), X(0.19), Y(-0.302));
  shape.quadraticCurveTo(X(0.25), Y(-0.37), X(0.295), Y(-0.405));
  shape.quadraticCurveTo(X(0.33), Y(-0.415), X(0.34), Y(-0.385));
  shape.bezierCurveTo(X(0.45), Y(-0.33), X(0.55), Y(-0.29), X(0.66), Y(-0.245));
  shape.bezierCurveTo(X(0.8), Y(-0.2), X(0.93), Y(-0.17), X(0.985), Y(-0.135));
  shape.quadraticCurveTo(X(1.015), Y(-0.118), X(TIP), Y(TIP_V));
  trace(shape, along(midTop).reverse(), true);
  shape.closePath();

  const ug = c.createLinearGradient(0, Y(-0.41), 0, Y(-0.07));
  ug.addColorStop(0, tone.upper);
  ug.addColorStop(1, tone.shade);
  c.fillStyle = ug;
  c.fill(shape);

  c.save();
  c.clip(shape);
  // mesh panel shading over the toe, and the heel counter
  c.fillStyle = "rgba(0, 0, 0, 0.055)";
  c.beginPath();
  c.ellipse(X(1.0), Y(-0.07), L * 0.2, L * 0.12, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = tone.accent;
  c.beginPath();
  c.moveTo(X(-0.05), Y(-0.36));
  c.bezierCurveTo(X(0.09), Y(-0.33), X(0.12), Y(-0.17), X(0.08), Y(-0.05));
  c.lineTo(X(-0.05), Y(-0.05));
  c.closePath();
  c.fill();
  // the stripe down the side
  c.fillStyle = tone.stripe;
  c.beginPath();
  c.moveTo(X(0.17), Y(-0.12));
  c.bezierCurveTo(X(0.38), Y(-0.115), X(0.6), Y(-0.17), X(0.78), Y(-0.27));
  c.bezierCurveTo(X(0.62), Y(-0.2), X(0.42), Y(-0.165), X(0.24), Y(-0.168));
  c.closePath();
  c.fill();
  // stitching round the toe and along the base of the upper
  c.strokeStyle = "rgba(0, 0, 0, 0.22)";
  c.lineWidth = L * 0.0022;
  c.setLineDash([L * 0.008, L * 0.007]);
  c.beginPath();
  c.ellipse(X(1.0), Y(-0.07), L * 0.185, L * 0.105, 0, Math.PI * 0.95, Math.PI * 1.5);
  c.stroke();
  c.beginPath();
  trace(c, along((u) => midTop(u) - 0.016, 0.06, 0.97));
  c.stroke();
  c.setLineDash([]);
  c.restore();

  // the collar's opening, padded, and the tongue standing over it
  c.save();
  c.clip(shape);
  c.fillStyle = tone.inner;
  c.beginPath();
  c.moveTo(X(0.05), Y(-0.33));
  c.bezierCurveTo(X(0.09), Y(-0.345), X(0.14), Y(-0.3), X(0.2), Y(-0.302));
  c.bezierCurveTo(X(0.15), Y(-0.29), X(0.09), Y(-0.3), X(0.05), Y(-0.33));
  c.fill();
  c.restore();

  // eyestay and laces
  c.lineCap = "round";
  c.strokeStyle = tone.accent;
  c.lineWidth = L * 0.024;
  c.beginPath();
  c.moveTo(X(0.31), Y(-0.37));
  c.bezierCurveTo(X(0.42), Y(-0.33), X(0.52), Y(-0.29), X(0.62), Y(-0.257));
  c.stroke();
  c.strokeStyle = tone.lace;
  c.lineWidth = L * 0.009;
  for (let i = 0; i < 6; i++) {
    const u = 0.325 + i * 0.056;
    const v = -0.368 + i * 0.022;
    c.beginPath();
    c.moveTo(X(u - 0.02), Y(v - 0.018));
    c.lineTo(X(u + 0.022), Y(v + 0.012));
    c.stroke();
  }
  // a loose lace end, swaying a little
  const sway = Math.sin(t * 1.3);
  c.beginPath();
  c.moveTo(X(0.33), Y(-0.375));
  c.quadraticCurveTo(X(0.28 + sway * 0.006), Y(-0.32), X(0.295 + sway * 0.01), Y(-0.245));
  c.stroke();

  // moonlight along the top edge
  if (tone.rim) {
    c.strokeStyle = tone.rim;
    c.lineWidth = L * 0.004;
    c.beginPath();
    c.moveTo(X(0.34), Y(-0.385));
    c.bezierCurveTo(X(0.45), Y(-0.33), X(0.55), Y(-0.29), X(0.66), Y(-0.245));
    c.bezierCurveTo(X(0.8), Y(-0.2), X(0.92), Y(-0.17), X(0.975), Y(-0.125));
    c.stroke();
  }
}

// where the shoe stands, shared with the words laid over the scene
export function sneakerLayout(w: number, h: number) {
  const narrow = w < 760;
  const L = narrow ? w * 0.9 : Math.min(w * 0.5, h * 0.98);
  return { L, x0: narrow ? w / 2 - L * 0.48 : w * 0.58 - L * 0.46, y0: narrow ? h * 0.8 : h * 0.86, horizon: narrow ? h * 0.5 : h * 0.44 };
}

export const paintSneaker: Paint = (c, w, h, { pal, t, p }) => {
  const { L, x0, y0, horizon } = sneakerLayout(w, h);
  const wall = horizon + (h - horizon) * 0.22;
  paintBay(c, w, h, horizon, wall, pal, t);

  // the promenade, tiled, running away from you
  const fg = c.createLinearGradient(0, wall, 0, h);
  fg.addColorStop(0, pal.walk[0]);
  fg.addColorStop(1, pal.walk[1]);
  c.fillStyle = fg;
  c.fillRect(0, wall, w, h - wall);
  c.fillStyle = pal.lip;
  c.fillRect(0, wall, w, Math.max(3, h * 0.008));
  c.strokeStyle = pal.dark ? "rgba(0, 0, 0, 0.25)" : "rgba(60, 50, 40, 0.09)";
  c.lineWidth = 1;
  c.beginPath();
  for (let k = 1; k < 9; k++) {
    const y = wall + (h - wall) * (k / 9) ** 1.7;
    c.moveTo(0, y);
    c.lineTo(w, y);
  }
  for (let k = -12; k <= 12; k++) {
    c.moveTo(w / 2 + k * w * 0.02, wall);
    c.lineTo(w / 2 + k * w * 0.16, h);
  }
  c.stroke();
  if (pal.dark) glow(c, w * 0.12, wall, w * 0.4, pal.lamp, 0.12);

  // the shadow it stands in, then the shoe
  c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.45)" : "rgba(40, 40, 30, 0.2)";
  c.beginPath();
  c.ellipse(x0 + L * 0.5, y0 + L * 0.004, L * 0.54, L * 0.032, 0, 0, Math.PI * 2);
  c.fill();
  const peel = Math.min(1, Math.max(0, (p - 0.2) / 0.55));
  shoe(c, x0, y0, L, peel, SHOE[pal.dark ? "dark" : "light"], t);
};

// sky, the far shore and the bay, by day or by night
export function paintBay(c: CanvasRenderingContext2D, w: number, h: number, horizon: number, shore: number, pal: Pal, t: number, moonX = 0.8) {
  sky(c, w, 0, horizon, pal.sky);
  if (pal.dark) {
    stars(c, w, horizon * 0.95, 260, 11, t);
    moon(c, w * moonX, h * 0.14, Math.min(w, h) * 0.022);
  } else {
    glow(c, w * 0.08, -h * 0.08, w * 0.7, pal.glow, 0.85);
    const drift = (t * 4) % (w + 400);
    cloud(c, ((w * 0.72 + drift) % (w + 400)) - 200, horizon * 0.36, Math.min(w, h) * 0.07, pal, 4);
    cloud(c, ((w * 0.2 + drift * 0.6) % (w + 400)) - 200, horizon * 0.62, Math.min(w, h) * 0.045, pal, 7);
  }
  // the city across the bay, low on the horizon
  const r = rng(21);
  c.fillStyle = pal.far;
  for (let x = 0; x < w * 0.42; ) {
    const bw = 8 + r() * 26;
    const bh = (4 + r() * 18) * (1 - x / (w * 0.5));
    c.fillRect(x, horizon - bh, bw, bh + 1);
    if (pal.dark && r() > 0.4) {
      c.fillStyle = `rgba(${pal.lamp}, 0.7)`;
      c.fillRect(x + bw * 0.3, horizon - bh * 0.6, 1.5, 1.5);
      c.fillStyle = pal.far;
    }
    x += bw + r() * 4;
  }
  sea(c, w, horizon, shore, pal, t, 13);
  if (pal.dark) moonPath(c, w * moonX, horizon, shore, t);
}
