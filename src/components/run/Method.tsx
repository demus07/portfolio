"use client";

import { useState } from "react";
import { METHOD } from "@/lib/content";
import { useInView } from "./useInView";
import g from "../ContourRun.module.css";
import s from "./Method.module.css";

// Three small moving drawings, one for each place the same four steps happen.
function Glyph({ kind }: { kind: string }) {
  if (kind === "Gym")
    return (
      <svg viewBox="0 0 64 40" className={s.glyph} aria-hidden="true">
        <g className={s.lift}>
          <path d="M8 20 H56" />
          <rect x="10" y="10" width="6" height="20" rx="2" />
          <rect x="48" y="10" width="6" height="20" rx="2" />
        </g>
      </svg>
    );
  if (kind === "Running")
    return (
      <svg viewBox="0 0 64 40" className={s.glyph} aria-hidden="true">
        <path d="M4 30 C 16 30, 18 10, 32 10 S 48 30, 60 30" className={s.track} />
        <circle r="4" className={s.runner}>
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M4 30 C 16 30, 18 10, 32 10 S 48 30, 60 30" />
        </circle>
      </svg>
    );
  return (
    <svg viewBox="0 0 64 40" className={s.glyph} aria-hidden="true">
      <path d="M18 10 L8 20 L18 30 M46 10 L56 20 L46 30" />
      <path d="M30 13 L34 13 M32 13 L32 27 M30 27 L34 27" className={s.caret} />
    </svg>
  );
}

// One small interface that is built in four passes as you read the four steps.
function Build({ step }: { step: number }) {
  return (
    <div className={s.build} data-step={step} data-ui aria-hidden="true">
      <div className={s.panel}>
        <div className={s.bar}>
          <span className={s.rec} />
          <span className={s.barText}>Sales call</span>
          <span className={s.barClock}>00:03</span>
        </div>
        <p className={s.heard}>Before we sign, does it support single sign-on?</p>
        <div className={s.answer}>
          <span className={s.answerFrom}>Suggested answer, from Security FAQ</span>
          <span className={s.answerText}>Yes, SAML on the Business plan.</span>
        </div>
        <div className={s.row}>
          <span className={s.btn}>Copy</span>
          <span className={s.btnGhost}>Open source</span>
        </div>
      </div>
    </div>
  );
}

export function Method() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const [stageRef, live] = useInView<HTMLDivElement>(0.4);
  const [step, setStep] = useState(0);

  return (
    <section className={`${g.section} ${s.method}`} id="anatomy" data-stop>
      <div ref={ref} className={`${s.head} ${seen ? "" : g.out}`}>
        <h2 className={`${g.h2} ${g.rise}`}>{METHOD.title}</h2>
        <div className={s.side}>
          <p className={`${g.lede} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
            {METHOD.lede}
          </p>
          <ul className={s.disciplines}>
            {METHOD.disciplines.map((d, i) => (
              <li key={d} className={g.rise} style={{ "--i": String(i + 2) } as React.CSSProperties}>
                <Glyph kind={d} />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* the four steps take turns in one place; the timer under the open step moves it on */}
      <div ref={stageRef} className={`${s.stage} ${live ? s.live : ""}`}>
        <ol className={s.steps}>
          {METHOD.steps.map((x, i) => (
            <li key={x.body} className={i === step ? s.stepOn : s.step}>
              <button type="button" className={s.stepHit} onClick={() => setStep(i)} aria-expanded={i === step}>
                <span className={s.stepBody}>{x.body}</span>
                <span className={s.stepEng}>{x.eng}</span>
              </button>
              <div className={s.stepMore}>
                <p className={s.stepText}>{x.text}</p>
              </div>
              {i === step && <span key={step} className={s.timer} onAnimationEnd={() => setStep((step + 1) % METHOD.steps.length)} />}
            </li>
          ))}
        </ol>
        <div className={s.sticky}>
          <Build step={step} />
        </div>
      </div>
    </section>
  );
}
