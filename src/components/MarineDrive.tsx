"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

/*
 * Marine Drive, painted in code after a photograph from the promenade: the sea wall running out to
 * the horizon, tetrapods piled against the bay, the towers at Nariman Point, the Queen's Necklace of
 * lamps, and someone sitting on the wall with a laptop.
 * Everything is laid out in a 16:10 picture (fractions u, v) and cropped to cover the screen.
 * Static parts are painted once per resize; the sea, clouds, lamps, traffic and the laptop screen
 * animate on top. Two depth layers (sky, city) let the camera push in on scroll.
 */

type Pt = { x: number; y: number };
export type Variant = "morning" | "dusk" | "night";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

// The picture, in fractions of a 16:10 frame.
const ASPECT = 1.6;
const HZ = 0.535; // the horizon
const VP: Pt = { x: 0.47, y: HZ }; // where the promenade runs out of sight
const WALK_IN: Pt = { x: -0.02, y: 0.628 }; // the walkway's road-side edge, where it leaves the frame
const WALK_OUT: Pt = { x: 0.295, y: 1 }; // its sea-side edge
const ROAD_FAR: Pt = { x: -0.02, y: 0.574 }; // the far kerb, where the trees stand
const LANES: Pt[] = [
  { x: -0.02, y: 0.589 },
  { x: -0.02, y: 0.613 },
];
const SHORE: Pt[] = [
  { x: 0.478, y: HZ },
  { x: 0.66, y: 0.64 },
  { x: 1.1, y: 1.0 },
]; // where the tetrapods meet the water
const ME_V = 0.71; // how far down the wall I sit

const toward = (near: Pt, d: number): Pt => ({
  x: VP.x + (near.x - VP.x) * d,
  y: VP.y + (near.y - VP.y) * d,
});
const atV = (near: Pt, v: number) => VP.x + (near.x - VP.x) * ((v - HZ) / (near.y - HZ));

function onShore(t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * SHORE[0].x + 2 * u * t * SHORE[1].x + t * t * SHORE[2].x,
    y: u * u * SHORE[0].y + 2 * u * t * SHORE[1].y + t * t * SHORE[2].y,
  };
}
function shoreAt(v: number) {
  if (v >= SHORE[2].y) return SHORE[2].x + (v - SHORE[2].y) * 1.4;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (onShore(mid).y < v) lo = mid;
    else hi = mid;
  }
  return onShore(lo).x;
}

type Look = { shirt: string; skin: string; hair: string; pants: string; shoes: string };

type Tone = {
  day: boolean;
  night: boolean;
  sky: [string, string, string, string, string]; // top to horizon
  light: { x: number; y: number; r: number; a: number; rgb: string }; // the sun's or moon's glow
  disc: { x: number; y: number; r: number; color: string } | null;
  side: number; // which side things are lit from: −1 left, +1 right
  cloud: { shade: [string, string]; lit: [string, string]; dx: number; dy: number };
  banks: { x: number; base: number; w: number; h: number }[];
  sea: [string, string, string];
  glint: string;
  path: number | null; // where the sun or moon lays a path on the water
  haze: string;
  towers: [string, string][]; // lit face, shaded face
  lows: string[];
  glass: [string, string];
  windows: number; // share of windows lit
  far: string;
  tree: [string, string, string];
  palm: [string, string, string];
  road: string;
  walk: [string, string];
  lip: string;
  face: string;
  pod: [string, string, string];
  pole: string;
  crowd: string[];
  people: Omit<Look, "shirt">;
  me: Look & { laptop: string; screen: string };
  stars: number;
};

const TONES: Record<Variant, Tone> = {
  morning: {
    day: true,
    night: false,
    sky: ["#3a8bd3", "#5ea7e2", "#8fc5ea", "#c2dfee", "#eef4ec"],
    light: { x: 0.04, y: -0.06, r: 0.75, a: 0.85, rgb: "255, 247, 222" },
    disc: null,
    side: -1,
    cloud: {
      shade: ["rgba(206, 222, 240, 1)", "rgba(158, 184, 216, 1)"],
      lit: ["rgba(255, 255, 255, 1)", "rgba(255, 254, 248, 0.85)"],
      dx: -0.12,
      dy: -0.36,
    },
    banks: [
      { x: 0.84, base: 0.475, w: 0.12, h: 0.3 },
      { x: 0.99, base: 0.46, w: 0.09, h: 0.2 },
      { x: 0.68, base: 0.495, w: 0.07, h: 0.12 },
      { x: 0.58, base: 0.522, w: 0.05, h: 0.035 },
      { x: 0.36, base: 0.11, w: 0.05, h: 0.035 },
      { x: 0.6, base: 0.19, w: 0.035, h: 0.025 },
      { x: 0.12, base: 0.08, w: 0.06, h: 0.04 },
    ],
    sea: ["#cbe8ea", "#67bacf", "#2a85a8"],
    glint: "255, 255, 255",
    path: null,
    haze: "222, 236, 242",
    towers: [
      ["#f4ebdb", "#c6c2bd"],
      ["#f0e2c6", "#c8b79b"],
      ["#e9e5dd", "#bcb7af"],
      ["#dfae86", "#a87d5e"],
    ],
    lows: ["#f2d9b2", "#e9c3ae", "#d6e2cd", "#f5e7c9", "#cfd9e6"],
    glass: ["#b2d2e6", "#5f8db0"],
    windows: 0,
    far: "#a7c4d3",
    tree: ["#2c6a3f", "#4d914c", "#9ccb6a"],
    palm: ["#7f603f", "#2f6d42", "#86bb5c"],
    road: "#6f7479",
    walk: ["#cfcabe", "#eee9de"],
    lip: "#fdfaf3",
    face: "#a29b8f",
    pod: ["#525c5c", "#9a9b95", "#e1ddd1"],
    pole: "#46535a",
    crowd: ["#e86c86", "#3e6fa8", "#e4b24c", "#f2efe8"],
    people: { skin: "#b5805e", hair: "#1c1714", pants: "#2e3a4c", shoes: "#ece8df" },
    me: {
      shirt: "#3c6e71",
      skin: "#b98463",
      hair: "#1a1512",
      pants: "#2b3646",
      shoes: "#f3f0e8",
      laptop: "#d5dade",
      screen: "#1c2630",
    },
    stars: 0,
  },
  dusk: {
    day: false,
    night: false,
    sky: ["#5a5996", "#9372ab", "#d889a8", "#f3a57e", "#ffd08a"],
    light: { x: 0.99, y: 0.5, r: 0.8, a: 0.9, rgb: "255, 206, 140" },
    disc: { x: 0.985, y: 0.505, r: 0.028, color: "#fff1c4" },
    side: 1,
    cloud: {
      shade: ["rgba(178, 128, 166, 0.95)", "rgba(122, 92, 146, 0.9)"],
      lit: ["rgba(255, 196, 150, 0.95)", "rgba(244, 150, 150, 0.6)"],
      dx: 0.25,
      dy: 0.2,
    },
    banks: [
      { x: 0.6, base: 0.3, w: 0.2, h: 0.03 },
      { x: 0.85, base: 0.2, w: 0.18, h: 0.04 },
      { x: 0.98, base: 0.42, w: 0.07, h: 0.06 },
      { x: 0.2, base: 0.12, w: 0.12, h: 0.05 },
      { x: 0.42, base: 0.07, w: 0.1, h: 0.03 },
    ],
    sea: ["#f6c08e", "#d98f9e", "#6f6390"],
    glint: "255, 220, 170",
    path: 0.96,
    haze: "236, 176, 170",
    towers: [
      ["#e9bc9c", "#8f7290"],
      ["#eeb184", "#94708a"],
      ["#d9b0a2", "#88708a"],
      ["#c98a6e", "#7a5a6e"],
    ],
    lows: ["#c99a9a", "#b98f98", "#a98a9c", "#c4a094"],
    glass: ["#c7a0b4", "#7d6a8e"],
    windows: 0.08,
    far: "#b98da3",
    tree: ["#2d3536", "#465046", "#7a7a5a"],
    palm: ["#2d2a2e", "#2b382f", "#55604a"],
    road: "#4c4652",
    walk: ["#b59ea8", "#cdb7b8"],
    lip: "#f0d6cc",
    face: "#7b6876",
    pod: ["#2b2832", "#5f5762", "#c99186"],
    pole: "#2f2b34",
    crowd: ["#d65e7c", "#3f5f94", "#c9963e", "#e2d6d2"],
    people: { skin: "#7e5446", hair: "#151114", pants: "#2a2836", shoes: "#d8cccc" },
    me: {
      shirt: "#2f585b",
      skin: "#8c5f4c",
      hair: "#161214",
      pants: "#25283a",
      shoes: "#d9cfcf",
      laptop: "#9a9aa4",
      screen: "#22202c",
    },
    stars: 60,
  },
  night: {
    day: false,
    night: true,
    sky: ["#030a15", "#0a1a2d", "#12304a", "#1d4561", "#35586e"],
    light: { x: 0.8, y: 0.15, r: 0.45, a: 0.3, rgb: "190, 210, 230" },
    disc: { x: 0.8, y: 0.15, r: 0.026, color: "#f3efe2" },
    side: 1,
    cloud: {
      shade: ["rgba(52, 70, 94, 0.9)", "rgba(30, 46, 66, 0.85)"],
      lit: ["rgba(150, 170, 196, 0.55)", "rgba(110, 126, 156, 0.3)"],
      dx: 0.05,
      dy: -0.3,
    },
    banks: [
      { x: 0.62, base: 0.3, w: 0.12, h: 0.05 },
      { x: 0.93, base: 0.25, w: 0.1, h: 0.04 },
      { x: 0.25, base: 0.1, w: 0.1, h: 0.03 },
      { x: 0.7, base: 0.5, w: 0.1, h: 0.03 },
    ],
    sea: ["#2b4a5e", "#142d3d", "#081620"],
    glint: "214, 226, 236",
    path: 0.8,
    haze: "26, 50, 72",
    towers: [
      ["#223548", "#16222e"],
      ["#22344a", "#152030"],
      ["#1f3042", "#141e2a"],
      ["#24303c", "#161e28"],
    ],
    lows: ["#1a2836", "#1c2a33", "#18242f", "#1d2b38"],
    glass: ["#1a2a3a", "#121e2a"],
    windows: 0.42,
    far: "#162a3c",
    tree: ["#081414", "#0f221c", "#1b3428"],
    palm: ["#070c10", "#0a1512", "#142620"],
    road: "#11181f",
    walk: ["#30383f", "#3e454b"],
    lip: "#6a6a64",
    face: "#1d242a",
    pod: ["#090d12", "#1f262e", "#4a5560"],
    pole: "#10161c",
    crowd: ["#3a3040", "#263a50", "#3e3a2c", "#4a4a50"],
    people: { skin: "#3b2c26", hair: "#09090b", pants: "#12161e", shoes: "#3a3d42" },
    me: {
      shirt: "#1d3537",
      skin: "#5a4236",
      hair: "#0d0b0a",
      pants: "#11161f",
      shoes: "#3c4046",
      laptop: "#2a3036",
      screen: "#16222c",
    },
    stars: 520,
  },
};

