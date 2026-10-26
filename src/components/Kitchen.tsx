import Image from "next/image";
import { ScrollWords } from "./ScrollWords";

export function Kitchen() {
  return (
    <section className="kitchen" aria-labelledby="kitchen-title">
      <h2 id="kitchen-title" className="section-title" data-reveal>
        Ingredients are not a meal
      </h2>
      <div className="kitchen-grid">
        <figure className="kitchen-plate" data-reveal>
          <div className="kitchen-frame">
            <Image
                src="/archive/kitchen-interior.jpg"
                alt="A seventeenth-century engraving of a crowded kitchen, its floor covered in raw game, cabbages and fish not yet cooked."
                width={2000}
                height={1484}
                sizes="(max-width: 900px) 100vw, 50vw"
              />
          </div>
          <figcaption>
            Kitchen Interior, David Vinckboons, c. 1600. Every ingredient in the
            room, and not one meal yet.
          </figcaption>
        </figure>

        <ScrollWords
          className="kitchen-words"
          parts={[
            { text: "Everyone can buy the ingredients now. AI writes the code, tools draw the screens." },
            { text: "That was never the meal." },
            { text: "A Michelin star comes from the kitchen:" },
            { text: "the hands, the timing, the taste.", em: true },
          ]}
        />
      </div>
    </section>
  );
}
