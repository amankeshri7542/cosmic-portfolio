import localFont from "next/font/local";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

// Display and text: Bricolage Grotesque (optical sizes from 12 to 96, so one family carries both roles).
export const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", axes: ["opsz"], display: "swap" });

// Code, labels and the build log.
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

// Devanagari is only ever used for one word, so ship a 1 KB subset (scripts/subset-ram.mjs) instead of 700 KB.
export const anekDeva = localFont({ src: "../assets/fonts/anek-devanagari-ram.woff2", variable: "--font-anek-deva", display: "swap", preload: false });

export const fontVariables = [bricolage, jetbrains, anekDeva].map((f) => f.variable).join(" ");
