"use client";

import { useEffect, useState } from "react";
import s from "./Terminal.module.css";

type Step =
  | { out: string }
  | { cmd: string; prompt?: string }
  | { wait: number }
  | { clear: true }
  | { menu: true }
  | { desktop: true };

// The night GRUB died, replayed on the laptop: rescue mode, a live USB, a chroot, and the menu back.
const SCRIPT: Step[] = [
  { out: "error: no such partition." },
  { out: "Entering rescue mode..." },
  { cmd: "", prompt: "grub rescue> " },
  { wait: 1800 },
  { clear: true },
  { out: "Booted from the live USB." },
  { wait: 500 },
  { cmd: "mount /dev/nvme0n1p2 /mnt" },
  { cmd: "arch-chroot /mnt" },
  { cmd: "grub-install /dev/nvme0n1" },
  { out: "Installation finished. No error reported." },
  { cmd: "grub-mkconfig -o /boot/grub/grub.cfg" },
  { out: "done" },
  { cmd: "reboot" },
  { wait: 900 },
  { clear: true },
  { menu: true },
  { wait: 3200 },
  { clear: true },
  { desktop: true },
  { wait: 9000 },
  { clear: true },
];

type Line = { text: string; prompt?: string; typing?: boolean };

// once it boots, the screen shows what it boots into: the desktop passed in
export function Terminal({ run, style, desktop }: { run: boolean; style?: React.CSSProperties; desktop?: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [menu, setMenu] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (!run) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, still ? Math.min(ms, 300) : ms));
    (async () => {
      while (alive) {
        for (const step of SCRIPT) {
          if (!alive) return;
          if ("wait" in step) await sleep(step.wait);
          else if ("clear" in step) {
            setLines([]);
            setMenu(false);
            setBooted(false);
          } else if ("menu" in step) setMenu(true);
          else if ("desktop" in step) setBooted(true);
          else if ("out" in step) {
            setLines((l) => [...l, { text: step.out }]);
            await sleep(380);
          } else {
            const prompt = step.prompt ?? "# ";
            setLines((l) => [...l, { text: "", prompt, typing: true }]);
            for (let i = 1; i <= step.cmd.length && alive; i++) {
              setLines((l) => [...l.slice(0, -1), { text: step.cmd.slice(0, i), prompt, typing: true }]);
              await sleep(38 + Math.random() * 40);
            }
            await sleep(step.cmd ? 420 : 0);
            if (step.cmd) setLines((l) => [...l.slice(0, -1), { text: step.cmd, prompt }]);
          }
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [run]);

  return (
    <div className={`${s.term} ${booted ? s.booted : ""}`} style={style} aria-hidden="true">
      {booted ? (
        desktop
      ) : menu ? (
        <div className={s.menu}>
          <p className={s.menuTitle}>GNU GRUB</p>
          <div className={s.menuBox}>
            <p className={s.menuOn}>NixOS</p>
            <p>Arch Linux</p>
          </div>
        </div>
      ) : (
        lines.map((l, i) => (
          <p key={i} className={l.prompt ? s.cmd : s.out}>
            {l.prompt && <span className={s.prompt}>{l.prompt}</span>}
            {l.text}
            {l.typing && <span className={s.caret} />}
          </p>
        ))
      )}
    </div>
  );
}
