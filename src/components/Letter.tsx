const STEPS = ["Start messy", "Fail fast", "Ship faster", "Learn", "Iterate"];

// The working loop, drawn as an engineering cycle with a dot that never stops going round.
function Loop() {
  const R = 150;
  return (
    <figure className="loop" data-reveal>
      <svg viewBox="-230 -210 460 420" className="loop-svg" aria-labelledby="loop-cap">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" className="loop-arrowhead" />
          </marker>
        </defs>
        <circle r={R} className="loop-ring" />
        {STEPS.map((s, i) => {
          const a0 = (i / STEPS.length) * Math.PI * 2 - Math.PI / 2;
          const a1 = ((i + 1) / STEPS.length) * Math.PI * 2 - Math.PI / 2;
          const pad = 0.2;
          const x0 = Math.cos(a0 + pad) * R;
          const y0 = Math.sin(a0 + pad) * R;
          const x1 = Math.cos(a1 - pad) * R;
          const y1 = Math.sin(a1 - pad) * R;
          const lx = Math.cos(a0) * (R + 44);
          const ly = Math.sin(a0) * (R + 44);
          const cx = Math.cos(a0) * R;
          const cy = Math.sin(a0) * R;
          return (
            <g key={s} className="loop-step" style={{ "--i": String(i) } as React.CSSProperties}>
              <path
                d={`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
                className="loop-arc"
                markerEnd="url(#arrow)"
              />
              <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={6} className="loop-node" />
              <text
                x={lx.toFixed(1)}
                y={ly.toFixed(1)}
                textAnchor={Math.abs(lx) < 20 ? "middle" : lx > 0 ? "start" : "end"}
                dominantBaseline="middle"
                className="loop-label"
              >
                {s}
              </text>
            </g>
          );
        })}
        <g className="loop-runner">
          <circle r={5} cy={-R} className="loop-dot" />
        </g>
        <text y={-8} textAnchor="middle" className="loop-center">
          ship it,
        </text>
        <text y={22} textAnchor="middle" className="loop-center loop-center-em">
          then again
        </text>
      </svg>
      <figcaption id="loop-cap">
        The loop I work in. It has no last step.
      </figcaption>
    </figure>
  );
}

export function Letter() {
  return (
    <section className="letter" id="about" aria-labelledby="letter-title">
      <div className="letter-grid">
        <div className="letter-body">
          <h2 id="letter-title" className="section-title" data-reveal>
            I never stopped taking things apart
          </h2>
          <div className="letter-cols" data-reveal style={{ "--d": "1" } as React.CSSProperties}>
            <p>
              I&rsquo;m Sumedh. It started with building my own PC. I grew up gaming, which mostly
              meant fixing whatever Windows had broken that week, and theming a Windows 7 desktop
              until it stopped looking like Windows. In 2020 I found Linux, and the tinkering got
              serious.
            </p>
            <p>
              I was working as an analyst when it clicked that building things was what I could be
              good at. So I quit, joined Sypha AI, and in March 2026 went all in.
            </p>
            <p>
              Gone are the days when &ldquo;I don&rsquo;t know how&rdquo; was a reason to stop.
              Knowledge is everywhere now, and most people just chase it. The edge is applying it with
              taste.
            </p>
          </div>
          <p className="signature" data-reveal style={{ "--d": "2" } as React.CSSProperties}>
            <em>Sumedh</em>
          </p>
        </div>
        <Loop />
      </div>
    </section>
  );
}
