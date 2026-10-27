"use client";

import { FIT, mailto } from "@/lib/content";
import { useInView } from "./useInView";
import g from "../ContourRun.module.css";
import s from "./Fit.module.css";

export function Fit() {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const [bandRef, bandSeen] = useInView<HTMLDivElement>(0.35);
  return (
    <>
      <section className={`${g.section} ${s.fit}`} id="fit" data-stop>
        <div ref={ref} className={`${s.inner} ${seen ? "" : g.out}`}>
          <div className={s.head}>
            <h2 className={`${g.h2} ${g.rise}`}>{FIT.title}</h2>
            <p className={`${g.lede} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
              {FIT.lede}
            </p>
          </div>
          <div className={s.services}>
            {FIT.services.map((x, i) => (
              <article key={x.name} className={`${s.service} ${g.rise}`} style={{ "--i": String(i + 2) } as React.CSSProperties}>
                <h3 className={s.name}>{x.name}</h3>
                <p className={s.text}>{x.text}</p>
                <ul className={s.parts}>
                  {x.parts.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* the sneakers, told slowly, on a dark field */}
      <section className={s.band} aria-label="Why not the cheaper version" data-stop>
        <div ref={bandRef} className={`${s.bandInner} ${bandSeen ? s.seen : ""}`}>
          {/* one paragraph that reads itself in a sentence at a time, then the line lands */}
          <p className={s.story}>
            {FIT.sneakers.map((line, i) => (
              <span key={line} className={s.sentence} style={{ "--i": String(i) } as React.CSSProperties}>
                {line}{" "}
              </span>
            ))}
          </p>
          <p className={s.real}>{FIT.sneakersEnd}</p>
          <div className={s.ask}>
            <p>{FIT.ask}</p>
            <a className={s.btn} href={mailto("Hello Sumedh")}>
              {FIT.cta} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
