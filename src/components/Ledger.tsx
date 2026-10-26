import { LEETCODE_URL } from "@/lib/site";

// The first thing on the paper: who, in one breath, and three plain facts beside it.
export function Ledger() {
  return (
    <section className="ledger" aria-label="In short">
      <p className="ledger-text" data-reveal>
        I built a live meeting assistant on my own and took it to production. For fun, I compile my
        own Linux kernel.
      </p>
      <ul className="ledger-facts" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
        <li>Software engineer at Sypha AI</li>
        <li>Mumbai, working with people anywhere</li>
        <li>
          <a className="text-link" href={LEETCODE_URL}>
            198 LeetCode problems
          </a>
          , and counting
        </li>
      </ul>
    </section>
  );
}
