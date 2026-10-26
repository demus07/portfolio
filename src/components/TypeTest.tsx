"use client";

import { useEffect, useRef, useState } from "react";

// A small working Typestorm: click in and type. The first time it scrolls into view it types the
// line once on its own, so the plate is never a still picture.
const TEXT = "start messy fail fast ship faster learn and iterate then do it all again with taste";

// each word with the index of its first letter in TEXT
const WORDS = TEXT.split(" ").map((w, i, all) => ({ w, start: all.slice(0, i).join(" ").length + (i ? 1 : 0) }));

type Run = { typed: string; startedAt: number | null; endedAt: number | null; ghost: boolean };
const fresh = (ghost = false): Run => ({ typed: "", startedAt: null, endedAt: null, ghost });

function score(r: Run) {
  if (!r.startedAt || !r.endedAt) return null;
  let right = 0;
  for (let i = 0; i < r.typed.length; i++) if (r.typed[i] === TEXT[i]) right++;
  const mins = (r.endedAt - r.startedAt) / 60000;
  return { wpm: Math.round(right / 5 / mins), acc: Math.round((right / TEXT.length) * 100) };
}

export function TypeTest() {
  const [run, setRun] = useState<Run>(fresh);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const ghost = useRef<number | null>(null);

  const stopGhost = () => {
    if (ghost.current) window.clearTimeout(ghost.current);
    ghost.current = null;
  };

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        const t0 = performance.now();
        setRun({ ...fresh(true), startedAt: t0 });
        let i = 0;
        const step = () => {
          i++;
          const now = performance.now();
          setRun((r) => (r.ghost ? { ...r, typed: TEXT.slice(0, i), endedAt: i >= TEXT.length ? now : null } : r));
          if (i < TEXT.length) ghost.current = window.setTimeout(step, TEXT[i] === " " ? 150 : 55 + Math.random() * 70);
        };
        ghost.current = window.setTimeout(step, 600);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stopGhost();
    };
  }, []);

  const begin = () => {
    stopGhost();
    setRun(fresh());
    input.current?.focus();
  };

  const onInput = (value: string) => {
    setRun((r) => {
      if (r.endedAt || r.ghost) return r;
      const typed = value.slice(0, TEXT.length);
      const now = performance.now();
      return {
        ...r,
        typed,
        startedAt: r.startedAt ?? now,
        endedAt: typed.length >= TEXT.length ? now : null,
      };
    });
  };

  const result = score(run);
  const done = run.endedAt !== null;

  return (
    <div
      ref={root}
      data-ui
      className={`typestorm${focused ? " is-focused" : ""}${run.typed && !done ? " is-typing" : ""}`}
      onClick={() => (done || run.ghost ? begin() : input.current?.focus())}
    >
      <div className="ts-head">
        <span className="ts-logo">
          type<em>storm</em>
        </span>
        <span className="ts-mode">
          {done && result ? (
            <>
              <b>{result.wpm}</b> wpm <b>{result.acc}%</b> acc
            </>
          ) : (
            <>
              {run.typed.split(" ").length - 1}/{WORDS.length}
            </>
          )}
        </span>
      </div>

      <p className="ts-words" aria-hidden="true">
        {WORDS.map(({ w, start }, wi) => {
          return (
            <span key={wi} className="ts-word">
              {[...w, ...(wi < WORDS.length - 1 ? [" "] : [])].map((ch, ci) => {
                const i = start + ci;
                const t = run.typed[i];
                const cls = t === undefined ? "" : t === ch ? "is-right" : "is-wrong";
                return (
                  <span key={ci} className={`ts-ch ${cls}${i === run.typed.length && !done ? " is-caret" : ""}`}>
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        })}
      </p>

      <input
        ref={input}
        className="ts-input"
        value={run.typed}
        onChange={(e) => onInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            begin();
          }
        }}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        aria-label={`Typing test. Type: ${TEXT}`}
      />

      <p className="ts-foot">
        {done ? (
          run.ghost ? "That was a replay. Click to try it yourself." : "Click or press tab to go again."
        ) : run.ghost ? (
          "Click to take over"
        ) : focused ? (
          "Tab restarts"
        ) : (
          "Click to focus"
        )}
      </p>
    </div>
  );
}
