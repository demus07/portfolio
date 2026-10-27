/*
 * The brushes the body's painted scenes share with the landing: the same morning and night palette,
 * a sky, a sea with its glints, stars, soft glows and puffed clouds, and the film grain on top.
 * Everything is drawn in CSS pixels; the canvas takes care of the device pixel ratio.
 */

export const TAU = Math.PI * 2;

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Pal = {
  dark: boolean;
  sky: string[]; // top to horizon
  sea: [string, string, string];
  glint: string;
  far: string;
  lip: string;
  walk: [string, string];
  face: string;
  glow: string; // the sun's or moon's light, as "r, g, b"
  cloud: [string, string]; // lit, shaded
  lamp: string; // sodium lamps and warm windows, as "r, g, b"
};

// the landing's morning and night, kept in step with MarineDrive's tones
export const PAL: Record<"light" | "dark", Pal> = {
  light: {
    dark: false,
    sky: ["#3a8bd3", "#5ea7e2", "#8fc5ea", "#c2dfee", "#eef4ec"],
    sea: ["#cbe8ea", "#67bacf", "#2a85a8"],
    glint: "255, 255, 255",
    far: "#a7c4d3",
    lip: "#fdfaf3",
    walk: ["#cfcabe", "#eee9de"],
    face: "#a29b8f",
    glow: "255, 247, 222",
    cloud: ["#ffffff", "#c6d6ea"],
    lamp: "255, 214, 150",
  },
  dark: {
    dark: true,
    sky: ["#030a15", "#0a1a2d", "#12304a", "#1d4561", "#35586e"],
    sea: ["#2b4a5e", "#142d3d", "#081620"],
    glint: "214, 226, 236",
    far: "#162a3c",
    lip: "#6a6a64",
    walk: ["#30383f", "#3e454b"],
    face: "#1d242a",
    glow: "190, 210, 230",
    cloud: ["rgba(150, 170, 196, 0.5)", "rgba(36, 54, 76, 0.9)"],
    lamp: "255, 206, 140",
  },
};

export function sky(c: CanvasRenderingContext2D, w: number, y0: number, y1: number, stops: string[]) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  c.fillStyle = g;
  c.fillRect(0, y0, w, y1 - y0);
}

export function glow(c: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${a})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

export function stars(c: CanvasRenderingContext2D, w: number, h: number, n: number, seed: number, t: number) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = Math.pow(r(), 1.4) * h;
    const size = 0.4 + r() * 1.1;
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.4 + r()) + r() * 6));
    c.fillStyle = `rgba(235, 240, 250, ${a * (1 - y / h) * 0.9})`;
    c.fillRect(x, y, size, size);
  }
}

export function moon(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  glow(c, x, y, r * 9, "190, 210, 230", 0.22);
  c.fillStyle = "#f3efe2";
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.fillStyle = "rgba(160, 160, 150, 0.18)";
  c.beginPath();
  c.arc(x - r * 0.3, y - r * 0.2, r * 0.28, 0, TAU);
  c.arc(x + r * 0.35, y + r * 0.3, r * 0.18, 0, TAU);
  c.fill();
}

// a cumulus puff: shaded underside first, the lit crowns over it
export function cloud(c: CanvasRenderingContext2D, x: number, y: number, s: number, pal: Pal, seed: number) {
  const r = rng(seed);
  const puffs = Array.from({ length: 7 }, (_, i) => {
    const u = i / 6 - 0.5;
    return { x: x + u * s * 2.2, y: y - (1 - Math.abs(u) * 1.6) * s * 0.35 - r() * s * 0.15, r: s * (0.32 + (0.5 - Math.abs(u)) * 0.5 + r() * 0.1) };
  });
  c.fillStyle = pal.cloud[1];
  c.beginPath();
  for (const p of puffs) {
    c.moveTo(p.x + p.r, p.y + s * 0.12);
    c.arc(p.x, p.y + s * 0.12, p.r, 0, TAU);
  }
  c.fill();
  c.fillStyle = pal.cloud[0];
  c.beginPath();
  for (const p of puffs) {
    c.moveTo(p.x + p.r * 0.92, p.y - s * 0.02);
    c.arc(p.x, p.y - s * 0.02, p.r * 0.92, 0, TAU);
  }
  c.fill();
}

