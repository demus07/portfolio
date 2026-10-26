"use client";

import { useEffect, useRef, useState } from "react";
import { GITHUB_URL, UNIXPORN_URL } from "@/lib/site";

const ROUTE = [
  { os: "Linux Mint", text: "2020. My laptop was too slow for Windows, and Mint gave it a second life." },
  { os: "Arch", text: "Broke a few installs. Loved fixing every one of them." },
  { os: "NixOS", text: "The whole system in one file. Tried i3 and qtile, settled on Sway, riced it to the brim." },
  { os: "Gentoo", text: "Compiled my own kernel, choosing every module. The bare bones of an operating system." },
];

// Everything below is copied from the screenshot of the rice: pfetch, the nvim config, the bar.
const NIX_LOGO = ["  \\\\  \\\\ //", " ==\\\\__\\\\/ //", "   //   \\\\//", "==//     //==", " //\\\\___//", "// /\\\\  \\\\==", "  // \\\\  \\\\"];
const FETCH: [string, string][] = [
  ["os", "NixOS 22.05 (Quokka)"],
  ["host", "HP Notebook"],
  ["kernel", "5.16.2"],
  ["uptime", "3d 9h 55m"],
  ["pkgs", "688"],
  ["memory", "1614M / 3848M"],
];

type Tok = [string, string?];
const INIT: [number, Tok[]][] = [
  [11, [["  use ", "k"], ["'andweeb/presence.nvim'", "s"]]],
  [12, [["  use ", "k"], ["'lukas-reineke/indent-blankline.nvim'", "s"]]],
  [13, [["  use ", "k"], ["'folke/tokyonight.nvim'", "s"]]],
  [14, [["  use ", "k"], ["'nvim-treesitter/nvim-treesitter'", "s"]]],
  [15, [["end", "k"], [")"]]],
  [16, []],
  [17, []],
  [18, [["vim.g.", "v"], ["tokyonight_style"], [" = "], ['"night"', "s"]]],
  [19, [["vim.", "v"], ["cmd", "f"], ["[[colorscheme tokyonight]]", "s"]]],
  [20, []],
  [21, []],
  [22, [["require", "f"], ["'nvim-treesitter.configs'", "s"], ["."], ["setup", "f"], [" {"]]],
  [23, [["  highlight = {"]]],
  [24, [["    enable = "], ["true", "n"], [","]]],
  [25, [["    custom_captures = {"]]],
  [26, [["      ["], ['"foo.bar"', "s"], ["] = "], ['"Identifier"', "s"], [","]]],
  [27, [["    },"]]],
  [28, [["    additional_vim_regex_highlighting = "], ["false", "n"], [","]]],
  [29, [["  },"]]],
  [30, [["}"]]],
  [31, []],
  [32, [["vim.", "v"], ["opt.list = "], ["true", "n"]]],
  [33, [["require", "f"], ['("indent_blankline")', "s"], ["."], ["setup", "f"], [" {"]]],
  [34, [["  show_end_of_line = "], ["true", "n"], [","]]],
];

// A seeded field of contour lines, like the topographic wallpaper behind the windows.
function drawContours(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const G = 64;
  const lattice = Array.from({ length: G * G }, rnd);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const at = (i: number, j: number) => lattice[(((j % G) + G) % G) * G + (((i % G) + G) % G)];
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  const field = (x: number, y: number) =>
    noise(x, y) * 0.6 + noise(x * 2.1 + 9, y * 2.1 + 3) * 0.3 + noise(x * 4.3, y * 4.3) * 0.1;

  // the pattern is sized to the frame, so it looks the same at any width
  const step = Math.max(3, w / 220);
  const cols = Math.ceil(w / step) + 1;
  const rows = Math.ceil(h / step) + 1;
  const scale = 4.2 / w;
  const v = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) v[j * cols + i] = field(i * step * scale, j * step * scale);

  ctx.strokeStyle = "rgba(169, 177, 214, 0.42)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let l = 0.1; l < 0.95; l += 0.034) {
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = v[j * cols + i];
        const b = v[j * cols + i + 1];
        const c = v[(j + 1) * cols + i + 1];
        const d = v[(j + 1) * cols + i];
        const x = i * step;
        const y = j * step;
        const pts: [number, number][] = [];
        if (a < l !== b < l) pts.push([x + ((l - a) / (b - a)) * step, y]);
        if (b < l !== c < l) pts.push([x + step, y + ((l - b) / (c - b)) * step]);
        if (d < l !== c < l) pts.push([x + ((l - d) / (c - d)) * step, y + step]);
        if (a < l !== d < l) pts.push([x, y + ((l - a) / (d - a)) * step]);
        for (let k = 0; k + 1 < pts.length; k += 2) {
          ctx.moveTo(pts[k][0], pts[k][1]);
          ctx.lineTo(pts[k + 1][0], pts[k + 1][1]);
        }
      }
    }
  }
  ctx.stroke();
}

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="r-icon">
    <path d={d} />
  </svg>
);

