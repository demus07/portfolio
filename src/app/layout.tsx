import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter_Tight } from "next/font/google";
import { MotionLayer } from "@/components/MotionLayer";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sumedh Kudav — An anatomy of good software",
  description:
    "Software engineer at Sypha AI. I ship AI products and websites with taste and speed, from Mumbai, for anyone, anywhere.",
};

export const viewport: Viewport = {
  themeColor: "#0b1520",
};

// Runs before paint: a saved choice wins, otherwise the system setting decides.
const themeScript = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} is-loading`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MotionLayer />
        {children}
      </body>
    </html>
  );
}
