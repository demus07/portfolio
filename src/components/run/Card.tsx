"use client";

import { useRef } from "react";
import { EMAIL, GITHUB_URL, LETTER, X_URL } from "@/lib/content";
import { useInView } from "./useInView";
import { Facts } from "./Intro";
import g from "../ContourRun.module.css";
import s from "./Card.module.css";

const R = 120;

// The loop drawn as a ring: a runner goes round for good, and each step lights as it passes.
function Ring() {
  const steps = LETTER.loop;
  return (
    <figure className={s.ring}>
      <svg viewBox="-200 -200 400 400" role="img" aria-label={`${steps.join(", ")}, and round again.`}>
        <circle r={R} className={s.track} />
        <g className={s.orbit}>
          <path d={`M 0 ${-R} A ${R} ${R} 0 0 1 ${(R * Math.sin(1.1)).toFixed(1)} ${(-R * Math.cos(1.1)).toFixed(1)}`} className={s.trail} />
          <circle cy={-R} r={7} className={s.dot} />
        </g>
        {steps.map((step, i) => {
          const a = (i / steps.length) * Math.PI * 2;
          const x = Math.sin(a) * R;
          const y = -Math.cos(a) * R;
          const lx = Math.sin(a) * (R + 26);
          const ly = -Math.cos(a) * (R + 26);
          const anchor = Math.abs(lx) < 10 ? "middle" : lx > 0 ? "start" : "end";
          return (
            <g key={step} className={s.step} style={{ "--i": String(i) } as React.CSSProperties}>
              <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={4} className={s.node} />
              <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={anchor} dominantBaseline="middle" className={s.label}>
                {step}
              </text>
            </g>
          );
        })}
        <text y={-6} textAnchor="middle" className={s.centre}>
          ship it,
        </text>
        <text y={22} textAnchor="middle" className={s.centre}>
          then again
        </text>
      </svg>
      <figcaption className={g.caption}>{LETTER.loopCaption}</figcaption>
    </figure>
  );
}

// The letter, set on a card like the one I would hand you, with the loop on its right half.
export function Card() {
  const [ref, seen] = useInView<HTMLElement>(0.2);
  const card = useRef<HTMLDivElement>(null);

  // the card leans a little towards the pointer, the way a card does in the hand
  const onMove = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 3).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 4).toFixed(2)}deg`);
  };
  const onLeave = () => {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <section ref={ref} className={`${g.section} ${s.section} ${seen ? "" : g.out}`} id="about" data-stop>
      <div ref={card} className={`${s.card} ${g.rise}`} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className={s.face}>
          <div className={s.who}>
            <p className={s.name}>Sumedh Kudav</p>
            <p className={s.role}>Software engineer, Sypha AI · Mumbai</p>
          </div>
          <h2 className={s.title}>{LETTER.title}</h2>
          <div className={s.letter}>
            {LETTER.paras.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className={s.signature}>{LETTER.signature}</p>
          <p className={s.contact}>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href={X_URL}>X</a>
            <a href={GITHUB_URL}>GitHub</a>
          </p>
        </div>
        <Ring />
        <div className={s.facts}>
          <Facts />
        </div>
      </div>
    </section>
  );
}
