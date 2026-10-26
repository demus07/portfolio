"use client";

import { useEffect, useState } from "react";
import { mailto } from "@/lib/site";

// Phones only: the one action stays in reach, and steps aside once the closing section is on screen.
export function ActionBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const end = document.getElementById("contact");
    let pastOpening = false;
    let atEnd = false;
    const update = () => setShow(pastOpening && !atEnd);
    const onScroll = () => {
      pastOpening = window.scrollY > window.innerHeight * 0.6;
      update();
    };
    const io = new IntersectionObserver(([e]) => {
      atEnd = e.isIntersecting;
      update();
    });
    if (end) io.observe(end);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={`action-bar${show ? " is-shown" : ""}`} aria-hidden={!show}>
      <span>Sumedh Kudav</span>
      <a className="btn" href={mailto("Hello Sumedh")} tabIndex={show ? 0 : -1}>
        Write to me <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
