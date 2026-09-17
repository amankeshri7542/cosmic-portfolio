import type { Metadata } from "next";
import { Manrope, Space_Grotesk, Caveat, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { pageMetadata, SITE_URL, JsonLd } from "@/lib/seo";
import Footer from "@/components/Footer";
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const display = Space_Grotesk({
  subsets: ["latin"],

  variable: "--font-display",
  display: "swap",
});
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", display: "swap" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
});
export const metadata: Metadata = {
  ...pageMetadata("/", "Aman Kumar — Full-stack Software Engineer", "Aman Kumar builds business software, Rust and PostgreSQL workflows, real-time systems and AWS infrastructure. Explore his projects and technical writing."),
  metadataBase: new URL(SITE_URL),
  title: { default: "Aman Kumar — Full-stack Software Engineer", template: "%s | Aman Kumar" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${hand.variable} ${mono.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <JsonLd data={{ "@context":"https://schema.org", "@type":"Person", "@id":`${SITE_URL}/#person`, name:"Aman Kumar", url:SITE_URL, jobTitle:"Full-stack Software Engineer", sameAs:["https://github.com/amankeshri7542","https://www.linkedin.com/in/aman-kumar-keshri"] }} />
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
