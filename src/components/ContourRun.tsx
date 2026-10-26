"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Rice } from "@/components/Desktop";
import { MeetingReplay } from "@/components/MeetingReplay";
import { TypeTest } from "@/components/TypeTest";
import {
  CLOSE,
  DESKTOP,
  EMAIL,
  FIT,
  GITHUB_URL,
  INTRO,
  KITCHEN,
  LEETCODE_URL,
  LETTER,
  METHOD,
  ROAD,
  WORK,
  X_URL,
  mailto,
} from "@/lib/content";
import s from "./ContourRun.module.css";

/*
 * Contour run. The topographic wallpaper from the rice becomes the ground of the whole page, and one
 * route, like a run along the Coastal Road, is drawn through it as you scroll.
 */

// One seamless tile of contour lines. Every octave wraps on the tile, so it repeats without a seam.
function contourTile(size: number, ink: string) {
  const c = document.createElement("canvas");
  const dpr = 2;
  c.width = c.height = size * dpr;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.scale(dpr, dpr);

  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const G = 64;
  const lattice = Array.from({ length: G * G }, rnd);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number, p: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const at = (i: number, j: number) => lattice[(((j % p) + p) % p) * G + (((i % p) + p) % p)];
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const cc = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (cc - a) * yf + (a - b - cc + d) * xf * yf;
  };
  const P = 5;
  const field = (x: number, y: number) => noise(x, y, P) * 0.62 + noise(x * 2, y * 2, P * 2) * 0.28 + noise(x * 4, y * 4, P * 4) * 0.1;

  const step = 5;
  const n = Math.round(size / step);
  const v = new Float32Array((n + 1) * (n + 1));
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) v[j * (n + 1) + i] = field((i / n) * P, (j / n) * P);

  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let l = 0.1; l < 0.95; l += 0.032) {
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = v[j * (n + 1) + i];
        const b = v[j * (n + 1) + i + 1];
        const cc = v[(j + 1) * (n + 1) + i + 1];
        const d = v[(j + 1) * (n + 1) + i];
        const x = i * step;
        const y = j * step;
        const pts: [number, number][] = [];
        if (a < l !== b < l) pts.push([x + ((l - a) / (b - a)) * step, y]);
        if (b < l !== cc < l) pts.push([x + step, y + ((l - b) / (cc - b)) * step]);
        if (d < l !== cc < l) pts.push([x + ((l - d) / (cc - d)) * step, y + step]);
        if (a < l !== d < l) pts.push([x, y + ((l - a) / (d - a)) * step]);
        for (let k = 0; k + 1 < pts.length; k += 2) {
          ctx.moveTo(pts[k][0], pts[k][1]);
          ctx.lineTo(pts[k + 1][0], pts[k + 1][1]);
        }
      }
    }
  }
  ctx.stroke();
  return c.toDataURL("image/png");
}