type Scene = {
  W: number;
  H: number;
  tone: Tone;
  sky: HTMLCanvasElement;
  clouds: HTMLCanvasElement;
  city: HTMLCanvasElement;
  stars: { x: number; y: number; r: number; p: number }[];
  gulls: { x: number; y: number; s: number; v: number; p: number }[];
  glints: { x: number; y: number; w: number; h: number; p: number }[];
  foam: { x: number; y: number; r: number; p: number }[];
  lamps: { x: number; y: number; r: number; p: number }[];
  cars: { z: number; lane: number; color: string; speed: number }[];
  lanes: Pt[];
  vp: Pt;
  unit: number;
  seaClip: Path2D;
  roadClip: Path2D;
  mast: Pt | null;
  screen: Pt[];
  screenSize: number;
  anchor: Pt; // where the caption points, in fractions of the frame
  anchorRight: number;
  focus: Pt; // where the camera pushes in, in fractions of the frame
};

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

// A cumulus: soft puffs piled into a dome over a flat base, shaded below and lit from one side.
function cumulus(
  c: CanvasRenderingContext2D,
  x: number,
  base: number,
  w: number,
  h: number,
  tone: Tone,
  rand: () => number,
) {
  const r0 = Math.min(w * 0.38, h * 0.6 + w * 0.04);
  const n = Math.max(12, Math.min(110, Math.round((2.4 * w) / r0 + (h / r0) * 6)));
  const puffs = Array.from({ length: n }, () => {
    const k = Math.pow(rand(), 1.3);
    const half = w * (1 - k * k * 0.72);
    return {
      x: x + (rand() * 2 - 1) * half * 0.82,
      y: base - r0 * 0.35 - k * (h - r0 * 0.5),
      r: r0 * (0.55 + rand() * 0.45) * (1 - k * 0.3),
    };
  });
  c.save();
  c.beginPath();
  c.rect(x - w * 2, base - h * 2, w * 4, h * 2 + r0 * 0.1);
  c.clip();
  for (const p of puffs) {
    const g = c.createRadialGradient(p.x, p.y - p.r * 0.3, p.r * 0.1, p.x, p.y, p.r);
    g.addColorStop(0, tone.cloud.shade[0]);
    g.addColorStop(1, tone.cloud.shade[1]);
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(p.x, p.y, p.r * 1.3, p.r, 0, 0, TAU);
    c.fill();
  }
  for (const p of puffs) {
    const lx = p.x + tone.cloud.dx * p.r;
    const ly = p.y + tone.cloud.dy * p.r;
    const r = p.r * 0.82;
    const g = c.createRadialGradient(lx, ly, r * 0.05, lx, ly, r);
    g.addColorStop(0, tone.cloud.lit[0]);
    g.addColorStop(0.65, tone.cloud.lit[1]);
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(lx, ly, r * 1.3, r, 0, 0, TAU);
    c.fill();
  }
  c.restore();
}

// A rain tree: a dark mass, a lit middle and a few bright tufts on the side the light comes from.
function tree(c: CanvasRenderingContext2D, x: number, y: number, R: number, tone: Tone, rand: () => number) {
  c.strokeStyle = tone.palm[0];
  c.lineWidth = Math.max(1, R * 0.12);
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + R * 0.05, y - R * 1.1);
  c.stroke();
  const cy = y - R * 1.35;
  const layers = [
    { n: 8, spread: 1, lift: 0, size: 1 },
    { n: 6, spread: 0.72, lift: -0.18, size: 0.78 },
    { n: 4, spread: 0.42, lift: -0.38, size: 0.55 },
  ];
  layers.forEach((l, i) => {
    c.fillStyle = tone.tree[i];
    for (let j = 0; j < l.n; j++) {
      const bx = x + (rand() * 2 - 1) * R * 0.78 * l.spread + tone.side * i * R * 0.14;
      const by = cy + (rand() * 2 - 1) * R * 0.38 * l.spread + l.lift * R;
      c.beginPath();
      c.arc(bx, by, R * (0.34 + rand() * 0.24) * l.size, 0, TAU);
      c.fill();
    }
  });
}

