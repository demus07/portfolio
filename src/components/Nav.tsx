"use client";

import { useEffect, useState } from "react";
import { mailto } from "@/lib/site";
import { useTheme } from "@/lib/useTheme";

// Name, two links, the theme switch and the one action. It tucks away while you read down
// and comes back the moment you scroll up.
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [theme, setTheme] = useTheme();
  const dark = theme === "dark";

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > window.innerHeight * 0.5);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav${hidden ? " is-hidden" : ""}`} aria-label="Main">
      <a href="#top" className="nav-mark">
        Sumedh Kudav
      </a>
      <div className="nav-links">
        <a href="#work">Work</a>
        <a href="#desktop">Desktop</a>
        <a href="#anatomy">Method</a>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(dark ? "light" : "dark")}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={dark}
        >
          <span className="lamp" aria-hidden="true" />
          {dark ? "Morning" : "Night"}
        </button>
        <a className="nav-cta" href={mailto("Hello Sumedh")}>
          Write to me <span aria-hidden="true">→</span>
        </a>
      </div>
    </nav>
  );
}
