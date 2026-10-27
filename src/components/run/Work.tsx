"use client";

import Image from "next/image";
import { MeetingReplay } from "../MeetingReplay";
import { TypeTest } from "../TypeTest";
import { WORK } from "@/lib/content";
import { Scene, Slot } from "../paint/Scene";
import { cafeLayout, paintCafe } from "../paint/cafe";
import { hoardingLayout, paintHoarding, paintShelter, shelterLayout } from "../paint/street";
import { useNarrow } from "./useNarrow";
import x from "./Scenes.module.css";
import s from "./Work.module.css";

// The answer engine, open on a laptop in an Irani café on the sea face.
function Assistant() {
  const narrow = useNarrow();
  const a = WORK.assistant;
  return (
    <article>
      <Scene
        className={x.scene}
        paint={paintCafe}
        layout={cafeLayout}
        label="A painted Irani café on Marine Drive: an arched window onto the bay, a laptop on a marble table running the meeting assistant, a cutting chai and bun maska beside it."
      >
        {(l) => (
          <>
            <div className={x.over}>
              <h2 className={x.kicker}>{WORK.title}</h2>
              <h3 className={x.title}>{a.title}</h3>
              <p className={x.meta}>{a.facts}</p>
              <p className={x.line}>{a.text[0]}</p>
            </div>
            {!l.narrow && (
              <Slot rect={l.screen} design={680} className={s.replaySlot}>
                <MeetingReplay />
              </Slot>
            )}
          </>
        )}
      </Scene>
      {narrow && (
        <div className={x.below}>
          <MeetingReplay />
        </div>
      )}
    </article>
  );
}

// Typestorm on a hoarding across the road, lit from below, and live: click it and type.
function Typestorm() {
  const t = WORK.typestorm;
  return (
    <article>
      <Scene
        className={x.scene}
        paint={paintHoarding}
        layout={hoardingLayout}
        label="A painted street of Art Deco blocks on Marine Drive, a hoarding on one facade carrying Typestorm, a typing test you can use."
      >
        {(l) => (
          <>
            <div className={x.over}>
              <h3 className={x.title}>{t.title}</h3>
              <p className={x.line}>{t.text}</p>
              <p className={x.actions}>
                <a className={x.cta} href={t.liveHref} target="_blank" rel="noreferrer">
                  {t.live} <span aria-hidden="true">↗</span>
                </a>
                <a className={x.link} href={t.href} target="_blank" rel="noreferrer">
                  {t.link}
                </a>
              </p>
            </div>
            <Slot rect={l.board} design={900} className={s.test}>
              <TypeTest />
            </Slot>
          </>
        )}
      </Scene>
    </article>
  );
}

// The redesign, on the backlit panel of a bus shelter on the promenade.
function Redesign() {
  const r = WORK.redesign;
  return (
    <article>
      <Scene
        className={x.scene}
        paint={paintShelter}
        layout={shelterLayout}
        label="A painted bus shelter on the Marine Drive promenade, the bay behind it, its backlit panel showing the redesigned studio site."
      >
        {(l) => (
          <>
            <div className={x.over}>
              <h3 className={x.title}>{r.title}</h3>
              <p className={x.meta}>{r.facts}</p>
              <p className={x.line}>{r.text}</p>
            </div>
            <Slot rect={l.panel} design={1200} className={s.panel}>
              <Image src={r.image.src} alt={r.image.alt} width={1800} height={1125} sizes="(max-width: 760px) 80vw, 46vw" />
            </Slot>
          </>
        )}
      </Scene>
    </article>
  );
}

export function Work() {
  return (
    <section className={`${s.work} ${x.full}`} id="work" data-stop>
      <Assistant />
      <Typestorm />
      <Redesign />
    </section>
  );
}
