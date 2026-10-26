// Every word on the page below the landing, in one place.
export { EMAIL, X_URL, GITHUB_URL, LEETCODE_URL, UNIXPORN_URL, mailto } from "@/lib/site";

export const INTRO = {
  statement:
    "I built a live meeting assistant on my own and took it to production. For fun, I compile my own Linux kernel.",
  facts: ["Software engineer at Sypha AI", "Mumbai, working with people anywhere", "198 LeetCode problems, and counting"],
};

export const WORK = {
  title: "Things I’ve made",
  assistant: {
    title: "An answer engine for live calls",
    facts: "At Sypha AI · built alone, end to end · in production",
    text: [
      "While a call is live, it listens, pulls context from your knowledge base and puts the answer on screen before the pause gets awkward. When the call ends, it writes the minutes.",
      "The hard part was being right in time. A correct answer three seconds late is a wrong answer, so most of six months went into what it retrieves and how fast.",
    ],
    caption: "An illustrated call, not a real one. Switch views while it runs.",
  },
  typestorm: {
    title: "A typing test, built to feel right",
    text: "Typestorm is a minimal, keyboard-first typing test, inspired by monkeytype: a caret that keeps up with your fingers, a command line for every setting, eleven themes, replays, accounts and leaderboards.",
    link: "Read the code on GitHub",
    href: "https://github.com/demus07/typestorm",
    caption: "Typestorm, a small working copy. Click and type; tab starts over.",
  },
  redesign: {
    title: "A redesign, in an afternoon",
    facts: "Self-initiated · design and code · two to three hours",
    text: "I came across a studio site that undersold its own work, and rebuilt it to see how far taste and speed could take it. No brief and no client: one serif voice, one accent used only where the reader acts, one idea per screen.",
    images: [
      {
        src: "/work/rebrand-problem.jpg",
        alt: "The redesigned studio site: a dark section with a large serif headline beside a dim photograph.",
      },
      {
        src: "/work/rebrand-case.jpg",
        alt: "A case study layout from the same site: before, shift and after notes beside a photograph.",
      },
    ],
  },
};

export const LETTER = {
  title: "I never stopped taking things apart",
  paras: [
    "I’m Sumedh. It started with building my own PC. I grew up gaming, which mostly meant fixing whatever Windows had broken that week, and theming a Windows 7 desktop until it stopped looking like Windows. In 2020 I found Linux, and the tinkering got serious.",
    "I was working as an analyst when it clicked that building things was what I could be good at. So I quit, joined Sypha AI, and in March 2026 went all in.",
    "Gone are the days when “I don’t know how” was a reason to stop. Knowledge is everywhere now, and most people just chase it. The edge is applying it with taste.",
  ],
  signature: "Sumedh",
  loop: ["Start messy", "Fail fast", "Ship faster", "Learn", "Iterate"],
  loopCaption: "The loop I work in. It has no last step.",
};

export const DESKTOP = {
  title: "Where the taste started",
  lede: "Ricing is design with nobody to sign it off. You notice every pixel, because you’re the one looking at it all day.",
  caption: "My Sway rice on NixOS, redrawn from a screenshot: Tokyo Night, kitty, Neovim.",
  route: [
    { os: "Linux Mint", text: "2020. My laptop was too slow for Windows, and Mint gave it a second life." },
    { os: "Arch", text: "Broke a few installs. Loved fixing every one of them." },
    { os: "NixOS", text: "The whole system in one file. Tried i3 and qtile, settled on Sway, riced it to the brim." },
    { os: "Gentoo", text: "Compiled my own kernel, choosing every module. The bare bones of an operating system." },
  ],
  grub: "Once, GRUB died while I was dual-booting NixOS and Arch. I chrooted in from a live USB and rebuilt it by hand. That is how you learn what sits under everything you build.",
  links: [
    { label: "The dotfiles", href: "https://github.com/demus07/sway-dots" },
    {
      label: "The post on r/unixporn",
      href: "https://www.reddit.com/r/unixporn/comments/setkki/sway_with_the_best_distro/",
    },
  ],
};

export const ROAD = {
  day: { src: "/archive/coastal-day.jpg", w: 1920, h: 566, alt: "The Coastal Road in Mumbai by day: curving flyovers over the water, the skyline of Worli behind them." },
  night: { src: "/archive/coastal-night.jpg", w: 1920, h: 600, alt: "The Coastal Road in Mumbai at night: lit flyovers curving over the water towards the towers of Worli." },
  caption: "The Coastal Road, Worli. Where I run, and where most problems get smaller.",
};

export const METHOD = {
  title: "I build software the way I train",
  lede: "Gym, running, code: the same four steps. See the result, plan back from it, put in the messy reps, then refine.",
  steps: [
    { body: "Eyes", eng: "Picture the finished thing", text: "Before any code, I see the end result: what it does, how it feels, what someone says after using it." },
    { body: "Skeleton", eng: "Work backwards", text: "From the finish line back to today. The first decisions are about what not to build." },
    { body: "Muscles", eng: "Start messy", text: "Strength comes from reps, not plans. A rough version that runs beats a perfect one on paper, so it ships rough and early." },
    { body: "Skin", eng: "Then make it elegant", text: "The surface is what people touch first. UI, type and motion are the part I never cut, even on a deadline." },
  ],
  plate: { src: "/archive/vesalius-muscle-man.jpg", w: 928, h: 1600, alt: "An anatomical woodcut by Andreas Vesalius, 1543: a standing figure with every muscle drawn.", caption: "Andreas Vesalius, De humani corporis fabrica, 1543" },
};

export const KITCHEN = {
  title: "Ingredients are not a meal",
  lines: [
    "Everyone can buy the ingredients now. AI writes the code, tools draw the screens.",
    "That was never the meal.",
    "A Michelin star comes from the kitchen:",
    "the hands, the timing, the taste.",
  ],
  image: { src: "/archive/kitchen-interior.jpg", w: 2000, h: 1484, alt: "A seventeenth-century engraving of a crowded kitchen, its floor covered in raw game, cabbages and fish not yet cooked." },
  caption: "Kitchen Interior, David Vinckboons, c. 1600. Every ingredient in the room, and not one meal yet.",
};

export const FIT = {
  title: "Two things, done properly",
  lede: "I take freelance work from anywhere in the world. Fixed scope or ongoing, whatever the work needs.",
  services: [
    { name: "AI features", text: "In-product assistants, answers grounded in your own data, real-time voice. The kind of thing I’ve already taken to production." },
    { name: "Websites", text: "Sites that make a brand look like what it charges. Designed and built by the same pair of hands, so nothing is lost in the handover." },
  ],
  sneakers: "There’s always a cheaper version. It’s a fake pair of Nikes: right in the photo, falls apart on the first run.",
  ask: "Write a few lines about what you’re building. You’ll get a straight answer: a plan, or a clear no.",
  cta: "Write to me",
};

export const CLOSE = {
  title: "If you’ve read this far, we should talk.",
  foot: "Sumedh Kudav, software engineer at Sypha AI. Usually running the Coastal Road, or at a café table with a laptop.",
  credits:
    "Pictures: Vinckboons, The Met · Vesalius, Wellcome Collection, CC BY 4.0 · Coastal Road by Qiw007, CC BY 4.0",
};
