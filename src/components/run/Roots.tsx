"use client";

import { useCallback, useState } from "react";
import { Rice } from "../Desktop";
import { Painted } from "../paint/Painted";
import { grubLayout, paintGrub } from "../paint/grub";
import { Terminal } from "./Terminal";
import { DESKTOP } from "@/lib/content";
import { useInView } from "./useInView";
import g from "../ContourRun.module.css";
import s from "./Roots.module.css";

// The night GRUB died, painted: the laptop on the sea wall, the rescue playing on its screen.
function Rescue() {
  const [ref, seen] = useInView<HTMLDivElement>(0.35);
  const [view, setView] = useState<{ screen: React.CSSProperties; k: number; face: { y: number; h: number } } | null>(null);
  const onSize = useCallback((w: number, h: number) => {
    const { screen: r, face } = grubLayout(w, h);
    setView({ screen: { left: r.x, top: r.y, width: r.w, height: r.h, fontSize: Math.max(9.5, r.w / 36) }, k: r.w / 1240, face });
  }, []);
  const desktop = view && (
    <div style={{ width: 1240, transform: `scale(${view.k})`, transformOrigin: "0 0" }}>
      <Rice fixed />
    </div>
  );
  return (
    <div ref={ref} className={`${s.rescue} ${seen ? "" : g.out}`}>
      <Painted
        className={s.scene}
        paint={paintGrub}
        live
        onSize={onSize}
        label="A painted laptop open on the sea wall at Marine Drive, a glass of cutting chai beside it. On its screen GRUB fails, a live USB boots, the bootloader is rebuilt by hand, and it boots into a riced Sway desktop."
      >
        <div className={s.funText}>
          <p className={`${s.funLine} ${g.rise}`}>
            {DESKTOP.fun.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className={`${s.grub} ${g.rise}`} style={{ "--i": "1" } as React.CSSProperties}>
            {DESKTOP.grub}
          </p>
        </div>
        {view && <Terminal run={seen} style={view.screen} desktop={desktop} />}
        {view && (
          // the distros I came through, cut into the stones of the sea wall
          <div className={s.stones} style={{ top: view.face.y, height: view.face.h }}>
            <ol className={s.distros}>
              {DESKTOP.route.map((r) => (
                <li key={r.os}>
                  <p className={s.os}>{r.os}</p>
                  <p className={s.osLine}>{r.text}</p>
                </li>
              ))}
            </ol>
            <p className={s.links}>
              {DESKTOP.links.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </p>
          </div>
        )}
      </Painted>
    </div>
  );
}

export function Roots() {
  return (
    <section className={s.roots} id="desktop" data-stop>
      <Rescue />
    </section>
  );
}
