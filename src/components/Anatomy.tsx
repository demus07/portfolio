"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/*
 * How I work, mapped onto a body. One screen, no scroll-jacking: pick a step (click, tap or arrow
 * keys) and the plate moves to it. When the plate first comes into view it gives itself one short
 * tour; any interaction ends the tour. Points are fractions of the Vesalius plate (928 × 1600).
 */
const SYSTEMS = [
  {
    body: "Eyes",
    eng: "Picture the finished thing",
    text: "Before any code, I see the end result: what it does, how it feels, what someone says after using it.",
    at: { x: 0.565, y: 0.105 },
  },
  {
    body: "Skeleton",
    eng: "Work backwards",
    text: "From the finish line back to today. The first decisions are about what not to build.",
    at: { x: 0.47, y: 0.56 },
  },
  {
    body: "Muscles",
    eng: "Start messy",
    text: "Strength comes from reps, not plans. A rough version that runs beats a perfect one on paper, so it ships rough and early.",
    at: { x: 0.33, y: 0.36 },
  },
  {
    body: "Skin",
    eng: "Then make it elegant",
    text: "The surface is what people touch first. UI, type and motion are the part I never cut, even on a deadline.",
    at: { x: 0.19, y: 0.52 },
  },
];

const DWELL = 3200;

export function Anatomy() {
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [touring, setTouring] = useState(false);
  const toured = useRef(false);

  const choose = useCallback((i: number, focus = false) => {
    setTouring(false);
    setActive(i);
    if (focus) tabs.current[i]?.focus();
  }, []);

  // one short tour the first time the plate is properly in view
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !toured.current) {
          toured.current = true;
          setTouring(true);
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!touring) return;
    const id = window.setTimeout(() => {
      if (active >= SYSTEMS.length - 1) setTouring(false);
      else setActive(active + 1);
    }, DWELL);
    return () => window.clearTimeout(id);
  }, [touring, active]);

  const onKey = (e: React.KeyboardEvent) => {
    const n = SYSTEMS.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      choose((active + 1) % n, true);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      choose((active - 1 + n) % n, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      choose(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      choose(n - 1, true);
    }
  };

  const s = SYSTEMS[active];

  return (
    <section
      ref={root}
      className="anatomy"
      id="anatomy"
      aria-labelledby="anatomy-title"
    >
      <h2 id="anatomy-title" className="section-title" data-reveal>
        I build software the way I train
      </h2>
      <div className="anatomy-grid">
        <div className="anatomy-intro">
          <p
            className="anatomy-lede"
            data-reveal
            style={{ "--d": "1" } as React.CSSProperties}
          >
            Gym, running, code: the same four steps. See the result, plan
            back from it, put in the messy reps, then refine.
          </p>
          <div
            className="anatomy-index"
            role="tablist"
            aria-label="The four steps, mapped onto a body"
            aria-orientation="vertical"
            onKeyDown={onKey}
            data-reveal
            style={{ "--d": "2" } as React.CSSProperties}
          >
            {SYSTEMS.map((x, i) => (
              <button
                key={x.body}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`sys-${i}`}
                aria-selected={i === active}
                aria-controls="anatomy-panel"
                tabIndex={i === active ? 0 : -1}
                className={i === active ? "is-active" : ""}
                onClick={() => choose(i)}
              >
                <span className="sys-body">{x.body}</span>
                <span className="sys-eng">{x.eng}</span>
                {i === active && touring && (
                  <span
                    className="sys-progress"
                    style={{ animationDuration: `${DWELL}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="plate" data-reveal>
          <div className="plate-zoom">
            <div
              className="plate-inner"
              style={{ transformOrigin: `${s.at.x * 100}% ${s.at.y * 100}%` }}
            >
              <Image
                src="/archive/vesalius-muscle-man.jpg"
                alt="An anatomical woodcut by Andreas Vesalius, 1543: a standing figure with every muscle drawn."
                width={928}
                height={1600}
                sizes="(max-width: 900px) 70vw, 30vw"
              />
              {SYSTEMS.map((x, i) => (
                <button
                  key={x.body}
                  type="button"
                  tabIndex={-1}
                  aria-label={`${x.body}: ${x.eng}`}
                  className={`plate-pin${i === active ? " is-active" : ""}`}
                  style={{ left: `${x.at.x * 100}%`, top: `${x.at.y * 100}%` }}
                  onClick={() => choose(i)}
                />
              ))}
            </div>
          </div>
          <p className="plate-caption">
            Andreas Vesalius, De humani corporis fabrica, 1543
          </p>
        </div>

        <div
          className="anatomy-notes"
          id="anatomy-panel"
          role="tabpanel"
          aria-labelledby={`sys-${active}`}
          aria-live="polite"
        >
          <h3 key={`b${active}`} className="note-body">
            The {s.body.toLowerCase()}
          </h3>
          <p key={`e${active}`} className="note-eng">
            <span className="note-arrow" aria-hidden="true" />
            {s.eng}
          </p>
          <p key={`t${active}`} className="note-text">
            {s.text}
          </p>
        </div>
      </div>
    </section>
  );
}