function palm(c: CanvasRenderingContext2D, x: number, y: number, h: number, lean: number, tone: Tone, rand: () => number) {
  const top = { x: x + lean * h, y: y - h };
  c.strokeStyle = tone.palm[0];
  c.lineCap = "round";
  c.lineWidth = Math.max(1, h * 0.03);
  c.beginPath();
  c.moveTo(x, y);
  c.quadraticCurveTo(x + lean * h * 0.15, y - h * 0.55, top.x, top.y);
  c.stroke();
  for (let pass = 0; pass < 2; pass++) {
    c.fillStyle = tone.palm[1 + pass];
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i / 8 - 0.5) * Math.PI * 1.85 + (rand() - 0.5) * 0.3;
      const len = h * (0.3 + rand() * 0.12) * (pass ? 0.8 : 1);
      const ex = top.x + Math.cos(a) * len;
      const ey = top.y + Math.sin(a) * len * 0.5 + len * 0.42;
      const mx = top.x + Math.cos(a) * len * 0.55;
      const my = top.y + Math.sin(a) * len * 0.5 - len * 0.06;
      const nx = -(ey - top.y) / len;
      const ny = (ex - top.x) / len;
      const wd = len * 0.13;
      c.beginPath();
      c.moveTo(top.x, top.y);
      c.quadraticCurveTo(mx + nx * wd, my + ny * wd, ex, ey);
      c.quadraticCurveTo(mx - nx * wd, my - ny * wd, top.x, top.y);
      c.fill();
    }
  }
}

// A tower: a lit face, a shaded side, a band of glass on every floor.
function tower(
  c: CanvasRenderingContext2D,
  r: { x0: number; x1: number; side: number; top: number; base: number },
  floors: number,
  cols: number,
  colors: [string, string],
  tone: Tone,
  haze: number,
  rand: () => number,
) {
  const { x0, x1, side, top, base } = r;
  c.fillStyle = colors[1];
  c.fillRect(x1, top + side * 0.25, side, base - top);
  const g = c.createLinearGradient(0, top, 0, base);
  g.addColorStop(0, colors[0]);
  g.addColorStop(1, tone.night ? colors[1] : colors[0]);
  c.fillStyle = g;
  c.fillRect(x0, top, x1 - x0, base - top);
  const fh = (base - top) / floors;
  const cw = (x1 - x0) / cols;
  for (let f = 0; f < floors; f++) {
    const y = top + f * fh + fh * 0.28;
    const hgt = Math.max(1, fh * 0.48);
    if (tone.windows > 0) {
      for (let k = 0; k < cols; k++) {
        const on = rand() < tone.windows;
        c.fillStyle = on ? `rgba(255, ${200 + Math.round(rand() * 30)}, 140, ${0.65 + rand() * 0.3})` : tone.glass[1];
        c.fillRect(x0 + k * cw + cw * 0.12, y, cw * 0.76, hgt);
        if (side > 2 && k % 2 === 0) {
          c.fillStyle = rand() < tone.windows * 0.6 ? "rgba(255, 210, 140, 0.55)" : tone.glass[1];
          c.fillRect(x1 + side * 0.2, y + side * 0.25, side * 0.6, hgt);
        }
      }
    } else {
      const gg = c.createLinearGradient(x0, 0, x1, 0);
      gg.addColorStop(0, tone.glass[0]);
      gg.addColorStop(1, tone.glass[1]);
      c.fillStyle = gg;
      c.fillRect(x0 + cw * 0.15, y, x1 - x0 - cw * 0.3, hgt);
      c.fillStyle = colors[1];
      c.fillRect(x1 + side * 0.2, y + side * 0.25, side * 0.6, hgt);
      c.fillStyle = colors[0];
      for (let k = 1; k < cols; k++) c.fillRect(x0 + k * cw - 0.5, y, 1, hgt);
    }
  }
  // the sky, reflected across the upper floors
  if (tone.day) {
    const sheen = c.createLinearGradient(x0, top, x1, base);
    sheen.addColorStop(0, "rgba(255, 255, 255, 0.28)");
    sheen.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    c.fillStyle = sheen;
    c.fillRect(x0, top, x1 - x0, base - top);
  }
  c.fillStyle = `rgba(${tone.haze}, ${haze})`;
  c.fillRect(x0, top, x1 - x0 + side, base - top);
}

// A tetrapod: four stubby concrete legs from a hub, shaded underneath, lit along the top.
function pod(c: CanvasRenderingContext2D, x: number, y: number, s: number, tone: Tone, rand: () => number) {
  const a0 = rand() * TAU;
  const ends: Pt[] = [];
  for (let i = 0; i < 4; i++) {
    const a = a0 + i * (TAU / 4) + (rand() - 0.5) * 0.7;
    const len = s * (0.24 + rand() * 0.14);
    ends.push({ x: x + Math.cos(a) * len, y: y + Math.sin(a) * len * 0.55 - (i === 0 ? s * 0.14 : 0) });
  }
  const pass = (color: string, width: number, dx: number, dy: number) => {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    for (const e of ends) {
      c.moveTo(x + dx, y + dy);
      c.lineTo(e.x + dx, e.y + dy);
    }
    c.stroke();
  };
  c.lineCap = "round";
  pass(tone.pod[0], s * 0.44, 0, s * 0.06);
  pass(tone.pod[1], s * 0.36, 0, 0);
  const shade = rand();
  if (shade < 0.5) pass(`rgba(0, 0, 0, ${0.06 + shade * 0.22})`, s * 0.36, 0, 0);
  // only the legs that point up catch the light, and only near their tips
  c.globalAlpha = 0.6;
  c.strokeStyle = tone.pod[2];
  c.lineWidth = Math.max(0.6, s * 0.09);
  c.beginPath();
  for (const e of ends) {
    if (e.y > y - s * 0.04) continue;
    const dx = tone.side * s * 0.03;
    c.moveTo(x + (e.x - x) * 0.45 + dx, y + (e.y - y) * 0.45 - s * 0.09);
    c.lineTo(e.x + dx, e.y - s * 0.09);
  }
  c.stroke();
  c.globalAlpha = 1;
}

