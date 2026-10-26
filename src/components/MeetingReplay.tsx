"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// An illustrated sales call, not a real one. The assistant hears a question, puts the answer on
// screen before the pause gets long, and writes the minutes as the call reaches them.
type Line =
  | { at: number; kind: "said"; who: "Client" | "You"; text: string }
  | { at: number; kind: "answer"; text: string; source: string };

const CALL: Line[] = [
  { at: 2, kind: "said", who: "Client", text: "Before we sign, does it support single sign-on?" },
  { at: 3, kind: "answer", text: "Yes, SAML on the Business plan. Okta and Azure AD are documented.", source: "Security FAQ" },
  { at: 8, kind: "said", who: "You", text: "It does, on Business, with Okta and Azure AD." },
  { at: 14, kind: "said", who: "Client", text: "And where would our data live?" },
  { at: 15, kind: "answer", text: "EU or US region, chosen at setup. Encrypted at rest.", source: "Data residency" },
  { at: 20, kind: "said", who: "You", text: "EU or US, your pick at setup, encrypted at rest." },
  { at: 26, kind: "said", who: "Client", text: "Perfect. Send the paperwork and we'll review this week." },
];

const MINUTES = [
  { after: 3, text: "Client asked about single sign-on. Answered on the call: SAML, Business plan." },
  { after: 6, text: "Client asked about data residency. Answered: EU or US, encrypted at rest." },
  { after: 7, text: "Outcome: ready to sign, pending a review this week." },
];

const ACTIONS = [
  { after: 7, who: "You", text: "Send the contract today" },
  { after: 7, who: "Client", text: "Review and sign by Friday" },
];

const TABS = ["Live", "Minutes", "Actions"] as const;
type Tab = (typeof TABS)[number];

const stamp = (s: number) => `00:${String(s).padStart(2, "0")}`;

export function MeetingReplay() {
  const [tab, setTab] = useState<Tab>("Live");
  // The finished call is the default, so nothing is hidden without script.
  const [heard, setHeard] = useState(CALL.length);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const autoplayed = useRef(false);

  const play = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    setTab("Live");
    setHeard(1);
    setPlaying(true);
    let n = 1;
    timer.current = window.setInterval(() => {
      n += 1;
      setHeard(n);
      if (n >= CALL.length) {
        window.clearInterval(timer.current!);
        timer.current = null;
        setPlaying(false);
      }
    }, 1400);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !autoplayed.current) {
          autoplayed.current = true;
          play();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [play]);

  const minutes = MINUTES.filter((n) => heard >= n.after);
  const actions = ACTIONS.filter((a) => heard >= a.after);
  const clock = CALL[Math.max(0, Math.min(heard, CALL.length) - 1)].at;
  // keep the newest lines in view as the call runs
  const shown = CALL.slice(0, heard).slice(-5);

  return (
    <div className="replay" ref={root} data-ui>
      <div className="replay-head">
        <span className="replay-title">
          <span className={`replay-rec${playing ? " is-live" : ""}`} /> Sales call
        </span>
        <span className="replay-clock">{stamp(clock)}</span>
      </div>

      <div className="replay-tabs" role="tablist" aria-label="Assistant views">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "is-active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Minutes" && <sup>{minutes.length}</sup>}
            {t === "Actions" && <sup>{actions.length}</sup>}
          </button>
        ))}
      </div>

      <div className="replay-body" aria-live="polite">
        {tab === "Live" && (
          <ol>
            {shown.map((l) =>
              l.kind === "said" ? (
                <li key={l.at} className="replay-line">
                  <span className="replay-who">
                    {l.who} <span>{stamp(l.at)}</span>
                  </span>
                  {l.text}
                </li>
              ) : (
                <li key={l.at} className="replay-line replay-answer">
                  <span className="replay-who">
                    Suggested answer <span>from {l.source}</span>
                  </span>
                  {l.text}
                </li>
              ),
            )}
            {playing && (
              <li className="replay-line replay-listening" aria-hidden="true">
                <span className="replay-who">Listening</span>
                <span className="replay-dots">
                  <i />
                  <i />
                  <i />
                </span>
              </li>
            )}
          </ol>
        )}
        {tab === "Minutes" && (
          <ul className="replay-notes">
            {minutes.map((n) => (
              <li key={n.text} className="replay-line">
                {n.text}
              </li>
            ))}
          </ul>
        )}
        {tab === "Actions" && (
          <ul className="replay-actions">
            {actions.map((a) => (
              <li key={a.text} className="replay-line">
                <span className="replay-check" aria-hidden="true" />
                <span>
                  <strong>{a.who}</strong> {a.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="replay-play" onClick={play}>
        {playing ? "Listening…" : "Replay the call ↺"}
      </button>
    </div>
  );
}
