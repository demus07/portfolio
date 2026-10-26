import { mailto } from "@/lib/site";

const SERVICES = [
  {
    name: "AI features",
    text: "In-product assistants, answers grounded in your own data, real-time voice. The kind of thing I’ve already taken to production.",
  },
  {
    name: "Websites",
    text: "Sites that make a brand look like what it charges. Designed and built by the same pair of hands, so nothing is lost in the handover.",
  },
];

export function Fit() {
  return (
    <section className="fit" id="fit" aria-labelledby="fit-title">
      <div className="fit-head">
        <h2 id="fit-title" className="section-title" data-reveal>
          Two things, done properly
        </h2>
        <p className="fit-lede" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
          I take freelance work from anywhere in the world. Fixed scope or ongoing, whatever the work
          needs.
        </p>
      </div>

      <div className="services">
        {SERVICES.map((s, i) => (
          <div key={s.name} className="service" data-reveal style={{ "--d": String(i + 1) } as React.CSSProperties}>
            <h3 className="service-name">{s.name}</h3>
            <p className="service-text">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="sneakers" data-reveal>
        <p className="sneakers-text">
          There&rsquo;s always a cheaper version. It&rsquo;s a fake pair of Nikes: right in the photo,
          falls apart on the first run.
        </p>
        <div className="sneakers-act">
          <p>Write a few lines about what you&rsquo;re building. You&rsquo;ll get a straight answer: a plan, or a clear no.</p>
          <a className="btn" href={mailto("Hello Sumedh")}>
            Write to me <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
