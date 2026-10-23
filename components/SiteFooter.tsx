import Link from "next/link";
import { profile } from "@/content/profile";
import { Drip } from "./acid/Text";
import { MotionToggle } from "./acid/MotionToggle";
import { ChaosSwitch } from "./acid/ChaosSwitch";
import { Inspect } from "./Inspect";
import styles from "./SiteFooter.module.css";

const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.BUILD_SHA || "local").slice(0, 7);
const built = process.env.BUILD_TIME?.slice(0, 10) ?? "";

export function SiteFooter() {
  return (
    <footer className={`sec ${styles.footer}`} data-sec="foot">
      <div className={styles.grid}>
        <div className={styles.reach}>
          <Drip text="REACH ME ✺ ONE EMAIL AWAY" as="p" className={styles.kick} />
          <a className={styles.email} href={`mailto:${profile.email}`}>{profile.email}</a>
          <ul role="list" className={styles.links}>
            <li><Link href="/contact">Start a project</Link></li>
            <li><a href={profile.linkedin} rel="me noopener" target="_blank">LinkedIn ↗</a></li>
            <li><a href={profile.github} rel="me noopener" target="_blank">GitHub ↗</a></li>
            <li><a href={profile.resume}>Resume (PDF)</a></li>
            <li><a href="/blogs/rss.xml">RSS</a></li>
          </ul>
        </div>
        <div className={styles.colophon}>
          <p className="label">
            © {built.slice(0, 4) || "2026"} Aman Kumar Keshri · freelance full-stack developer · Bengaluru, India
          </p>
          <p className="label">Set in Unbounded, Shrikhand, Space Grotesk and Space Mono. Motion respects your reduced-motion setting.</p>
          <p className={`label ${styles.build}`}>
            build <code>{sha}</code>{built && <> · {built}</>} · served from bom1
          </p>
          <div className={styles.switches}>
            <MotionToggle />
            <Inspect sha={sha} />
            <div className={styles.egg}><ChaosSwitch /></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
