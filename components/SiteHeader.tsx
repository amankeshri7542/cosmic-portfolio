import Link from "next/link";
import { Suspense } from "react";
import { Finder, type Destination } from "./Finder";
import { NavLinks } from "./NavLinks";
import { plates, prints } from "@/content/work";
import styles from "./SiteHeader.module.css";

export const primaryNav: Destination[] = [
  { href: "/work", label: "Work", hint: "Plates & contact sheet" },
  { href: "/about", label: "About", hint: "Story, timeline" },
  { href: "/blogs", label: "Blog", hint: "Notes & articles" },
  { href: "/contact", label: "Contact", hint: "Write to me" },
];

const destinations: Destination[] = [
  { href: "/", label: "Home", hint: "Start" },
  ...primaryNav,
  ...plates.map((p) => ({ href: `/work#${p.id}`, label: p.name, hint: `Plate ${p.plate}` })),
  ...prints.map((p) => ({ href: `/work#${p.id}`, label: p.title, hint: p.kind })),
  { href: "/amankeshridotcom.pdf", label: "Resume (PDF)", hint: "Download" },
  { href: "/blogs/rss.xml", label: "RSS feed", hint: "Subscribe" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`shell ${styles.bar}`}>
        <Link href="/" className={styles.mark} aria-label="Aman Kumar — home">
          <span className={styles.name}>Aman Kumar</span>
          <span className={`label ${styles.role}`}>Full-stack engineer · Bengaluru</span>
        </Link>
        <Suspense
          fallback={
            <nav aria-label="Primary" className={styles.nav}>
              {primaryNav.map((d) => <Link key={d.href} href={d.href}>{d.label}</Link>)}
            </nav>
          }
        >
          <NavLinks items={primaryNav} className={styles.nav} />
        </Suspense>
        <Finder destinations={destinations} primary={primaryNav} />
      </div>
    </header>
  );
}