// Someone sitting on the edge of the wall, legs over the sea side.
function sitter(c: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, rest: boolean) {
  c.lineCap = "round";
  c.lineJoin = "round";
  c.fillStyle = "rgba(0, 0, 0, 0.16)";
  c.beginPath();
  c.ellipse(x - s * 0.06, y + s * 0.015, s * 0.2, s * 0.035, 0, 0, TAU);
  c.fill();
  const leg = (dx: number, dy: number, dark: boolean) => {
    c.strokeStyle = look.pants;
    c.lineWidth = s * 0.115;
    c.beginPath();
    c.moveTo(x - s * 0.02 + dx, y - s * 0.05 + dy);
    c.lineTo(x + s * 0.2 + dx, y - s * 0.035 + dy);
    c.lineTo(x + s * 0.24 + dx, y + s * 0.26 + dy);
    c.stroke();
    if (dark) {
      c.strokeStyle = "rgba(0, 0, 0, 0.25)";
      c.stroke();
    }
    c.fillStyle = look.shoes;
    c.beginPath();
    c.ellipse(x + s * 0.27 + dx, y + s * 0.31 + dy, s * 0.07, s * 0.035, 0.35, 0, TAU);
    c.fill();
  };
  leg(s * 0.06, -s * 0.025, true);
  leg(0, 0, false);
  // the torso leans a little toward the sea
  c.fillStyle = look.shirt;
  c.beginPath();
  c.moveTo(x - s * 0.13, y - s * 0.02);
  c.quadraticCurveTo(x - s * 0.18, y - s * 0.32, x - s * 0.06, y - s * 0.52);
  c.quadraticCurveTo(x + s * 0.03, y - s * 0.575, x + s * 0.1, y - s * 0.5);
  c.quadraticCurveTo(x + s * 0.13, y - s * 0.26, x + s * 0.07, y - s * 0.04);
  c.closePath();
  c.fill();
  if (rest) {
    c.strokeStyle = look.shirt;
    c.lineWidth = s * 0.075;
    c.beginPath();
    c.moveTo(x + s * 0.02, y - s * 0.47);
    c.lineTo(x + s * 0.05, y - s * 0.24);
    c.stroke();
    c.strokeStyle = look.skin;
    c.lineWidth = s * 0.06;
    c.beginPath();
    c.moveTo(x + s * 0.05, y - s * 0.24);
    c.lineTo(x + s * 0.17, y - s * 0.09);
    c.stroke();
  }
  const hx = x + s * 0.035;
  const hy = y - s * 0.68;
  const hr = s * 0.105;
  c.fillStyle = look.skin;
  c.fillRect(x - s * 0.01, y - s * 0.6, s * 0.065, s * 0.09);
  c.beginPath();
  c.ellipse(hx, hy, hr * 0.92, hr, 0, 0, TAU);
  c.fill();
  c.fillStyle = look.hair;
  c.beginPath();
  c.ellipse(hx - hr * 0.18, hy - hr * 0.28, hr * 0.92, hr * 0.78, -0.35, 0, TAU);
  c.fill();
  c.fillStyle = look.skin;
  c.beginPath();
  c.ellipse(hx - hr * 0.12, hy + hr * 0.12, hr * 0.14, hr * 0.2, 0, 0, TAU);
  c.fill();
  return { hx, hy, hr };
}

function walker(c: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look) {
  c.lineCap = "round";
  c.strokeStyle = look.pants;
  c.lineWidth = s * 0.07;
  c.beginPath();
  c.moveTo(x - s * 0.06, y);
  c.lineTo(x, y - s * 0.45);
  c.lineTo(x + s * 0.07, y);
  c.stroke();
  c.fillStyle = look.shirt;
  c.beginPath();
  c.moveTo(x - s * 0.08, y - s * 0.42);
  c.lineTo(x - s * 0.07, y - s * 0.78);
  c.quadraticCurveTo(x, y - s * 0.83, x + s * 0.07, y - s * 0.78);
  c.lineTo(x + s * 0.08, y - s * 0.42);
  c.closePath();
  c.fill();
  c.fillStyle = look.skin;
  c.beginPath();
  c.arc(x, y - s * 0.9, s * 0.075, 0, TAU);
  c.fill();
  c.fillStyle = look.hair;
  c.beginPath();
  c.arc(x, y - s * 0.93, s * 0.07, Math.PI, TAU);
  c.fill();
}

