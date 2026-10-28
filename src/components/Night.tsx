"use client";

import { useEffect, useState } from "react";
import { MarineDrive } from "./MarineDrive";
import { EMAIL, GITHUB_URL, LEETCODE_URL, X_URL, mailto } from "@/lib/site";
import { useTheme } from "@/lib/useTheme";

function useMumbaiTime() {
  const [time, setTime] = useState<{ label: string; dark: boolean } | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    const hour = new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" });
    const tick = () => {
      const now = new Date();
      const h = Number(hour.format(now));
      setTime({ label: fmt.format(now).toLowerCase(), dark: h >= 18 || h < 6 });
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

// What the lamps are doing in Mumbai, squared with what the painting shows: the theme paints the
// night, the clock says whether it is night out there.
function lampsLine(nightThere: boolean, nightHere: boolean) {
  if (nightThere) return nightHere ? "The lamps are on." : "Out there, the lamps are already on.";
  return nightHere ? "You've lit the lamps early." : "The lamps come on at dusk.";
}

// The page ends where it began: back on the sea wall, by day or by night.
export function Night() {
  const time = useMumbaiTime();
  const [theme] = useTheme();

  return (
    <footer className="night" id="contact">
      <MarineDrive variant={theme === "dark" ? "night" : "morning"} className="night-scene" />
      <div className="night-shade" />

      <div className="night-inner">
        <p className="night-time" data-reveal>
          {time ? (
            <>
              It&rsquo;s {time.label} in Mumbai. {lampsLine(time.dark, theme === "dark")}
            </>
          ) : (
            "Mumbai runs on IST."
          )}
        </p>
        <h2 className="night-title" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
          If you&rsquo;ve read this far, we should talk.
        </h2>
        <div className="night-actions" data-reveal style={{ "--d": "2" } as React.CSSProperties}>
          <a className="btn btn-scene" href={mailto("Hello Sumedh")}>
            Write to me <span aria-hidden="true">→</span>
          </a>
          <a className="night-email" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>

        <div className="night-foot">
          <p>
            Sumedh Kudav, software engineer at Sypha AI.
            <br />
            Usually running the Coastal Road, or at a café table with a laptop.
          </p>
          <p className="night-links">
            <a href={X_URL}>X</a>
            <a href={GITHUB_URL}>GitHub</a>
            <a href={LEETCODE_URL}>LeetCode</a>
            <a href={`mailto:${EMAIL}`}>Email</a>
            <a href="#top">Back to the bay ↑</a>
          </p>
          <p className="night-credits">
            © 2026 Sumedh Kudav
          </p>
        </div>
      </div>
    </footer>
  );
}
