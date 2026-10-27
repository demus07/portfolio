// Every word on the page below the landing, in one place.
export { EMAIL, X_URL, GITHUB_URL, LEETCODE_URL, UNIXPORN_URL, mailto } from "@/lib/site";

export const INTRO = {
  statement: "I built a live meeting assistant end to end, and took it to production.",
  facts: {
    work: { value: "Sypha AI", note: "Software engineer" },
    place: { value: "Mumbai", note: "Working with people anywhere" },
    leetcode: { value: 198, note: "LeetCode problems, and counting" },
  },
};

export const WORK = {
  title: "Things I’ve made",
  assistant: {
    title: "An answer engine for live calls",
    facts: "At Sypha AI · built alone, end to end · in production",
    text: ["It puts the answer on screen before the pause gets awkward, and writes the minutes when the call ends."],
    caption: "An illustrated call, not a real one. Switch views while it runs.",
  },
  typestorm: {
    title: "A typing test, built to feel right",
    text: "A minimal, keyboard-first typing test, with a caret that keeps up with your fingers.",
    link: "Read the code",
    href: "https://github.com/demus07/typestorm",
    live: "Try it live",
    liveHref: "https://typestorm-six.vercel.app/",
    caption: "Typestorm, a small working copy. Click and type; tab starts over.",
  },
  redesign: {
    title: "A redesign, in an afternoon",
    facts: "Self-initiated · design and code · two to three hours",
    text: "A studio site that undersold its own work, rebuilt to see how far taste and speed could go.",
    image: {
      src: "/work/rebrand-problem.jpg",
      alt: "The redesigned studio site: a dark section with a large serif headline beside a dim photograph.",
    },
  },
};

export const LETTER = {
  title: "I never stopped taking things apart",
  paras: [
    "I built my first PC for games and found Linux in 2020. Then I quit my analyst job, joined Sypha AI, and in March 2026 went all in.",
  ],
  signature: "Sumedh",
  loop: ["Start messy", "Fail fast", "Ship faster", "Learn", "Iterate"],
  loopCaption: "The loop I work in. It has no last step.",
};

export const DESKTOP = {
  fun: ["Most people use their computer.", "I compile mine."],
  title: "Where the taste started",
  lede: "Ricing is design with nobody to sign it off.",
  caption: "My Sway rice on NixOS, redrawn from a screenshot: Tokyo Night, kitty, Neovim.",
  route: [
    { os: "Linux Mint", text: "2020, a slow laptop given a second life." },
    { os: "Arch", text: "Broken, and fixed, many times." },
    { os: "NixOS", text: "The whole system in one file, on Sway." },
    { os: "Gentoo", text: "Every kernel module, chosen by hand." },
  ],
  grub: "Once, GRUB died while I was dual-booting NixOS and Arch. I rebuilt it by hand from a live USB.",
  links: [
    { label: "The dotfiles", href: "https://github.com/demus07/sway-dots" },
    {
      label: "The post on r/unixporn",
      href: "https://www.reddit.com/r/unixporn/comments/setkki/sway_with_the_best_distro/",
    },
  ],
};

export const METHOD = {
  title: "I build software the way I train",
  lede: "Gym, running, code: see the result, plan back from it, do the messy reps, then refine.",
  steps: [{ eng: "Picture the finished thing" }, { eng: "Work backwards" }, { eng: "Start messy" }, { eng: "Then make it elegant" }],
};

export const KITCHEN = {
  title: "Ingredients are not a meal",
  line: "Anyone can buy the ingredients now. A Michelin star still comes from the kitchen.",
  // what everyone can buy now; the plate is what the kitchen makes of them
  ingredients: ["Models", "Components", "Templates", "Prompts", "Fonts", "APIs", "Icons", "Stock photos"],
};

export const FIT = {
  title: "Two things, done properly",
  lede: "Freelance, for anyone, anywhere in the world.",
  services: [
    {
      name: "AI features",
      text: "The kind of thing I’ve already taken to production.",
      parts: ["In-product assistants", "Answers grounded in your own data", "Real-time voice"],
    },
    {
      name: "Websites",
      text: "Sites that make a brand look like what it charges.",
      parts: ["Designed and built by the same pair of hands", "Nothing lost in the handover"],
    },
  ],
  // told one line at a time over the painted shoe, as its sole gives way
  sneakers: [
    "A fake pair of Nikes looks perfect in the photo.",
    "You find out on the first long run.",
    "Cheap work fails the same way: quietly, later, with your name on it.",
  ],
  sneakersEnd: "I build the real pair.",
  ask: "Write a few lines about what you’re building. You’ll get a straight answer: a plan, or a clear no.",
  cta: "Write to me",
};

export const CLOSE = {
  title: "If you’ve read this far, we should talk.",
  foot: "Sumedh Kudav, software engineer at Sypha AI. Usually running the Coastal Road, or at a café table with a laptop.",
};
