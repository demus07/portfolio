"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

// The theme lives on <html data-theme>, set before paint by the script in the layout.
function read(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const setTheme = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {}
  }, []);
  return [theme, setTheme] as const;
}
