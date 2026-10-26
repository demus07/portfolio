"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

type Part = { text: string; em?: boolean };

function Word({ children, progress, range, em }: { children: string; progress: MotionValue<number>; range: [number, number]; em?: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const Tag = em ? motion.em : motion.span;
  return (
    <Tag className="sw-word" style={{ opacity }}>
      {children}{" "}
    </Tag>
  );
}

// A statement whose words light up one by one as it scrolls through the screen.
export function ScrollWords({ parts, className }: { parts: Part[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = parts.flatMap((p) => p.text.split(" ").filter(Boolean).map((w) => ({ w, em: p.em })));

  return (
    <p ref={ref} className={className}>
      {words.map((x, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} em={x.em}>
          {x.w}
        </Word>
      ))}
    </p>
  );
}
