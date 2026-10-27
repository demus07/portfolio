"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MarineDrive } from "./MarineDrive";
import { mailto } from "@/lib/site";
import { useTheme } from "@/lib/useTheme";

// A film opening: the bay at dusk, a title card, then the camera pushes in on the sea wall.
export function Opening() {
  const ref = useRef<HTMLElement>(null);
  const [theme] = useTheme();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.22], ["0vh", "-8vh"]);
  const titleSpacing = useTransform(scrollYProgress, [0, 0.22], ["0em", "0.06em"]);
  const noteOpacity = useTransform(scrollYProgress, [0.22, 0.32, 0.58, 0.68], [0, 1, 1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <header ref={ref} className="opening" id="top">
      <div className="opening-stage">
        <MarineDrive
          variant={theme === "dark" ? "night" : "morning"}
          progress={scrollYProgress}
          caption={
            <motion.p className="note" style={{ opacity: noteOpacity }}>
              <span>
                that&rsquo;s me,
                <br />
                probably debugging
              </span>
              <svg viewBox="0 0 120 80" aria-hidden="true" className="note-line">
                <path d="M4 8 C 50 8, 92 34, 116 76" />
              </svg>
            </motion.p>
          }
        />
        <div className="opening-shade" />

        <motion.div className="title-card" style={{ opacity: titleOpacity, y: titleY }}>
          <p className="title-kicker open-in" style={{ "--d": "0" } as React.CSSProperties}>
            A portfolio, painted in Mumbai
          </p>
          <motion.h1 className="title-name open-in" style={{ "--d": "1", letterSpacing: titleSpacing } as never}>
            Sumedh Kudav
          </motion.h1>
          <p className="title-sub open-in" style={{ "--d": "2" } as React.CSSProperties}>
            <em>I automate your business and make digital experiences, fast and with taste.</em>
          </p>
          <p className="title-place open-in" style={{ "--d": "2" } as React.CSSProperties}>
            <svg viewBox="0 0 16 20" aria-hidden="true">
              <path d="M8 19s6-6.1 6-11A6 6 0 0 0 2 8c0 4.9 6 11 6 11Z" />
              <circle cx="8" cy="8" r="2.2" />
            </svg>
            Mumbai, working worldwide
          </p>
          <a className="btn btn-scene open-in" href={mailto("Hello Sumedh")} style={{ "--d": "3" } as React.CSSProperties}>
            Write to me <span aria-hidden="true">→</span>
          </a>
        </motion.div>

        <motion.p className="scroll-hint open-in" style={{ opacity: hintOpacity, "--d": "4" } as never}>
          <span className="scroll-hint-line" />
          {theme === "dark" ? "Scroll, the night is young" : "Scroll, the sea is calm"}
        </motion.p>
      </div>
    </header>
  );
}
