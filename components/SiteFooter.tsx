import Link from "next/link";
import { profile } from "@/content/profile";
import { Inspect } from "./Inspect";
import styles from "./SiteFooter.module.css";

const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.BUILD_SHA || "local").slice(0, 7);
const built = process.env.BUILD_TIME?.slice(0, 10) ?? "";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.grid}`}>
        <div className={styles.reach}>
          <p className="label label--caps">Reach me</p>
          <a className={styles.email} href={`mailto:${profile.email}`}>{profile.email}</a>
          <ul role="list" className={styles.links}>
            <li><Link href="/contact">Contact form</Link></li>
            <li><a href={profile.linkedin} rel="me noopener" target="_blank">LinkedIn ↗</a></li>
            <li><a href={profile.github} rel="me noopener" target="_blank">GitHub ↗</a></li>
            <li><a href={profile.resume}>Resume (PDF)</a></li>
            <li><a href="/blogs/rss.xml">RSS</a></li>
          </ul>
        </div>
        <div className={styles.colophon}>
          <p className="label label--caps">Colophon</p>
          <p className="label">
            Printed in Prussian blue. Set in Redaction, Anek and Martian Mono. The night sky is the Yale Bright
            Star Catalogue, as seen from Bengaluru at the moment you opened the page.
          </p>
          <p className={`label ${styles.build}`}>
            build <code>{sha}</code>{built && <> · {built}</>} · served from bom1
          </p>
          <Inspect sha={sha} />
        </div>
      </div>
    </footer>
  );
}
