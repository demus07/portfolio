import Image from "next/image";
import { MeetingReplay } from "./MeetingReplay";
import { TypeTest } from "./TypeTest";
import { GITHUB_URL } from "@/lib/site";

// The work comes first. Three pieces, each set its own way, read top to bottom.
export function Plates() {
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <h2 id="work-title" className="section-title" data-reveal>
        Things I&rsquo;ve made
      </h2>

      <article className="work-a">
        <div className="work-copy">
          <h3 className="work-title" data-reveal>
            An answer engine for live calls
          </h3>
          <p className="work-facts" data-reveal>
            At Sypha AI · built alone, end to end · in production
          </p>
          <div className="work-text" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
            <p>
              While a call is live, it listens, pulls context from your knowledge base and puts the
              answer on screen before the pause gets awkward. When the call ends, it writes the
              minutes.
            </p>
            <p>
              The hard part was being right in time. A correct answer three seconds late is a wrong
              answer, so most of six months went into what it retrieves and how fast.
            </p>
          </div>
        </div>
        <figure className="work-figure" data-reveal style={{ "--d": "2" } as React.CSSProperties}>
          <MeetingReplay />
          <figcaption>An illustrated call, not a real one. Switch views while it runs.</figcaption>
        </figure>
      </article>

      <article className="work-b">
        <figure className="work-figure" data-reveal>
          <TypeTest />
          <figcaption>Typestorm, a small working copy. Click and type; tab starts over.</figcaption>
        </figure>
        <div className="work-copy work-copy-split">
          <h3 className="work-title" data-reveal>
            A typing test, built to feel right
          </h3>
          <div className="work-text" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
            <p>
              Typestorm is a minimal, keyboard-first typing test, inspired by monkeytype: a caret
              that keeps up with your fingers, a command line for every setting, eleven themes,
              replays, accounts and leaderboards.
            </p>
            <p>
              <a className="text-link" href={`${GITHUB_URL}/typestorm`}>
                Read the code on GitHub
              </a>
            </p>
          </div>
        </div>
      </article>

      <article className="work-c">
        <figure className="work-figure work-shots" data-reveal>
          <Image
            className="work-shot-a"
            src="/work/rebrand-problem.jpg"
            alt="The redesigned studio site: a dark section with a large serif headline beside a dim photograph."
            width={1800}
            height={1125}
            sizes="(max-width: 900px) 92vw, 58vw"
          />
          <Image
            className="work-shot-b"
            src="/work/rebrand-case.jpg"
            alt="A case study layout from the same site: before, shift and after notes beside a photograph."
            width={1800}
            height={1125}
            sizes="(max-width: 900px) 92vw, 28vw"
          />
        </figure>
        <div className="work-copy">
          <h3 className="work-title" data-reveal>
            A redesign, in an afternoon
          </h3>
          <p className="work-facts" data-reveal>
            Self-initiated · design and code · two to three hours
          </p>
          <div className="work-text" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
            <p>
              I came across a studio site that undersold its own work, and rebuilt it to see how far
              taste and speed could take it. No brief and no client: one serif voice, one accent used
              only where the reader acts, one idea per screen.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