function build(w: number, h: number, dpr: number, variant: Variant): Scene {
  const tone = TONES[variant];
  const W = Math.round(w * dpr);
  const H = Math.round(h * dpr);
  // cover the screen with the 16:10 picture; on a tall screen keep the wall, the towers and the sea
  let VW = W;
  let VH = H;
  let ox = 0;
  let oy = 0;
  if (W / H < ASPECT) {
    VW = H * ASPECT;
    ox = Math.min(0, Math.max(W - VW, W * 0.5 - 0.43 * VW));
  } else {
    VH = W / ASPECT;
    oy = (H - VH) * 0.55;
  }
  const X = (u: number) => ox + u * VW;
  const Y = (v: number) => oy + v * VH;
  const P = (p: Pt): Pt => ({ x: X(p.x), y: Y(p.y) });
  const rand = rng(1903);
  const hz = Y(HZ);
  const vp = P(VP);

  // ── sky ──
  const sky = canvas(W, H);
  const b = sky.getContext("2d")!;
  const grad = b.createLinearGradient(0, Y(0), 0, hz);
  [0, 0.34, 0.64, 0.87, 1].forEach((stop, i) => grad.addColorStop(stop, tone.sky[i]));
  b.fillStyle = grad;
  b.fillRect(0, 0, W, H);

  const L = tone.light;
  const lx = X(L.x);
  const ly = Y(L.y);
  const glow = b.createRadialGradient(lx, ly, 0, lx, ly, L.r * VW);
  glow.addColorStop(0, `rgba(${L.rgb}, ${L.a})`);
  glow.addColorStop(0.12, `rgba(${L.rgb}, ${L.a * 0.5})`);
  glow.addColorStop(0.45, `rgba(${L.rgb}, ${L.a * 0.14})`);
  glow.addColorStop(1, `rgba(${L.rgb}, 0)`);
  b.fillStyle = glow;
  b.fillRect(0, 0, W, H);

  if (tone.day) {
    // shafts of morning light falling from behind the city
    b.save();
    b.globalCompositeOperation = "lighter";
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.12 + i * 0.045);
      const len = VW * 1.3;
      const spread = 0.018 + (i % 3) * 0.01;
      b.fillStyle = `rgba(255, 246, 220, ${0.035 + (i % 2) * 0.025})`;
      b.beginPath();
      b.moveTo(lx, ly);
      b.lineTo(lx + Math.cos(a - spread) * len, ly + Math.sin(a - spread) * len);
      b.lineTo(lx + Math.cos(a + spread) * len, ly + Math.sin(a + spread) * len);
      b.closePath();
      b.fill();
    }
    b.restore();
  }

  const stars: Scene["stars"] = [];
  for (let i = 0; i < tone.stars; i++) {
    stars.push({
      x: rand() * W,
      y: Y(Math.pow(rand(), 1.5) * (HZ - 0.08)),
      r: (0.3 + Math.pow(rand(), 3) * 1.1) * dpr,
      p: rand() * TAU,
    });
  }

  if (tone.disc) {
    const d = tone.disc;
    const dx = X(d.x);
    const dy = Y(d.y);
    const dr = d.r * VH;
    const halo = b.createRadialGradient(dx, dy, dr, dx, dy, dr * 5);
    halo.addColorStop(0, `rgba(${L.rgb}, 0.35)`);
    halo.addColorStop(1, `rgba(${L.rgb}, 0)`);
    b.fillStyle = halo;
    b.fillRect(dx - dr * 5, dy - dr * 5, dr * 10, dr * 10);
    b.fillStyle = d.color;
    b.beginPath();
    b.arc(dx, dy, dr, 0, TAU);
    b.fill();
    if (tone.night) {
      b.fillStyle = "rgba(170, 176, 180, 0.22)";
      for (const [mx, my, mr] of [
        [-0.3, -0.2, 0.28],
        [0.25, 0.15, 0.2],
        [-0.05, 0.4, 0.15],
      ]) {
        b.beginPath();
        b.arc(dx + mx * dr, dy + my * dr, mr * dr, 0, TAU);
        b.fill();
      }
    }
  }

  // ── clouds, on their own sheet so they can drift ──
  const clouds = canvas(W, H);
  const cl = clouds.getContext("2d")!;
  for (const k of tone.banks) cumulus(cl, X(k.x), Y(k.base), k.w * VW, k.h * VH, tone, rand);

  const gulls: Scene["gulls"] = [];
  if (tone.day) {
    for (let i = 0; i < 5; i++) {
      gulls.push({
        x: rand() * W,
        y: Y(0.14 + rand() * 0.24),
        s: (0.006 + rand() * 0.006) * VW,
        v: (6 + rand() * 8) * dpr,
        p: rand() * TAU,
      });
    }
  }

  // ── the city, the wall and the sea ──
  const city = canvas(W, H);
  const c = city.getContext("2d")!;

  // the sea
  const sg = c.createLinearGradient(0, hz, 0, Y(1));
  sg.addColorStop(0, tone.sea[0]);
  sg.addColorStop(0.22, tone.sea[1]);
  sg.addColorStop(1, tone.sea[2]);
  c.fillStyle = sg;
  c.fillRect(0, hz, W, H - hz);
  if (tone.path !== null) {
    const px = X(tone.path);
    const pg = c.createLinearGradient(0, hz, 0, Y(1));
    pg.addColorStop(0, `rgba(${tone.light.rgb}, ${tone.night ? 0.3 : 0.55})`);
    pg.addColorStop(1, `rgba(${tone.light.rgb}, 0)`);
    c.fillStyle = pg;
    c.beginPath();
    c.moveTo(px - VW * 0.01, hz);
    c.lineTo(px + VW * 0.01, hz);
    c.lineTo(px + VW * 0.14, Y(1.05));
    c.lineTo(px - VW * 0.14, Y(1.05));
    c.closePath();
    c.fill();
  }
  // the swell, in soft painted strokes
  for (let i = 0; i < 340; i++) {
    const v = HZ + 0.002 + Math.pow(rand(), 1.5) * (1.02 - HZ);
    const k = v - HZ;
    const u0 = shoreAt(v);
    const u = u0 + rand() * (1.15 - u0);
    const len = (0.01 + k * 0.12) * VW * (0.5 + rand());
    c.strokeStyle =
      rand() < 0.5
        ? `rgba(255, 255, 255, ${tone.night ? 0.05 : 0.16})`
        : `rgba(0, 20, 40, ${tone.night ? 0.18 : 0.08})`;
    c.lineWidth = Math.max(1, k * 0.012 * VH);
    c.beginPath();
    c.moveTo(X(u) - len / 2, Y(v));
    c.quadraticCurveTo(X(u), Y(v) - k * 0.006 * VH, X(u) + len / 2, Y(v));
    c.stroke();
  }
  // a pale line where the sea meets the sky, and two ships on it
  c.fillStyle = `rgba(${tone.haze}, ${tone.night ? 0.25 : 0.55})`;
  c.fillRect(X(0.47), hz - dpr, W, 2 * dpr);
  for (const [su, sw] of [
    [0.74, 0.016],
    [0.9, 0.01],
  ]) {
    c.fillStyle = tone.night ? "#0c1720" : "rgba(70, 80, 96, 0.55)";
    c.fillRect(X(su), hz - VH * 0.004, sw * VW, VH * 0.004);
    c.fillRect(X(su + sw * 0.6), hz - VH * 0.008, sw * 0.18 * VW, VH * 0.004);
    if (tone.night) {
      c.fillStyle = "rgba(255, 220, 160, 0.9)";
      c.fillRect(X(su + sw * 0.3), hz - VH * 0.003, 1.5 * dpr, 1.5 * dpr);
    }
  }

  // the far end of the bay: Malabar Hill and its towers, faint with distance
  let u = 0.43;
  const farLights: Pt[] = [];
  while (u < 0.575) {
    const bw = 0.003 + rand() * 0.007;
    const fade = 1 - (u - 0.43) / 0.16;
    const bh = 0.003 + rand() * 0.024 * fade;
    c.fillStyle = tone.far;
    c.fillRect(X(u), Y(HZ - bh), bw * VW + 1, bh * VH + 1);
    if (tone.windows > 0)
      for (let i = 0; i < 3; i++)
        if (rand() < 0.7) farLights.push({ x: X(u + rand() * bw), y: Y(HZ - rand() * bh) });
    u += bw * 0.85;
  }
  c.fillStyle = `rgba(${tone.haze}, ${tone.night ? 0.2 : 0.45})`;
  c.fillRect(X(0.42), Y(HZ - 0.03), 0.16 * VW, 0.03 * VH);
  c.fillStyle = "rgba(255, 214, 150, 0.85)";
  for (const f of farLights) c.fillRect(f.x, f.y, 1.2 * dpr, 1.2 * dpr);

  // the towers at Nariman Point, nearest last
  const tw = (x0: number, x1: number, side: number, top: number, base: number) => ({
    x0: X(x0),
    x1: X(x1),
    side: side * VW,
    top: Y(top),
    base: Y(base),
  });
  tower(c, tw(0.414, 0.432, 0.004, 0.44, 0.54), 7, 3, tone.towers[2], tone, 0.4, rand);
  tower(c, tw(0.372, 0.41, 0.006, 0.365, 0.56), 13, 5, tone.towers[3], tone, 0.22, rand);
  tower(c, tw(0.348, 0.374, 0.005, 0.39, 0.56), 11, 4, tone.towers[2], tone, 0.2, rand);
  tower(c, tw(0.292, 0.345, 0.009, 0.215, 0.56), 27, 6, tone.towers[1], tone, 0.14, rand);
  // low Art Deco blocks along the road
  const lows = [
    { x0: -0.03, x1: 0.045, top: 0.4 },
    { x0: 0.04, x1: 0.095, top: 0.43 },
    { x0: 0.2, x1: 0.255, top: 0.46 },
    { x0: 0.245, x1: 0.3, top: 0.44 },
  ];
  lows.forEach((l, i) => {
    const x0 = X(l.x0);
    const x1 = X(l.x1);
    const top = Y(l.top);
    const base = Y(0.58);
    c.fillStyle = tone.lows[i % tone.lows.length];
    c.fillRect(x0, top, x1 - x0, base - top);
    c.fillStyle = `rgba(255, 255, 255, ${tone.day ? 0.5 : 0.08})`;
    c.fillRect(x0, top, x1 - x0, Math.max(1, VH * 0.004));
    const rows = Math.floor((base - top) / (VH * 0.018));
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < 4; k++) {
        const on = tone.windows > 0 && rand() < tone.windows;
        c.fillStyle = on ? "rgba(255, 208, 140, 0.8)" : tone.day ? "rgba(60, 80, 96, 0.45)" : "rgba(0, 0, 0, 0.3)";
        c.fillRect(x0 + (x1 - x0) * (0.1 + k * 0.22), top + VH * (0.01 + r * 0.018), (x1 - x0) * 0.12, VH * 0.008);
      }
    }
    c.fillStyle = `rgba(${tone.haze}, 0.12)`;
    c.fillRect(x0, top, x1 - x0, base - top);
  });
  // the Air India building, with its crown and mast
  const A = tw(0.085, 0.235, 0.012, 0.14, 0.56);
  c.fillStyle = tone.towers[0][1];
  c.fillRect(X(0.13), Y(0.118), 0.06 * VW, 0.024 * VH);
  c.fillStyle = tone.towers[0][0];
  c.fillRect(X(0.128), Y(0.114), 0.064 * VW, 0.006 * VH);
  c.fillStyle = tone.pole;
  c.fillRect(X(0.159), Y(0.085), Math.max(1, 0.002 * VW), 0.03 * VH);
  tower(c, A, 24, 8, tone.towers[0], tone, 0.08, rand);
  c.fillStyle = `rgba(255, 255, 255, ${tone.day ? 0.6 : 0.1})`;
  c.fillRect(A.x0, A.top, A.x1 - A.x0, Math.max(1, VH * 0.006));
  const mast = tone.windows > 0 ? { x: X(0.16), y: Y(0.085) } : null;

  // the road
  const road = new Path2D();
  const r0 = P(ROAD_FAR);
  const r1 = P(WALK_IN);
  road.moveTo(vp.x, vp.y);
  road.lineTo(r0.x, r0.y);
  road.lineTo(r0.x, r1.y);
  road.lineTo(r1.x, r1.y);
  road.closePath();
  c.fillStyle = tone.road;
  c.fill(road);
  c.strokeStyle = tone.day ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.12)";
  c.lineWidth = Math.max(1, dpr);
  c.setLineDash([12 * dpr, 14 * dpr]);
  c.beginPath();
  const mid = P({ x: -0.02, y: 0.601 });
  c.moveTo(mid.x, mid.y);
  c.lineTo(vp.x, vp.y);
  c.stroke();
  c.setLineDash([]);

  // trees along the far kerb, with a few palms among them
  const trees: { d: number; palm: boolean }[] = [];
  for (let n = 0; ; n++) {
    const d = 1 / (1 + 0.21 * n + rand() * 0.08);
    if (d < 0.05) break;
    trees.push({ d, palm: n % 4 === 1 });
  }
  for (const t of trees.reverse()) {
    const at = P(toward(ROAD_FAR, t.d));
    if (t.palm) palm(c, at.x, at.y, 0.32 * t.d * VH, 0.08 - rand() * 0.16, tone, rand);
    else tree(c, at.x, at.y, (0.06 + rand() * 0.02) * t.d * VH, tone, rand);
  }
  c.fillStyle = `rgba(${tone.haze}, ${tone.night ? 0.05 : 0.12})`;
  c.fillRect(X(0.25), Y(0.48), 0.25 * VW, 0.07 * VH);

  // the walkway
  const walk = new Path2D();
  const wIn = P(WALK_IN);
  const wOut = P(WALK_OUT);
  walk.moveTo(wIn.x, wIn.y);
  walk.lineTo(vp.x, vp.y);
  walk.lineTo(wOut.x, wOut.y);
  walk.lineTo(wOut.x, H + 10);
  walk.lineTo(wIn.x, H + 10);
  walk.closePath();
  const wg = c.createLinearGradient(0, hz, 0, Y(1));
  wg.addColorStop(0, tone.walk[0]);
  wg.addColorStop(1, tone.walk[1]);
  c.fillStyle = wg;
  c.fill(walk);
  c.save();
  c.clip(walk);
  for (let i = 0; i < 70; i++) {
    const v = HZ + 0.06 + rand() * 0.47;
    c.fillStyle = rand() < 0.5 ? "rgba(0, 0, 0, 0.035)" : "rgba(255, 255, 255, 0.05)";
    c.beginPath();
    c.ellipse(X(rand() * 0.42), Y(v), (v - HZ) * 0.25 * VW, (v - HZ) * 0.03 * VH, 0, 0, TAU);
    c.fill();
  }
  c.strokeStyle = tone.day ? "rgba(70, 60, 50, 0.1)" : "rgba(0, 0, 0, 0.25)";
  c.lineWidth = Math.max(1, dpr);
  for (let n = 0; n < 40; n++) {
    const v = HZ + 0.48 / (1 + 0.32 * n);
    c.beginPath();
    c.moveTo(X(-0.05), Y(v));
    c.lineTo(X(1), Y(v + 0.004));
    c.stroke();
  }
  for (const nx of [0.1, -0.15]) {
    c.beginPath();
    c.moveTo(vp.x, vp.y);
    c.lineTo(X(nx), Y(1.02));
    c.stroke();
  }
  c.restore();
  // the kerb between road and walkway
  c.fillStyle = tone.face;
  c.beginPath();
  c.moveTo(vp.x, vp.y);
  c.lineTo(wIn.x, wIn.y);
  c.lineTo(wIn.x, wIn.y - 0.012 * VH);
  c.closePath();
  c.fill();

  // the sea face of the wall, then the tetrapods piled against it
  const faceNear = P({ x: WALK_OUT.x - 0.004, y: WALK_OUT.y + 0.05 });
  c.fillStyle = tone.face;
  c.beginPath();
  c.moveTo(vp.x, vp.y);
  c.lineTo(wOut.x, wOut.y);
  c.lineTo(faceNear.x, faceNear.y);
  c.closePath();
  c.fill();

  const band = new Path2D();
  const far = P(toward(WALK_OUT, 1.6));
  band.moveTo(vp.x, vp.y);
  band.lineTo(far.x, far.y);
  band.lineTo(W + 10, H + 10);
  band.lineTo(W + 10, hz);
  band.closePath();
  const shore = new Path2D();
  shore.moveTo(vp.x, vp.y);
  for (let i = 1; i <= 40; i++) {
    const s = P(onShore(i / 40));
    shore.lineTo(s.x, s.y);
  }
  shore.lineTo(X(1.3), Y(1.3));
  shore.lineTo(far.x, far.y);
  shore.closePath();
  c.save();
  c.clip(band);
  const pg = c.createLinearGradient(0, hz, 0, Y(1));
  pg.addColorStop(0, tone.pod[0]);
  pg.addColorStop(1, tone.pod[1]);
  c.fillStyle = pg;
  c.fill(shore);
  for (let v = HZ + 0.004; v < 1.1; ) {
    const k = v - HZ;
    const s = 0.28 * k * VH;
    if (s > 1.4) {
      const xa = X(atV(WALK_OUT, v)) - s * 0.15;
      const xb = X(shoreAt(v));
      let x = xa + rand() * s * 0.3;
      while (x < xb + s * 0.5) {
        pod(c, x, Y(v) + (rand() - 0.5) * s * 0.3, s * (0.8 + rand() * 0.4), tone, rand);
        x += s * (0.5 + rand() * 0.35);
      }
    }
    v += Math.max(k * 0.075, 0.0015);
  }
  c.restore();
  // the lip of the wall
  c.strokeStyle = tone.lip;
  c.lineWidth = Math.max(1, 1.5 * dpr);
  c.beginPath();
  c.moveTo(vp.x, vp.y);
  c.lineTo(wOut.x, wOut.y);
  c.stroke();

  // the lamps of the Queen's Necklace, far to near
  const lamps: Scene["lamps"] = [];
  const posts: number[] = [];
  for (let n = 1; n < 46; n++) posts.push(1 / (1 + 0.3 * n));
  posts.reverse();
  if (tone.night) {
    c.save();
    c.globalCompositeOperation = "lighter";
    for (const d of posts) {
      if (d < 0.12) continue;
      const base = P(toward(WALK_IN, d));
      const cx = base.x - 0.02 * d * VW;
      const pool = c.createRadialGradient(cx, base.y, 0, cx, base.y, 0.16 * d * VW);
      pool.addColorStop(0, "rgba(255, 180, 90, 0.2)");
      pool.addColorStop(1, "rgba(255, 180, 90, 0)");
      c.fillStyle = pool;
      c.beginPath();
      c.ellipse(cx, base.y, 0.16 * d * VW, 0.035 * d * VH, 0, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  for (const d of posts) {
    const base = P(toward(WALK_IN, d));
    const hgt = 0.5 * d * VH;
    const top = { x: base.x, y: base.y - hgt };
    c.strokeStyle = tone.pole;
    c.lineCap = "round";
    c.lineWidth = Math.max(0.8, 0.005 * d * VH);
    c.beginPath();
    c.moveTo(base.x, base.y);
    c.lineTo(top.x, top.y);
    c.quadraticCurveTo(top.x, top.y - 0.02 * d * VH, top.x - 0.035 * d * VH, top.y - 0.012 * d * VH);
    c.stroke();
    const head = { x: top.x - 0.04 * d * VH, y: top.y - 0.01 * d * VH };
    c.fillStyle = tone.night ? "#ffe2a8" : tone.pole;
    c.beginPath();
    c.ellipse(head.x, head.y, 0.012 * d * VH + 0.5, 0.005 * d * VH + 0.5, 0, 0, TAU);
    c.fill();
    lamps.push({ x: head.x, y: head.y + 0.004 * d * VH, r: Math.max(1, 0.012 * d * VH), p: rand() * TAU });
  }

  // people out on the wall
  const crowdLook = (i: number): Look => ({ ...tone.people, shirt: tone.crowd[i % tone.crowd.length] });
  for (const [v, i] of [
    [0.585, 0],
    [0.592, 1],
    [0.618, 3],
  ]) {
    const k = v - HZ;
    sitter(c, X(atV(WALK_OUT, v)) - k * 0.1 * VH, Y(v), 0.95 * k * VH, crowdLook(i), true);
  }
  walker(c, X(0.25), Y(0.6), 1.5 * 0.065 * VH, crowdLook(2));
  walker(c, X(0.1), Y(0.645), 1.5 * 0.11 * VH, crowdLook(1));

  // and me, with the laptop
  const meX = X(atV(WALK_OUT, ME_V)) - (ME_V - HZ) * 0.08 * VH;
  const meY = Y(ME_V);
  const s = 0.95 * (ME_V - HZ) * VH;
  const look = tone.me;
  const head = sitter(c, meX, meY, s, look, false);
  // the laptop on my knees: base, lid and screen, turned a little toward you
  const at = (dx: number, dy: number): Pt => ({ x: meX + dx * s, y: meY + dy * s });
  const base = [at(0.02, -0.075), at(0.25, -0.095), at(0.25, -0.07), at(0.02, -0.05)];
  const lid = [at(0.135, -0.315), at(0.31, -0.345), at(0.275, -0.09), at(0.11, -0.072)];
  const screen = [at(0.145, -0.3), at(0.298, -0.327), at(0.268, -0.1), at(0.12, -0.084)];
  const poly = (pts: Pt[], fill: string) => {
    c.fillStyle = fill;
    c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.closePath();
    c.fill();
  };
  poly(base, look.laptop);
  poly(lid, look.laptop);
  poly(screen, look.screen);
  if (tone.day) {
    c.strokeStyle = "rgba(90, 100, 108, 0.6)";
    c.lineWidth = Math.max(1, s * 0.006);
    c.beginPath();
    lid.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.closePath();
    c.stroke();
  }
  // my arm, reaching for the keyboard
  c.lineCap = "round";
  c.strokeStyle = look.shirt;
  c.lineWidth = s * 0.08;
  c.beginPath();
  c.moveTo(meX + s * 0.01, meY - s * 0.47);
  c.lineTo(meX + s * 0.03, meY - s * 0.25);
  c.stroke();
  c.strokeStyle = look.skin;
  c.lineWidth = s * 0.06;
  c.beginPath();
  c.moveTo(meX + s * 0.03, meY - s * 0.25);
  c.lineTo(meX + s * 0.15, meY - s * 0.1);
  c.stroke();
  c.fillStyle = look.skin;
  c.beginPath();
  c.ellipse(meX + s * 0.165, meY - s * 0.095, s * 0.035, s * 0.022, -0.2, 0, TAU);
  c.fill();

  // where things animate
  const seaClip = new Path2D();
  seaClip.moveTo(X(0.47), hz);
  for (let i = 0; i <= 40; i++) {
    const p = P(onShore(i / 40));
    seaClip.lineTo(p.x, p.y);
  }
  seaClip.lineTo(X(1.3), Y(1.3));
  seaClip.lineTo(W + 10, hz);
  seaClip.closePath();

  const glints: Scene["glints"] = [];
  for (let i = 0; i < 460; i++) {
    const v = HZ + 0.002 + Math.pow(rand(), 1.6) * (1.02 - HZ);
    const k = v - HZ;
    const u0 = shoreAt(v);
    const gu =
      tone.path !== null && rand() < 0.6 ? tone.path + (rand() - 0.5) * (0.015 + k * 0.5) : u0 + rand() * (1.15 - u0);
    if (gu < u0) continue;
    glints.push({
      x: X(gu),
      y: Y(v),
      w: (0.003 + k * 0.04 * rand()) * VW,
      h: Math.max(dpr, k * 0.005 * VH),
      p: rand() * TAU,
    });
  }
  const foam: Scene["foam"] = [];
  for (let i = 0; i < 90; i++) {
    const p = onShore(Math.pow(i / 89, 0.8));
    foam.push({ x: X(p.x + (rand() - 0.3) * 0.01), y: Y(p.y), r: (p.y - HZ) * 0.03 * VH + dpr, p: rand() * TAU });
  }
  const palette = tone.day ? ["#f2c230", "#f1f1ee", "#c94a3e", "#f2c230", "#3e6fa8"] : ["#20262c", "#2b3138", "#3a3036"];
  const cars: Scene["cars"] = [];
  for (let i = 0; i < 10; i++)
    cars.push({ z: rand() * 18, lane: i % 2, color: palette[i % palette.length], speed: 0.5 + rand() * 0.4 });

  return {
    W,
    H,
    tone,
    sky,
    clouds,
    city,
    stars,
    gulls,
    glints,
    foam,
    lamps,
    cars,
    lanes: LANES.map(P),
    vp,
    unit: VH,
    seaClip,
    roadClip: road,
    mast,
    screen,
    screenSize: s,
    anchor: { x: (head.hx - head.hr * 1.1) / W, y: (head.hy - head.hr * 1.2) / H },
    // the same point mirrored to the right of the head, for narrow screens where the note sits on that side
    anchorRight: (head.hx + head.hr * 1.1) / W,
    focus: { x: meX / W, y: (meY - s * 0.3) / H },
  };
}

function drawSky(ctx: CanvasRenderingContext2D, s: Scene, t: number, dpr: number) {
  ctx.drawImage(s.sky, 0, 0);
  for (const st of s.stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * 1.1 + st.p);
    ctx.fillStyle = `rgba(240, 236, 220, ${0.75 * tw})`;
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, TAU);
    ctx.fill();
  }
  ctx.drawImage(s.clouds, Math.sin(t * 0.025) * s.W * 0.012, 0);
  ctx.strokeStyle = "rgba(40, 60, 80, 0.7)";
  ctx.lineWidth = 1.2 * dpr;
  ctx.lineCap = "round";
  for (const g of s.gulls) {
    const x = ((g.x + t * g.v) % (s.W * 1.2)) - s.W * 0.1;
    const y = g.y + Math.sin(t * 0.6 + g.p) * g.s;
    const flap = Math.sin(t * 5 + g.p) * 0.35;
    ctx.beginPath();
    ctx.moveTo(x - g.s, y - g.s * (0.2 + flap));
    ctx.quadraticCurveTo(x - g.s * 0.4, y - g.s * 0.5, x, y);
    ctx.quadraticCurveTo(x + g.s * 0.4, y - g.s * 0.5, x + g.s, y - g.s * (0.2 + flap));
    ctx.stroke();
  }
}