// the bay: a gradient out to the horizon, and glints that drift and flicker
export function sea(c: CanvasRenderingContext2D, w: number, y0: number, y1: number, pal: Pal, t: number, seed: number) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, pal.sea[0]);
  g.addColorStop(0.45, pal.sea[1]);
  g.addColorStop(1, pal.sea[2]);
  c.fillStyle = g;
  c.fillRect(0, y0, w, y1 - y0);
  const r = rng(seed);
  for (let i = 0; i < 90; i++) {
    const v = Math.pow(r(), 1.6);
    const y = y0 + v * (y1 - y0);
    const len = (4 + r() * 14) * (0.3 + v);
    const x = (((r() * w + t * (6 + r() * 10)) % (w + 40)) + w + 40) % (w + 40) - 20;
    const a = Math.max(0, Math.sin(t * (0.8 + r()) + r() * 6)) * (pal.dark ? 0.35 : 0.6);
    c.fillStyle = `rgba(${pal.glint}, ${a})`;
    c.fillRect(x, y, len, Math.max(1, v * 2));
  }
}

// the moon's road across the water
export function moonPath(c: CanvasRenderingContext2D, x: number, y0: number, y1: number, t: number) {
  const r = rng(5);
  for (let i = 0; i < 70; i++) {
    const v = r();
    const y = y0 + v * (y1 - y0);
    const spread = 6 + v * 60;
    const a = Math.max(0, Math.sin(t * (1 + r()) + r() * 6)) * 0.5;
    c.fillStyle = `rgba(220, 230, 240, ${a})`;
    c.fillRect(x + (r() - 0.5) * spread * 2, y, 6 + v * 26, 1 + v * 1.5);
  }
}

let grainUrl: string | null = null;
export function grain() {
  if (grainUrl) return grainUrl;
  const c = document.createElement("canvas");
  c.width = c.height = 200;
  const g = c.getContext("2d")!;
  const img = g.createImageData(200, 200);
  const r = rng(9);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.round(r() * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 26;
  }
  g.putImageData(img, 0, 0);
  grainUrl = c.toDataURL();
  return grainUrl;
}

// the promenade's tiles, running away from you
export function promenade(c: CanvasRenderingContext2D, w: number, y0: number, h: number, pal: Pal, vx = w / 2) {
  const fg = c.createLinearGradient(0, y0, 0, h);
  fg.addColorStop(0, pal.walk[0]);
  fg.addColorStop(1, pal.walk[1]);
  c.fillStyle = fg;
  c.fillRect(0, y0, w, h - y0);
  c.fillStyle = pal.lip;
  c.fillRect(0, y0, w, Math.max(3, (h - y0) * 0.02));
  c.strokeStyle = pal.dark ? "rgba(0, 0, 0, 0.25)" : "rgba(60, 50, 40, 0.09)";
  c.lineWidth = 1;
  c.beginPath();
  for (let k = 1; k < 9; k++) {
    const y = y0 + (h - y0) * (k / 9) ** 1.7;
    c.moveTo(0, y);
    c.lineTo(w, y);
  }
  for (let k = -14; k <= 14; k++) {
    c.moveTo(vx + k * w * 0.02, y0);
    c.lineTo(vx + k * w * 0.16, h);
  }
  c.stroke();
}

// the sea wall seen square on: a worn top, then its face falling away below, in blocks
export function parapet(c: CanvasRenderingContext2D, w: number, top: number, lip: number, h: number, pal: Pal, block = 180) {
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
  for (let x = (w % block) / 2; x < w; x += block) {
    c.moveTo(x, top + lip);
    c.lineTo(x, h);
  }
  c.moveTo(0, top + lip + (h - top - lip) * 0.5);
  c.lineTo(w, top + lip + (h - top - lip) * 0.5);
  c.stroke();
  const r = rng(8);
  for (let i = 0; i < 40; i++) {
    c.fillStyle = pal.dark ? "rgba(0, 0, 0, 0.12)" : "rgba(80, 70, 55, 0.06)";
    c.beginPath();
    c.ellipse(r() * w, top + r() * lip, 6 + r() * 30, 1 + r() * 3, 0, 0, TAU);
    c.fill();
  }
}

