"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { METHOD } from "@/lib/content";
import { Scene } from "../paint/Scene";
import { lampAt, passAt, paintRun, runLayout, RUNNER_X } from "../paint/run";
import x from "./Scenes.module.css";
import s from "./Method.module.css";

// a step, written on the walk under its lamp: it slides past with the lamp, and brightens as it lights
function Pass({ text, i, run, w, top }: { text: string; i: number; run: MotionValue<number>; w: number; top: number }) {
  const left = useTransform(run, (e) => lampAt(i, e) * w);
  const opacity = useTransform(run, (e) => 0.3 + 0.7 * Math.min(1, Math.max(0, (e - passAt(i)) / 0.25)));
  return (
    <motion.p className={s.pass} style={{ left, top, opacity }}>
      {text}
    </motion.p>
  );
}

// once the four steps are behind him, he keeps going, and says so
function Aside({ run, w, top }: { run: MotionValue<number>; w: number; top: number }) {
  const start = passAt(3) + 1.6;
  const opacity = useTransform(run, (e) => Math.min(1, Math.max(0, (e - start) / 0.6)));
  const y = useTransform(run, (e) => 10 * (1 - Math.min(1, Math.max(0, (e - start) / 0.6))));
  return (
    <motion.p className={s.aside} style={{ left: RUNNER_X * w, top, opacity, y }}>
      {METHOD.aside}
    </motion.p>
  );
}

// A run along the promenade, the camera running alongside. It starts when it comes into view and
// never stops: four lamps come past, one for each pass I make at a thing, each lighting, with its
// step, as the runner goes under it; after that he just keeps running.
export function Method() {
  const ref = useRef<HTMLElement>(null);
  const run = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      run.set(passAt(3) + 3);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      run.set((now - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    // the run starts over each time the scene comes back into view
    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf);
        if (!e.isIntersecting) return;
        t0 = performance.now();
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [run]);

  return (
    <section ref={ref} className={x.full} id="anatomy" data-stop>
      <Scene
        className={s.scene}
        paint={paintRun}
        layout={runLayout}
        progress={run}
        live={false}
        label="A painted runner on the Marine Drive promenade at night or by day, the bay behind, the camera running with them past four lamps that light one by one: picture the finished thing, work backwards, start messy, then make it elegant. Then they keep running."
      >
        {(l) => (
          <>
            <div className={x.over}>
              <h2 className={x.title}>{METHOD.title}</h2>
              <p className={x.line}>{METHOD.lede}</p>
            </div>
            {METHOD.steps.map((step, i) => (
              <Pass key={`${step.eng}${l.w}`} text={step.eng} i={i} run={run} w={l.w} top={l.narrow ? l.wall + l.h * 0.04 : l.floor + 18} />
            ))}
            <Aside run={run} w={l.w} top={l.floor - (l.narrow ? 0.15 : 0.22) * l.h - 16} />
          </>
        )}
      </Scene>
    </section>
  );
}