// The route: it weaves between the margins at every gap between sections, and draws itself to
// wherever the reader has scrolled.
function useRoute(root: React.RefObject<HTMLDivElement | null>) {
  const [geo, setGeo] = useState<{ w: number; h: number; d: string } | null>(null);
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const build = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const narrow = w < 760;
      // the route keeps to the margins beside each section and crosses only in the air between them
      const cw = Math.min(1240, w - 2 * Math.min(96, Math.max(20, w * 0.05)));
      const gutter = (w - cw) / 2;
      const left = narrow ? 14 : Math.max(18, gutter / 2);
      const right = w - left;
      const stops = Array.from(el.querySelectorAll<HTMLElement>("[data-stop]"));
      // along each section the route meanders down its margin; between sections it swings across
      let d = "";
      let prev: [number, number] | null = null;
      stops.forEach((sec, i) => {
        const r = sec.getBoundingClientRect();
        const first = (sec.firstElementChild as HTMLElement | null) ?? sec;
        const y0 = i === 0 ? 0 : first.getBoundingClientRect().top + window.scrollY - top - 36;
        const y1 = r.bottom + window.scrollY - top;
        const x = narrow ? left : i % 2 ? right : left;
        if (!prev) d = `M ${x} ${y0}`;
        else {
          const mid = (prev[1] + y0) / 2;
          d += ` C ${prev[0]} ${mid}, ${x} ${mid}, ${x} ${y0}`;
        }
        const legs = Math.max(1, Math.round((y1 - y0) / 260));
        const amp = narrow ? 4 : 9;
        for (let k = 1; k <= legs; k++) {
          const ya = y0 + ((k - 1) * (y1 - y0)) / legs;
          const yb = y0 + (k * (y1 - y0)) / legs;
          const sway = (k % 2 ? 1 : -1) * amp;
          d += ` C ${x + sway} ${ya + (yb - ya) / 3}, ${x + sway} ${ya + (2 * (yb - ya)) / 3}, ${x} ${yb}`;
        }
        prev = [x, y1];
      });
      setGeo({ w, h, d });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [root]);

  useEffect(() => {
    const p = path.current;
    const el = root.current;
    if (!p || !el || !geo) return;
    const total = p.getTotalLength();
    p.style.strokeDasharray = `${total}`;
    let raf = 0;
    const update = () => {
      raf = 0;
      // find the length along the route whose height matches the reading line
      const top = el.getBoundingClientRect().top + window.scrollY;
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      const target = atEnd ? Infinity : window.scrollY + window.innerHeight * 0.62 - top;
      let lo = 0;
      let hi = total;
      for (let k = 0; k < 22; k++) {
        const mid = (lo + hi) / 2;
        if (p.getPointAtLength(mid).y < target) lo = mid;
        else hi = mid;
      }
      p.style.strokeDashoffset = `${total - lo}`;
      const pt = p.getPointAtLength(lo);
      dot.current?.setAttribute("cx", String(pt.x));
      dot.current?.setAttribute("cy", String(pt.y));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [geo, root]);

  return { geo, path, dot };
}

export function ContourRun() {
  const root = useRef<HTMLDivElement>(null);
  const { geo, path, dot } = useRoute(root);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (root.current) root.current.style.backgroundImage = `url(${contourTile(1200, "rgba(53, 53, 53, 0.11)")})`;
  }, []);

  return (
    <main ref={root} className={s.root}>
      {geo && (
        <svg className={s.route} width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
          <path d={geo.d} className={s.routeGhost} />
          <path ref={path} d={geo.d} className={s.routeLine} />
          <circle ref={dot} r={6} className={s.runner} />
        </svg>
      )}

      <section className={s.intro} data-stop>
        <p className={s.statement}>{INTRO.statement}</p>
        <ul className={s.facts}>
          <li>{INTRO.facts[0]}</li>
          <li>{INTRO.facts[1]}</li>
          <li>
            <a href={LEETCODE_URL}>{INTRO.facts[2]}</a>
          </li>
        </ul>
      </section>

      <figure className={s.road} data-stop>
        <Image src={ROAD.day.src} alt={ROAD.day.alt} width={ROAD.day.w} height={ROAD.day.h} sizes="100vw" />
        <figcaption>{ROAD.caption}</figcaption>
      </figure>

      <section className={s.work} id="work" data-stop>
        <h2 className={s.h2}>{WORK.title}</h2>

        <article className={s.assistant}>
          <div className={s.copy}>
            <h3 className={s.h3}>{WORK.assistant.title}</h3>
            <p className={s.meta}>{WORK.assistant.facts}</p>
            {WORK.assistant.text.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <figure className={s.figure}>
            <MeetingReplay />
            <figcaption>{WORK.assistant.caption}</figcaption>
          </figure>
        </article>

        <article className={s.typestorm}>
          <figure className={s.figure}>
            <TypeTest />
            <figcaption>{WORK.typestorm.caption}</figcaption>
          </figure>
          <div className={s.copyRow}>
            <h3 className={s.h3}>{WORK.typestorm.title}</h3>
            <div>
              <p>{WORK.typestorm.text}</p>
              <p>
                <a className={s.link} href={WORK.typestorm.href}>
                  {WORK.typestorm.link}
                </a>
              </p>
            </div>
          </div>
        </article>

        <article className={s.redesign}>
          <div className={s.shots}>
            {WORK.redesign.images.map((im) => (
              <Image key={im.src} src={im.src} alt={im.alt} width={1800} height={1125} sizes="(max-width: 760px) 92vw, 46vw" />
            ))}
          </div>
          <div className={s.copy}>
            <h3 className={s.h3}>{WORK.redesign.title}</h3>
            <p className={s.meta}>{WORK.redesign.facts}</p>
            <p>{WORK.redesign.text}</p>
          </div>
        </article>
      </section>

      <section className={s.letter} data-stop>
        <h2 className={s.h2}>{LETTER.title}</h2>
        <div className={s.letterBody}>
          {LETTER.paras.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className={s.signature}>{LETTER.signature}</p>
        </div>
        <ol className={s.loop} aria-label={LETTER.loopCaption}>
          {LETTER.loop.map((l) => (
            <li key={l}>{l}</li>
          ))}
          <li aria-hidden="true">↺</li>
        </ol>
        <p className={s.loopCap}>{LETTER.loopCaption}</p>
      </section>

      <section className={s.desktop} id="desktop" data-stop>
        <div className={s.head}>
          <h2 className={s.h2}>{DESKTOP.title}</h2>
          <p className={s.lede}>{DESKTOP.lede}</p>
        </div>
        <figure className={s.figure}>
          <Rice />
          <figcaption>{DESKTOP.caption}</figcaption>
        </figure>
        <ol className={s.distros}>
          {DESKTOP.route.map((r) => (
            <li key={r.os}>
              <span className={s.pin} aria-hidden="true" />
              <p className={s.os}>{r.os}</p>
              <p>{r.text}</p>
            </li>
          ))}
        </ol>
        <div className={s.grub}>
          <p>{DESKTOP.grub}</p>
          <p className={s.links}>
            {DESKTOP.links.map((l) => (
              <a key={l.href} className={s.link} href={l.href}>
                {l.label}
              </a>
            ))}
          </p>
        </div>
      </section>

      <section className={s.method} id="anatomy" data-stop>
        <figure className={s.plate}>
          <Image src={METHOD.plate.src} alt={METHOD.plate.alt} width={METHOD.plate.w} height={METHOD.plate.h} sizes="(max-width: 760px) 60vw, 26vw" />
          <figcaption>{METHOD.plate.caption}</figcaption>
        </figure>
        <div>
          <h2 className={s.h2}>{METHOD.title}</h2>
          <p className={s.lede}>{METHOD.lede}</p>
          <div className={s.steps}>
            {METHOD.steps.map((x, i) => (
              <button key={x.body} className={i === step ? s.stepOn : s.step} onClick={() => setStep(i)} aria-pressed={i === step}>
                <span className={s.stepBody}>{x.body}</span>
                <span className={s.stepEng}>{x.eng}</span>
                <span className={s.stepText}>{x.text}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={s.kitchen} data-stop>
        <h2 className={s.h2}>{KITCHEN.title}</h2>
        <figure className={s.kitchenFig}>
          <Image src={KITCHEN.image.src} alt={KITCHEN.image.alt} width={KITCHEN.image.w} height={KITCHEN.image.h} sizes="(max-width: 760px) 92vw, 52vw" />
          <figcaption>{KITCHEN.caption}</figcaption>
        </figure>
        <p className={s.kitchenWords}>
          {KITCHEN.lines.slice(0, 3).join(" ")} <em>{KITCHEN.lines[3]}</em>
        </p>
      </section>

      <section className={s.fit} data-stop>
        <div className={s.head}>
          <h2 className={s.h2}>{FIT.title}</h2>
          <p className={s.lede}>{FIT.lede}</p>
        </div>
        <div className={s.services}>
          {FIT.services.map((x) => (
            <div key={x.name} className={s.service}>
              <h3 className={s.h3}>{x.name}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </div>
        <p className={s.sneakers}>{FIT.sneakers}</p>
      </section>

      <footer className={s.close} id="contact" data-stop>
        <h2 className={s.closeTitle}>{CLOSE.title}</h2>
        <p className={s.ask}>{FIT.ask}</p>
        <div className={s.actions}>
          <a className={s.btn} href={mailto("Hello Sumedh")}>
            {FIT.cta} <span aria-hidden="true">→</span>
          </a>
          <a className={s.link} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>
        <div className={s.foot}>
          <p>{CLOSE.foot}</p>
          <p className={s.links}>
            <a href={X_URL}>X</a>
            <a href={GITHUB_URL}>GitHub</a>
            <a href={LEETCODE_URL}>LeetCode</a>
            <a href={`mailto:${EMAIL}`}>Email</a>
          </p>
          <p className={s.credits}>{CLOSE.credits}</p>
        </div>
      </footer>
    </main>
  );
}
