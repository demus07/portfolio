"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { FIT, mailto } from "@/lib/content";
import { Painted, type Paint } from "../paint/Painted";
import { paintBay, paintSneaker } from "../paint/sneaker";
import { promenade } from "../paint/lib";
import x from "./Scenes.module.css";
import { useInView } from "./useInView";
import g from "../ContourRun.module.css";
import s from "./Fit.module.css";

// when each line of the story is on screen, as a share of the pinned scroll
const WINDOWS = [
  [0, 0.001, 0.26, 0.32],
  [0.34, 0.4, 0.56, 0.62],
  [0.64, 0.72, 0.999, 1],
];

function StoryLine({
  text,
  i,
  p,
}: {
  text: string;
  i: number;
  p: MotionValue<number>;
}) {
  const opacity = useTransform(p, WINDOWS[i], [i ? 0 : 1, 1, 1, i < 2 ? 0 : 1]);
  const y = useTransform(p, WINDOWS[i], [i ? 16 : 0, 0, 0, i < 2 ? -12 : 0]);
  return (
    <motion.p className={s.storyLine} style={{ opacity, y }}>
      {text}
    </motion.p>
  );
}

// The shoe from the photo, on the promenade. Scroll, and its sole gives way.
function Sneaker() {
  const pin = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: pin,
    offset: ["start start", "end end"],
  });
  return (
    <div ref={pin} className={s.pin}>
      <div className={s.scene}>
        <Painted
          className={s.fill}
          paint={paintSneaker}
          progress={p}
          live
          label="A painted running shoe on the promenade at Marine Drive. As you scroll, its upper peels away from the sole at the toe and the midsole cracks."
        >
          <div className={s.story}>
            {FIT.sneakers.map((line, i) => (
              <StoryLine key={line} text={line} i={i} p={p} />
            ))}
          </div>
        </Painted>
      </div>
    </div>
  );
}

// the bay, and the promenade in front of it: the ground the two services stand on
const paintBayWalk: Paint = (c, w, h, o) => {
  paintBay(c, w, h, h * 0.5, h * 0.66, o.pal, o.t, 0.5);
  promenade(c, w, h * 0.66, h, o.pal, w * 0.5);
};

export function Fit() {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const [bandRef, bandSeen] = useInView<HTMLDivElement>(0.35);
  return (
    <>
      <section className={`${s.fit} ${x.full}`} id="fit" data-stop>
        <div className={s.backdrop}>
          <Painted className={s.fill} paint={paintBayWalk} live label="The bay from the promenade at Marine Drive, painted." />
        </div>
        <div ref={ref} className={`${s.inner} ${seen ? "" : g.out}`}>
          <div className={s.head}>
            <h2 className={`${x.title} ${g.rise}`}>{FIT.title}</h2>
            <p
              className={`${x.line} ${g.rise}`}
              style={{ "--i": "1" } as React.CSSProperties}
            >
              {FIT.lede}
            </p>
          </div>
          <div className={s.services}>
            {FIT.services.map((x, i) => (
              <article
                key={x.name}
                className={`${s.service} ${g.rise}`}
                style={{ "--i": String(i + 2) } as React.CSSProperties}
              >
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

      {/* the sneakers: shown, not told */}
      <section
        className={s.band}
        aria-label="Why not the cheaper version"
        data-stop
      >
        <Sneaker />
        <div
          ref={bandRef}
          className={`${s.bandInner} ${bandSeen ? s.seen : ""}`}
        >
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
