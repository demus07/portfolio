"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { KITCHEN } from "@/lib/content";
import { Painted } from "../paint/Painted";
import { kitchenLayout, paintKitchen } from "../paint/kitchen";
import g from "../ContourRun.module.css";
import s from "./Kitchen.module.css";

// where each ingredient lies when it comes in raw, thrown on the wall: left %, top %, tilt
const RAW = [
  [6, 50, -12],
  [24, 46, 8],
  [36, 58, -5],
  [9, 64, 10],
  [27, 70, -8],
  [38, 80, 6],
  [4, 78, -4],
  [18, 86, 9],
];
const RAW_NARROW = [
  [4, 30, -8],
  [40, 33, 6],
  [66, 29, -10],
  [10, 86, 8],
  [44, 90, -6],
  [68, 85, 10],
  [22, 35, 4],
  [60, 93, -4],
];

type Spot = { narrow: boolean; x: number; y: number };

// one ingredient: thrown on the wall, then in through the window and onto the plate
function Chip({ label, i, p, spot }: { label: string; i: number; p: MotionValue<number>; spot: Spot | null }) {
  const [rx, ry, rr] = (spot?.narrow ? RAW_NARROW : RAW)[i];
  const start = 0.1 + i * 0.035;
  const end = start + 0.24;
  const left = useTransform(p, [start, end], [`${rx}%`, `${spot?.x ?? 70}%`]);
  const top = useTransform(p, [start, end], [`${ry}%`, `${spot?.y ?? 70}%`]);
  const rotate = useTransform(p, [start, end], [rr, 0]);
  const scale = useTransform(p, [start, end], [1, 0.3]);
  const opacity = useTransform(p, [end - 0.04, end], [1, 0]);
  const x = useTransform(p, [start, end], ["0%", "-50%"]);
  const y = useTransform(p, [start, end], ["0%", "-50%"]);
  return (
    <motion.span className={s.chip} style={{ left, top, rotate, scale, opacity, x, y }}>
      {label}
    </motion.span>
  );
}

// A restaurant window on a Mumbai street. The ingredients thrown on the wall go in through the
// glass as you scroll, and come out on the plate as a meal.
export function Kitchen() {
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const lineOpacity = useTransform(p, [0.6, 0.72], [0, 1]);
  const lineY = useTransform(p, [0.6, 0.72], [16, 0]);
  const [spot, setSpot] = useState<Spot | null>(null);
  const onSize = useCallback((w: number, h: number) => {
    const { narrow, plate } = kitchenLayout(w, h);
    setSpot({ narrow, x: (plate.x / w) * 100, y: (plate.y / h) * 100 });
  }, []);

  return (
    <section className={s.kitchen} data-stop>
      <div ref={stage} className={s.scroll}>
        <div className={s.sticky}>
          <Painted
            className={s.scene}
            paint={paintKitchen}
            progress={p}
            live
            onSize={onSize}
            label="A painted restaurant window on a Mumbai street at night. Ingredients thrown on the wall outside go in through the glass and come out as a plated dish under the lamp."
          >
            <div className={s.words}>
              <h2 className={g.h2}>{KITCHEN.title}</h2>
              <motion.p className={s.line} style={{ opacity: lineOpacity, y: lineY }}>
                {KITCHEN.line}
              </motion.p>
            </div>
            <div className={s.chips} aria-hidden="true">
              {spot &&
                KITCHEN.ingredients.map((label, i) => <Chip key={`${label}${spot.narrow}`} label={label} i={i} p={p} spot={spot} />)}
            </div>
          </Painted>
        </div>
      </div>
    </section>
  );
}
