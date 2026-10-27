"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 759px)";

// Phones get the real thing below a scene rather than shrunk into it.
export function useNarrow() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
