"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { KITCHEN } from "@/lib/content";
import g from "../ContourRun.module.css";
import s from "./Kitchen.module.css";

const N = KITCHEN.ingredients.length;
// where each ingredient lies when it comes in raw: thrown across the counter (percent of the stage)
const RAW = [
  [6, 12, -14],
  [62, 4, 9],
  [30, 30, -6],
  [74, 38, 16],
  [4, 62, 8],
  [48, 70, -11],
  [80, 80, 5],
  [22, 88, -4],
];

function Ingredient({ label, i, p }: { label: string; i: number; p: MotionValue<number> }) {
  // plated: evenly round the rim of the plate, upright
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  const px = 50 + Math.cos(a) * 33;
  const py = 50 + Math.sin(a) * 33;
  const [rx, ry, rr] = RAW[i];
  const start = 0.1 + i * 0.03;
  const end = start + 0.38;
  const left = useTransform(p, [start, end], [`${rx}%`, `${px}%`]);
  const top = useTransform(p, [start, end], [`${ry}%`, `${py}%`]);
  const rotate = useTransform(p, [start, end], [rr, 0]);
  const x = useTransform(p, [start, end], ["0%", "-50%"]);
  const y = useTransform(p, [start, end], ["0%", "-50%"]);
  return (
    <motion.span className={s.chip} style={{ left, top, rotate, x, y }}>
      {label}
    </motion.span>
  );
}

function Line({ text, i, p }: { text: string; i: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.08 + i * 0.16, 0.2 + i * 0.16], [0.18, 1]);
  return (
    <motion.span className={s.line} style={{ opacity }}>
      {text}{" "}
    </motion.span>
  );
}

// Raw ingredients thrown on the counter; as you read, they are plated, one by one.
export function Kitchen() {
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const plate = useTransform(p, [0.3, 0.75], [0.9, 1]);
  const plateTone = useTransform(p, [0.3, 0.75], [0, 1]);

  return (
    <section className={`${g.section} ${s.kitchen}`} data-stop>
      <div ref={stage} className={s.scroll}>
        <div className={s.sticky}>
          <div className={s.words}>
            <h2 className={g.h2}>{KITCHEN.title}</h2>
            <p className={s.lines}>
              {KITCHEN.lines.map((t, i) => (
                <Line key={t} text={t} i={i} p={p} />
              ))}
            </p>
          </div>
          <div className={s.counter} aria-hidden="true">
            <motion.div className={s.plate} style={{ scale: plate, opacity: plateTone }} />
            {KITCHEN.ingredients.map((label, i) => (
              <Ingredient key={label} label={label} i={i} p={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
