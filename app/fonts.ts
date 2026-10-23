import localFont from "next/font/local";
import { Shrikhand, Space_Grotesk, Space_Mono, Unbounded } from "next/font/google";

// Display: Unbounded, heavy and round, for every heading that wobbles.
export const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap" });

// Text: Space Grotesk for paragraphs and buttons.
export const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", weight: ["400", "500", "700"], display: "swap" });

// Labels, code and the small dripping caps.
export const mono = Space_Mono({ subsets: ["latin"], variable: "--font-mono-face", weight: ["400", "700"], display: "swap" });

// One accent word per heading, set in a fat retro script.
export const shrikhand = Shrikhand({ subsets: ["latin"], variable: "--font-shrikhand", weight: "400", display: "swap" });

// Devanagari is only ever used for one word, so ship a 1 KB subset (scripts/subset-ram.mjs) instead of 700 KB.
export const anekDeva = localFont({ src: "../assets/fonts/anek-devanagari-ram.woff2", variable: "--font-anek-deva", display: "swap", preload: false });

export const fontVariables = [unbounded, grotesk, mono, shrikhand, anekDeva].map((f) => f.variable).join(" ");
