"use client";

import { Fragment, useEffect, useState } from "react";
import { INTRO, LEETCODE_URL } from "@/lib/content";
import { useInView } from "./useInView";
import s from "./Intro.module.css";

// Counts up to the real number once, when it comes into view.
function CountUp({ to, run }: { to: number; run: boolean }) {
  const [n, setN] = useState(to);
  useEffect(() => {
    if (!run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{n}</>;
}

// One sentence that builds itself word by word when it comes into view.
export function Statement({ className }: { className?: string }) {
  const [ref, seen] = useInView<HTMLParagraphElement>(0.5);
  return (
    <p ref={ref} className={`${s.statement} ${seen ? s.on : ""} ${className ?? ""}`}>
      {INTRO.statement.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span className={s.word} style={{ "--i": String(i) } as React.CSSProperties}>
            <span>{w}</span>
          </span>{" "}
        </Fragment>
      ))}
    </p>
  );
}

// Three plain facts, the kind printed along the foot of a business card.
export function Facts() {
  const [ref, seen] = useInView<HTMLDListElement>(0.4);
  const { work, place, leetcode } = INTRO.facts;

  return (
      <dl ref={ref} className={`${s.facts} ${seen ? s.on : ""}`}>
        <div className={s.fact} style={{ "--i": "0" } as React.CSSProperties}>
          <dt>{work.value}</dt>
          <dd>{work.note}</dd>
        </div>
        <div className={s.fact} style={{ "--i": "1" } as React.CSSProperties}>
          <dt>{place.value}</dt>
          <dd>{place.note}</dd>
        </div>
        <div className={s.fact} style={{ "--i": "2" } as React.CSSProperties}>
          <dt>
            <a href={LEETCODE_URL} className={s.count}>
              <CountUp to={leetcode.value} run={seen} />
              <span aria-hidden="true">↗</span>
            </a>
          </dt>
          <dd>{leetcode.note}</dd>
        </div>
      </dl>
  );
}
