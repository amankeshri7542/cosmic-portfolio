import Link from "next/link";
import { Suspense } from "react";
import { Finder, type Destination } from "./Finder";
import { NavLinks } from "./NavLinks";
import { ChaosSwitch } from "./acid/ChaosSwitch";
import { plates, prints } from "@/content/work";
import styles from "./SiteHeader.module.css";

export const primaryNav: Destination[] = [
  { href: "/work", label: "Work", hint: "Case studies & projects" },
  { href: "/about", label: "About", hint: "Story, timeline" },
  { href: "/blogs", label: "Blog", hint: "Notes & articles" },
  { href: "/contact", label: "Contact", hint: "Start a project" },
];

const destinations: Destination[] = [
  { href: "/", label: "Home", hint: "Start" },
  ...primaryNav,
  { href: "/#services", label: "Services", hint: "What you can hire me for" },
  { href: "/#stack", label: "Tech stack", hint: "Tools I ship with" },
  { href: "/#brief", label: "Brief builder", hint: "Pick what you need" },
  ...plates.map((p) => ({ href: `/work#${p.id}`, label: p.name, hint: `Case study ${p.plate}` })),
  ...prints.map((p) => ({ href: `/work#${p.id}`, label: p.title, hint: p.kind })),
  { href: "/amankeshridotcom.pdf", label: "Resume (PDF)", hint: "Download" },
  { href: "/blogs/rss.xml", label: "RSS feed", hint: "Subscribe" },
];

export function SiteHeader() {
  return (
    <header className={`sec in vis ${styles.header}`} data-sec="head">
      <div className={styles.bar}>
        <Link href="/" className={styles.mark}>
          AK<span aria-hidden="true">✺</span>
          <span className="sr"> · Aman Keshri, home</span>
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
        <div className={styles.tools}>
          <div className={styles.egg}><ChaosSwitch /></div>
          <Finder destinations={destinations} primary={primaryNav} />
          <Link href="/contact" className={`cta cta-main ${styles.hire}`}>Hire me</Link>
        </div>
      </div>
    </header>
  );
}
