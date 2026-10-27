"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MeetingReplay } from "../MeetingReplay";
import { TypeTest } from "../TypeTest";
import { WORK } from "@/lib/content";
import { useInView } from "./useInView";
import { Statement } from "./Intro";
import g from "../ContourRun.module.css";
import s from "./Work.module.css";

function Assistant() {
  const [ref, seen] = useInView<HTMLElement>(0.25);
  const a = WORK.assistant;
  return (
    <article ref={ref} className={`${s.assistant} ${seen ? "" : g.out}`}>
      <div className={s.copy}>
        <h3 className={`${g.h3} ${g.rise}`}>{a.title}</h3>
        <p className={`${g.meta} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
          {a.facts}
        </p>
        {a.text.map((t, i) => (
          <p key={t} className={g.rise} style={{ "--i": String(i + 2) } as React.CSSProperties}>
            {t}
          </p>
        ))}
      </div>
      <figure className={`${s.figure} ${g.rise}`} style={{ "--i": "2" } as React.CSSProperties}>
        <MeetingReplay />
        <figcaption className={g.caption}>{a.caption}</figcaption>
      </figure>
    </article>
  );
}

// Typestorm on its own stage, in its own colours, with the real thing one click away.
function Typestorm() {
  const [ref, seen] = useInView<HTMLElement>(0.2);
  const t = WORK.typestorm;
  return (
    <article ref={ref} className={`${s.stage} ${seen ? "" : g.out}`}>
      <div className={s.stageHead}>
        <h3 className={`${g.h3} ${g.rise}`}>{t.title}</h3>
        <div className={`${s.stageText} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
          <p>{t.text}</p>
          <p className={s.actions}>
            <a className={s.live} href={t.liveHref} target="_blank" rel="noreferrer">
              {t.live} <span aria-hidden="true">↗</span>
            </a>
            <a className={s.code} href={t.href} target="_blank" rel="noreferrer">
              {t.link}
            </a>
          </p>
        </div>
      </div>
      <div className={`${s.test} ${g.rise}`} style={{ "--i": "2" } as React.CSSProperties}>
        <TypeTest />
      </div>
      <p className={s.stageCap}>{t.caption}</p>
    </article>
  );
}

// The redesign in a browser window, settling into place as it scrolls up the screen.
function Redesign() {
  const [ref, seen] = useInView<HTMLElement>(0.2);
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.55], [1.12, 1]);
  const lift = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const r = WORK.redesign;
  return (
    <article ref={ref} className={`${s.redesign} ${seen ? "" : g.out}`}>
      <div className={s.redesignHead}>
        <h3 className={`${g.h3} ${g.rise}`}>{r.title}</h3>
        <div className={`${s.redesignText} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
          <p className={g.meta}>{r.facts}</p>
          <p>{r.text}</p>
        </div>
      </div>
      <motion.div ref={frame} className={s.browser} style={{ y: lift }} data-ui>
        <div className={s.chrome} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className={s.viewport}>
          <motion.div className={s.shot} style={{ scale }}>
            <Image src={r.image.src} alt={r.image.alt} width={1800} height={1125} sizes="(max-width: 760px) 92vw, 1240px" />
          </motion.div>
        </div>
      </motion.div>
    </article>
  );
}

export function Work() {
  const [ref, seen] = useInView<HTMLHeadingElement>(0.5);
  return (
    <section className={`${g.section} ${s.work}`} id="work" data-stop>
      <div className={s.workHead}>
        <h2 ref={ref} className={`${g.h2} ${g.rise} ${seen ? "" : g.out}`}>
          {WORK.title}
        </h2>
        <Statement />
      </div>
      <Assistant />
      <Typestorm />
      <Redesign />
    </section>
  );
}