// a promenade lamp: a tall pole, an arm out over the walk, and its light when it is on (0 to 1)
export function lampPost(c: CanvasRenderingContext2D, x: number, base: number, ht: number, pal: Pal, on: number) {
  const pole = pal.dark ? "#10161c" : "#46535a";
  c.strokeStyle = pole;
  c.lineCap = "round";
  c.lineWidth = Math.max(2, ht * 0.022);
  c.beginPath();
  c.moveTo(x, base);
  c.lineTo(x, base - ht);
  c.quadraticCurveTo(x, base - ht * 1.06, x + ht * 0.12, base - ht * 1.05);
  c.stroke();
  const hx = x + ht * 0.13;
  const hy = base - ht * 1.04;
  if (on > 0) {
    glow(c, hx, hy, ht * 0.5, pal.lamp, 0.55 * on);
    const g = c.createLinearGradient(0, hy, 0, base);
    g.addColorStop(0, `rgba(${pal.lamp}, ${0.22 * on})`);
    g.addColorStop(1, `rgba(${pal.lamp}, 0)`);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(hx - ht * 0.03, hy);
    c.lineTo(hx + ht * 0.03, hy);
    c.lineTo(hx + ht * 0.3, base);
    c.lineTo(hx - ht * 0.3, base);
    c.closePath();
    c.fill();
  }
  c.fillStyle = on > 0.5 ? `rgb(${pal.lamp})` : pole;
  c.beginPath();
  c.ellipse(hx, hy, ht * 0.05, ht * 0.018, 0, 0, TAU);
  c.fill();
}

const DECO = {
  light: [
    ["#f1e6cf", "#d8c6a5"],
    ["#ecd9c4", "#cfb59a"],
    ["#e6e0d2", "#c4bba9"],
    ["#f0d9b8", "#d2b48c"],
  ],
  dark: [
    ["#202c38", "#151e27"],
    ["#232e3a", "#17202a"],
    ["#1e2933", "#141c24"],
    ["#26303a", "#182029"],
  ],
};

// an Art Deco block of the kind that lines Marine Drive: rounded corner, speed lines, fins and a crown
export function deco(c: CanvasRenderingContext2D, x: number, base: number, bw: number, bh: number, pal: Pal, seed: number) {
  const r = rng(seed);
  const [face, side] = DECO[pal.dark ? "dark" : "light"][seed % 4];
  const corner = bw * 0.12;
  c.fillStyle = face;
  c.beginPath();
  c.moveTo(x, base);
  c.lineTo(x, base - bh + corner);
  c.quadraticCurveTo(x, base - bh, x + corner, base - bh);
  c.lineTo(x + bw, base - bh);
  c.lineTo(x + bw, base);
  c.closePath();
  c.fill();
  // the shaded rounded corner
  c.fillStyle = side;
  c.fillRect(x, base - bh + corner, corner * 0.8, bh - corner);
  // a stepped crown over the middle
  const cw = bw * 0.28;
  const cx = x + bw * (0.45 + r() * 0.2);
  c.fillStyle = face;
  c.fillRect(cx - cw / 2, base - bh - bh * 0.05, cw, bh * 0.05);
  c.fillRect(cx - cw / 4, base - bh - bh * 0.09, cw / 2, bh * 0.05);
  c.fillStyle = side;
  c.fillRect(cx - 1, base - bh - bh * 0.16, 2, bh * 0.08);
  // floors: speed lines and windows, some lit at night
  const floors = Math.max(4, Math.round(bh / 34));
  const fh = bh / floors;
  for (let f = 0; f < floors; f++) {
    const fy = base - bh + f * fh;
    c.fillStyle = "rgba(0, 0, 0, 0.06)";
    c.fillRect(x + corner * 0.8, fy + fh * 0.82, bw - corner * 0.8, Math.max(1, fh * 0.05));
    const cols = Math.max(3, Math.round(bw / 30));
    for (let k = 0; k < cols; k++) {
      const wx = x + corner + ((bw - corner * 1.4) / cols) * k + 4;
      const ww = (bw - corner * 1.4) / cols - 8;
      const lit = pal.dark && r() < 0.42;
      c.fillStyle = lit ? `rgba(${pal.lamp}, ${0.6 + r() * 0.35})` : pal.dark ? "#0e151c" : "rgba(80, 110, 130, 0.45)";
      c.fillRect(wx, fy + fh * 0.25, ww, fh * 0.45);
    }
  }
  // balconies' curved ends, the Marine Drive signature
  c.strokeStyle = side;
  c.lineWidth = Math.max(1.5, fh * 0.08);
  for (let f = 1; f < floors; f += 2) {
    const fy = base - bh + f * fh + fh * 0.8;
    c.beginPath();
    c.moveTo(x + corner, fy);
    c.lineTo(x + bw * 0.45, fy);
    c.stroke();
  }
}

