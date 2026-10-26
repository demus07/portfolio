import Image from "next/image";

// A rest between chapters: the road I run on, by day or by night, with the theme.
export function Road() {
  return (
    <figure className="road" data-reveal>
      <div className="road-frame">
        <Image
          className="road-day"
          src="/archive/coastal-day.jpg"
          alt="The Coastal Road in Mumbai by day: curving flyovers over the water, the skyline of Worli behind them."
          width={1920}
          height={566}
          sizes="100vw"
        />
        <Image
          className="road-night"
          src="/archive/coastal-night.jpg"
          alt="The Coastal Road in Mumbai at night: lit flyovers curving over the water towards the towers of Worli."
          width={1920}
          height={600}
          sizes="100vw"
        />
      </div>
      <figcaption>The Coastal Road, Worli. Where I run, and where most problems get smaller.</figcaption>
    </figure>
  );
}
