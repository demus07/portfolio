"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { METHOD } from "@/lib/content";
import { Scene } from "../paint/Scene";
import { paintRun, runLayout } from "../paint/run";
import x from "./Scenes.module.css";
import s from "./Method.module.css";

// the scroll at which the runner reaches a lamp standing at share f of the width (the inverse of runnerAt)
const reach = (f: number) => 0.04 + (f - 0.01 + 0.04) * 0.86;

function Pass({ text, f, p, left, top }: { text: string; f: number; p: MotionValue<number>; left: number; top: number }) {
  const at = reach(f);
  const opacity = useTransform(p, [at - 0.04, at], [0.38, 1]);
  const y = useTransform(p, [at - 0.04, at], [8, 0]);
  return (
    <motion.p className={s.pass} style={{ left, top, opacity, y }}>
      {text}
    </motion.p>
  );
}

// A run along the promenade. Scroll, and the runner goes past four lamps, one for each pass I make
// at a thing; each lamp lights, and its step with it, as they reach it.
export function Method() {
  const pin = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: pin, offset: ["start start", "end end"] });
  return (
    <section className={x.full} id="anatomy" data-stop>
      <div ref={pin} className={s.pin}>
        <div className={s.sticky}>
          <Scene
            className={s.fill}
            paint={paintRun}
            layout={runLayout}
            progress={p}
            label="A painted runner on the Marine Drive promenade, the bay behind. As you scroll they run past four lamps, which light one by one: picture the finished thing, work backwards, start messy, then make it elegant."
          >
            {(l) => (
              <>
                <div className={x.over}>
                  <h2 className={x.title}>{METHOD.title}</h2>
                  <p className={x.line}>{METHOD.lede}</p>
                </div>
                {METHOD.steps.map((step, i) => (
                  <Pass key={`${step.eng}${l.narrow}`} text={step.eng} f={l.lamps[i].f} p={p} left={l.lamps[i].x} top={l.lamps[i].y + 18} />
                ))}
              </>
            )}
          </Scene>
        </div>
      </div>
    </section>
  );
}