// someone running, side on, facing right; phase turns the stride
export function runner(c: CanvasRenderingContext2D, x: number, y: number, s: number, phase: number, pal: Pal) {
  const skin = pal.dark ? "#5a4236" : "#b98463";
  const shirt = pal.dark ? "#2f585b" : "#3c6e71";
  const shorts = pal.dark ? "#11161f" : "#2b3646";
  const shoe = pal.dark ? "#6a7078" : "#f3f0e8";
  const sw = Math.sin(phase);
  const hip = { x, y: y - s * 0.5 + Math.abs(Math.cos(phase)) * s * 0.02 };
  const sh = { x: x + s * 0.06, y: hip.y - s * 0.32 };
  c.lineCap = "round";
  c.lineJoin = "round";
  const limb = (ax: number, ay: number, a1: number, a2: number, l1: number, l2: number, col: string, width: number) => {
    const kx = ax + Math.sin(a1) * l1;
    const ky = ay + Math.cos(a1) * l1;
    const fx = kx + Math.sin(a2) * l2;
    const fy = ky + Math.cos(a2) * l2;
    c.strokeStyle = col;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(ax, ay);
    c.lineTo(kx, ky);
    c.lineTo(fx, fy);
    c.stroke();
    return { fx, fy };
  };
  // far leg and arm first, a shade darker
  const back = limb(hip.x, hip.y, -sw * 0.7, -sw * 0.7 - 0.9 - Math.max(0, sw) * 0.6, s * 0.25, s * 0.25, skin, s * 0.06);
  c.fillStyle = shoe;
  c.beginPath();
  c.ellipse(back.fx + s * 0.03, back.fy, s * 0.05, s * 0.025, 0, 0, TAU);
  c.fill();
  limb(sh.x, sh.y, sw * 0.9, sw * 0.9 + 1.4, s * 0.15, s * 0.14, skin, s * 0.045);
  // torso and shorts
  c.strokeStyle = shirt;
  c.lineWidth = s * 0.14;
  c.beginPath();
  c.moveTo(hip.x, hip.y - s * 0.06);
  c.lineTo(sh.x, sh.y);
  c.stroke();
  c.strokeStyle = shorts;
  c.lineWidth = s * 0.13;
  c.beginPath();
  c.moveTo(hip.x - s * 0.01, hip.y - s * 0.04);
  c.lineTo(hip.x, hip.y + s * 0.03);
  c.stroke();
  // near leg and arm
  const front = limb(hip.x, hip.y, sw * 0.7, sw * 0.7 - 0.9 - Math.max(0, -sw) * 0.6, s * 0.25, s * 0.25, skin, s * 0.065);
  c.fillStyle = shoe;
  c.beginPath();
  c.ellipse(front.fx + s * 0.03, front.fy, s * 0.055, s * 0.027, 0, 0, TAU);
  c.fill();
  limb(sh.x, sh.y, -sw * 0.9, -sw * 0.9 + 1.4, s * 0.15, s * 0.14, skin, s * 0.05);
  // head
  c.fillStyle = skin;
  c.beginPath();
  c.arc(sh.x + s * 0.03, sh.y - s * 0.1, s * 0.075, 0, TAU);
  c.fill();
  c.fillStyle = pal.dark ? "#0d0b0a" : "#1a1512";
  c.beginPath();
  c.arc(sh.x + s * 0.015, sh.y - s * 0.125, s * 0.07, Math.PI * 0.9, Math.PI * 2.05);
  c.fill();
}