export function Rice() {
  const clock = useClock();
  const wall = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = wall.current;
    if (!c) return;
    let w = 0;
    const ro = new ResizeObserver(() => {
      if (c.clientWidth === w) return;
      w = c.clientWidth;
      drawContours(c);
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="rice"
      data-ui
      role="img"
      aria-label="A redraw of Sumedh's Sway desktop: a topographic wallpaper, a bar of rounded modules along the top, a terminal running pfetch on NixOS and Neovim open on its own config, all in Tokyo Night colours."
    >
      <canvas ref={wall} className="rice-wall" aria-hidden="true" />

      <div className="rice-bar">
        <div className="r-group">
          <span className="r-mod">
            <b className="r-red">λ</b>
            <span>II</span>
            <span>III</span>
          </span>
          <span className="r-mod">
            <span className="r-cyan">
              <Icon d="M8 1v14M2 4.5l12 7M2 11.5l12-7M6 2.5l2 1.5 2-1.5M6 13.5l2-1.5 2 1.5" />
            </span>
            20°C
          </span>
        </div>
        <span className="r-mod">
          <Icon d="M2 3h12v10H2zM4 6l2 2-2 2M8 10h4" />
          bash
        </span>
        <div className="r-group">
          <span className="r-mod">
            <span className="r-yellow">
              <Icon d="M3 10V8a5 5 0 0110 0v2M3 10h2v3H3zM11 10h2v3h-2z" />
            </span>
            75%
          </span>
          <span className="r-mod">
            <span className="r-green">
              <Icon d="M9 1L3 9h4l-1 6 6-8H8z" />
            </span>
            100%
          </span>
          <span className="r-mod">
            <span className="r-purple">
              <Icon d="M1 6a10 10 0 0114 0M3.5 8.5a6.5 6.5 0 019 0M6 11a3 3 0 014 0M8 13.5v.01" />
            </span>
            Overlord
          </span>
          <span className="r-mod">
            <span className="r-blue">
              <Icon d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v3l2 2" />
            </span>
            {clock || "21:08"}
          </span>
        </div>
      </div>

      <div className="rice-win rice-term">
        <p className="r-dim">~</p>
        <p>
          <span className="r-green">λ</span> pfetch
        </p>
        <div className="r-fetch">
          <pre className="r-logo">{NIX_LOGO.join("\n")}</pre>
          <div>
            <p className="r-user">demus@nix</p>
            {FETCH.map(([k, val]) => (
              <p key={k}>
                <span className="r-key">{k}</span>
                {val}
              </p>
            ))}
          </div>
        </div>
        <p className="r-dim r-gap">~</p>
        <p>
          <span className="r-green">λ</span> <span className="r-block" />
        </p>
      </div>

      <div className="rice-win rice-vim">
        <div className="r-code">
          {INIT.map(([n, toks]) => (
            <p key={n}>
              <span className="r-ln">{n}</span>
              {n === 29 && <span className="r-vcursor" />}
              {toks.map(([t, k], i) => (
                <span key={i} className={k ? `t-${k}` : undefined}>
                  {t}
                </span>
              ))}
            </p>
          ))}
        </div>
        <p className="r-status">
          <span>.config/nvim/init.lua</span>
          <span>29,1</span>
          <span>24%</span>
        </p>
      </div>
    </div>
  );
}

export function Desktop() {
  return (
    <section className="desktop" id="desktop" aria-labelledby="desktop-title">
      <div className="desktop-head">
        <h2 id="desktop-title" className="section-title" data-reveal>
          Where the taste started
        </h2>
        <p className="desktop-lede" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
          Ricing is design with nobody to sign it off. You notice every pixel, because you&rsquo;re
          the one looking at it all day.
        </p>
      </div>

      <figure className="desktop-figure" data-reveal>
        <Rice />
        <figcaption>My Sway rice on NixOS, redrawn from a screenshot: Tokyo Night, kitty, Neovim.</figcaption>
      </figure>

      <div className="desktop-foot">
        <ol className="route" data-reveal>
          {ROUTE.map((r) => (
            <li key={r.os}>
              <p className="route-os">{r.os}</p>
              <p className="route-text">{r.text}</p>
            </li>
          ))}
        </ol>
        <div className="desktop-side" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
          <p>
            Once, GRUB died while I was dual-booting NixOS and Arch. I chrooted in from a live USB and
            rebuilt it by hand. That is how you learn what sits under everything you build.
          </p>
          <p className="desktop-links">
            <a className="text-link" href={`${GITHUB_URL}/sway-dots`}>
              The dotfiles
            </a>
            <a className="text-link" href={UNIXPORN_URL}>
              The post on r/unixporn
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
