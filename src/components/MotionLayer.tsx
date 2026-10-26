"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Smooth scrolling (held until the loader lifts) plus the one-time entrance for anything marked data-reveal.
export function MotionLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add(reduce ? "motion-off" : "motion-on");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((t) => io.observe(t));

    if (reduce) return () => io.disconnect();

    const lenis = new Lenis({ lerp: 0.09, anchors: true });
    if (document.documentElement.classList.contains("is-loading")) lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("loader:done", start);

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      io.disconnect();
      window.removeEventListener("loader:done", start);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
