"use client";

import { useRef } from "react";
import { EMAIL, GITHUB_URL, LETTER, X_URL } from "@/lib/content";
import { useInView } from "./useInView";
import { Facts } from "./Intro";
import { Scene } from "../paint/Scene";
import { necklaceLayout, paintNecklace } from "../paint/necklace";
import x from "./Scenes.module.css";
import g from "../ContourRun.module.css";
import s from "./Card.module.css";

// The loop I work in, as lights along the Queen's Necklace: a light runs the curve for good, and
// each step of the loop is a stop it lights on the way round.
function Necklace() {
  return (
    <Scene
      className={x.scene}
      paint={paintNecklace}
      layout={necklaceLayout}
      label={`The Queen's Necklace from Malabar Hill, Marine Drive curving round the bay. A light runs along it, through ${LETTER.loop.join(", ")}, and round again.`}
    >
      {(l) => (
        <>
          {l.steps.map((p, i) => (
            <span key={LETTER.loop[i]} className={s.stop} style={{ left: p.x, top: p.y }}>
              {LETTER.loop[i]}
            </span>
          ))}
          <p className={s.loopCaption}>{LETTER.loopCaption}</p>
        </>
      )}
    </Scene>
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
    <section ref={ref} className={`${s.section} ${x.full} ${seen ? "" : g.out}`} id="about" data-stop>
      <Necklace />
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
        <div className={s.facts}>
          <Facts />
        </div>
      </div>
    </section>
  );
}