function drawCity(ctx: CanvasRenderingContext2D, s: Scene, t: number, dpr: number) {
  const { tone } = s;
  // the sky shows through this layer, so clear it or the lamps' glow piles up frame on frame
  ctx.clearRect(0, 0, s.W, s.H);
  ctx.drawImage(s.city, 0, 0);

  // light on the water
  ctx.save();
  ctx.clip(s.seaClip);
  for (const g of s.glints) {
    const a = Math.pow(Math.max(0, Math.sin(t * 0.9 + g.p)), 5);
    if (a < 0.02) continue;
    ctx.fillStyle = `rgba(${tone.glint}, ${a * (tone.night ? 0.7 : 0.9)})`;
    ctx.fillRect(g.x - g.w / 2, g.y, g.w, g.h);
  }
  ctx.restore();

  // the swell breaking on the tetrapods
  for (const f of s.foam) {
    const a = Math.max(0, Math.sin(t * 0.7 + f.p));
    ctx.fillStyle = `rgba(255, 255, 255, ${(tone.night ? 0.12 : 0.45) * a})`;
    ctx.beginPath();
    ctx.ellipse(f.x + f.r * a, f.y, f.r * 2.2, f.r * 0.55, -0.4, 0, TAU);
    ctx.fill();
  }

  // traffic: one lane coming, one going
  ctx.save();
  ctx.clip(s.roadClip);
  for (const car of s.cars) {
    const z = 1 + ((car.z + t * car.speed * (car.lane ? -1 : 1) + 1800) % 18);
    const d = 1 / z;
    const near = s.lanes[car.lane];
    const x = s.vp.x + (near.x - s.vp.x) * d;
    const y = s.vp.y + (near.y - s.vp.y) * d;
    const len = 0.07 * d * s.unit;
    const hgt = 0.022 * d * s.unit;
    ctx.fillStyle = car.color;
    ctx.fillRect(x - len / 2, y - hgt, len, hgt);
    ctx.fillRect(x - len * 0.3, y - hgt * 1.6, len * 0.55, hgt * 0.7);
    if (tone.night) {
      ctx.fillStyle = car.lane ? "rgba(255, 70, 60, 0.9)" : "rgba(255, 244, 214, 0.95)";
      ctx.fillRect(x + (car.lane ? len / 2 - 2 * dpr : -len / 2), y - hgt * 0.7, 2 * dpr, 2 * dpr);
    }
  }
  ctx.restore();

  if (tone.night) {
    ctx.globalCompositeOperation = "lighter";
    for (const l of s.lamps) {
      const flick = 0.88 + 0.12 * Math.sin(t * 3 + l.p) * Math.sin(t * 7.3 + l.p * 2);
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 6);
      g.addColorStop(0, `rgba(255, 200, 120, ${0.55 * flick})`);
      g.addColorStop(1, "rgba(255, 170, 80, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(l.x - l.r * 6, l.y - l.r * 6, l.r * 12, l.r * 12);
    }
    ctx.globalCompositeOperation = "source-over";
  }
  if (s.mast && Math.sin(t * 2.2) > 0.4) {
    ctx.fillStyle = "rgba(255, 70, 60, 0.95)";
    ctx.beginPath();
    ctx.arc(s.mast.x, s.mast.y, 2 * dpr, 0, TAU);
    ctx.fill();
  }

  // the screen: someone is typing, and the cursor blinks
  const [p0, p1, , p3] = s.screen;
  ctx.save();
  ctx.setTransform(p1.x - p0.x, p1.y - p0.y, p3.x - p0.x, p3.y - p0.y, p0.x, p0.y);
  const colors = ["#7fb0ad", "#e2b867", "#d98aa6", "#9fb4c8", "#7fb0ad", "#c9d3da"];
  const widths = [0.5, 0.62, 0.38, 0.7, 0.45, 0.55];
  const indent = [0, 0.1, 0.1, 0.2, 0.1, 0];
  const typed = (t * 0.9) % (widths.length + 2);
  for (let i = 0; i < widths.length; i++) {
    const w = Math.min(widths[i], Math.max(0, typed - i) * widths[i]);
    if (w <= 0) continue;
    ctx.fillStyle = colors[i];
    ctx.fillRect(0.12 + indent[i], 0.1 + i * 0.13, w, 0.06);
  }
  if (Math.sin(t * 6) > 0) {
    const line = Math.min(widths.length - 1, Math.floor(typed));
    const w = Math.min(widths[line], Math.max(0, typed - line) * widths[line]);
    ctx.fillStyle = "#f3efe2";
    ctx.fillRect(0.13 + indent[line] + w, 0.08 + line * 0.13, 0.03, 0.1);
  }
  ctx.restore();

  if (tone.night) {
    // the screen lights my face
    const cx = (s.screen[0].x + s.screen[2].x) / 2;
    const cy = (s.screen[0].y + s.screen[2].y) / 2;
    const r = s.screenSize * 0.5;
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.3);
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(170, 210, 235, ${0.4 * pulse})`);
    g.addColorStop(1, "rgba(170, 210, 235, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.globalCompositeOperation = "source-over";
  }
}

// a fixed paper-grain tile, laid over everything as a CSS background
let grainUrl: string | null = null;
function grain() {
  if (grainUrl) return grainUrl;
  const c = canvas(200, 200);
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

export function MarineDrive({
  variant = "night",
  progress,
  caption,
  className,
}: {
  variant?: Variant;
  progress?: MotionValue<number>;
  caption?: ReactNode;
  className?: string;
}) {
  const skyRef = useRef<HTMLCanvasElement>(null);
  const cityRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);

  // the camera pushes in on the wall: the city grows faster than the sky
  const fallback = useMotionValue(0);
  const p = progress ?? fallback;
  const skyScale = useTransform(p, [0, 1], [1, 1.06]);
  const cityScale = useTransform(p, [0, 1], [1, 1.28]);
  const cityY = useTransform(p, [0, 1], ["0%", "-3%"]);

  useEffect(() => {
    const sky = skyRef.current;
    const city = cityRef.current;
    if (!sky || !city) return;
    const sc = sky.getContext("2d")!;
    const cc = city.getContext("2d")!;
    if (grainRef.current) grainRef.current.style.backgroundImage = `url(${grain()})`;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let scene: Scene | null = null;
    let raf = 0;
    let visible = true;

    const paint = (now: number) => {
      if (!scene) return;
      const t = now / 1000;
      drawSky(sc, scene, t, dpr);
      drawCity(cc, scene, t, dpr);
    };

    const resize = () => {
      const { width, height } = sky.getBoundingClientRect();
      if (!width || !height) return;
      scene = build(width, height, dpr, variant);
      for (const el of [sky, city]) {
        el.width = scene.W;
        el.height = scene.H;
      }
      if (layerRef.current)
        layerRef.current.style.transformOrigin = `${scene.focus.x * 100}% ${scene.focus.y * 100}%`;
      if (captionRef.current) {
        const x = window.matchMedia("(max-width: 640px)").matches ? scene.anchorRight : scene.anchor.x;
        captionRef.current.style.left = `${x * 100}%`;
        captionRef.current.style.top = `${scene.anchor.y * 100}%`;
      }
      paint(performance.now());
    };

    const loop = (now: number) => {
      if (visible) paint(now);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(sky);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(sky);
    if (!still) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [variant]);

  return (
    <div
      className={`md md-${variant} ${className ?? ""}`}
      role="img"
      aria-label="A painted view along Marine Drive in Mumbai: the promenade and its tetrapods running out to the sea, the towers at Nariman Point, the streetlamps of the Queen's Necklace, and someone sitting on the sea wall with a laptop."
    >
      <motion.canvas ref={skyRef} className="md-layer" style={{ scale: skyScale, transformOrigin: "50% 60%" }} />
      <motion.div ref={layerRef} className="md-layer" style={{ scale: cityScale, y: cityY }}>
        <canvas ref={cityRef} className="md-fill" />
        {caption && (
          <div ref={captionRef} className="md-caption">
            {caption}
          </div>
        )}
      </motion.div>
      <div ref={grainRef} className="md-grain" />
    </div>
  );
}
