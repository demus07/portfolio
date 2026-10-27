"use client";

import { Rice } from "../Desktop";
import { DESKTOP } from "@/lib/content";
import { useInView } from "./useInView";
import g from "../ContourRun.module.css";
import s from "./Roots.module.css";

// A gear outline: n teeth on pitch radius r. Every gear shares one tooth pitch, so they mesh.
function gearPath(n: number, r: number) {
  const h = 9;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const t = (Math.PI * 2) / n;
    const at = (ang: number, rad: number) => `${(Math.cos(ang) * rad).toFixed(2)} ${(Math.sin(ang) * rad).toFixed(2)}`;
    pts.push(at(a, r - h / 2), at(a + t * 0.18, r + h / 2), at(a + t * 0.48, r + h / 2), at(a + t * 0.66, r - h / 2));
  }
  return `M ${pts.join(" L ")} Z`;
}

// Two gears meshed to a driver. Each one is turned so that a tooth of the driver meets a gap of
// its own at the point of contact, then spun at the driver's speed scaled by the tooth counts.
const DRIVER = { n: 14, r: 70 };
function meshed(n: number, r: number, theta: number) {
  const tA = (Math.PI * 2) / DRIVER.n;
  const tB = (Math.PI * 2) / n;
  const f = ((((theta - 0.33 * tA) / tA) % 1) + 1) % 1;
  const phase = theta + Math.PI - 0.33 * tB - (0.5 - f) * tB;
  const d = DRIVER.r + r;
  return { n, r, x: Math.cos(theta) * d, y: Math.sin(theta) * d, dur: n, dir: -1, phase: (phase * 180) / Math.PI };
}
const GEARS = [{ ...DRIVER, x: 0, y: 0, dur: DRIVER.n, dir: 1, phase: 0 }, meshed(9, 45, -0.5), meshed(20, 100, 2.3)];

function Gears({ run }: { run: boolean }) {
  return (
    <svg className={`${s.gears} ${run ? s.spin : ""}`} viewBox="-250 -180 420 380" aria-hidden="true">
      {GEARS.map((gear, i) => (
        <g key={i} transform={`translate(${gear.x.toFixed(1)} ${gear.y.toFixed(1)})`}>
          <g
            className={s.gear}
            style={{ "--dur": `${gear.dur}s`, "--dir": gear.dir === 1 ? "normal" : "reverse", "--phase": `${gear.phase.toFixed(2)}deg` } as React.CSSProperties}
          >
            <path d={gearPath(gear.n, gear.r)} />
            <circle r={gear.r * 0.32} />
            <circle r={4} className={s.axle} />
          </g>
        </g>
      ))}
    </svg>
  );
}

export function Roots() {
  const [funRef, funSeen] = useInView<HTMLDivElement>(0.4);
  const [ref, seen] = useInView<HTMLDivElement>(0.15);
  return (
    <section className={`${g.section} ${s.roots}`} id="desktop" data-stop>
      <div ref={funRef} className={`${s.fun} ${funSeen ? "" : g.out}`}>
        <div className={g.rise}>
          <Gears run={funSeen} />
        </div>
        <div className={s.funText}>
          <p className={`${s.funLine} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
            {DESKTOP.fun.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className={`${s.grub} ${g.rise}`} style={{ "--i": "2" } as React.CSSProperties}>
            {DESKTOP.grub}
          </p>
        </div>
      </div>

      <div ref={ref} className={`${s.body} ${seen ? "" : g.out}`}>
        <div className={s.head}>
          <h2 className={`${g.h2} ${g.rise}`}>{DESKTOP.title}</h2>
          <p className={`${g.lede} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
            {DESKTOP.lede}
          </p>
        </div>
        <figure className={`${s.figure} ${g.rise}`} style={{ "--i": "2" } as React.CSSProperties}>
          <Rice />
          <figcaption className={g.caption}>{DESKTOP.caption}</figcaption>
        </figure>
        <ol className={s.distros}>
          {DESKTOP.route.map((r, i) => (
            <li key={r.os} className={g.rise} style={{ "--i": String(i + 3) } as React.CSSProperties}>
              <span className={s.pin} aria-hidden="true" />
              <p className={s.os}>{r.os}</p>
              <p>{r.text}</p>
            </li>
          ))}
        </ol>
        <p className={s.links}>
          {DESKTOP.links.map((l) => (
            <a key={l.href} className={g.link} href={l.href}>
              {l.label}
            </a>
          ))}
        </p>
      </div>
    </section>
  );
}
