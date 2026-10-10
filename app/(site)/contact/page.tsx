import type { Metadata } from "next";
import { profile } from "@/content/profile";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import styles from "./contact.module.css";

export const metadata: Metadata = pageMetadata(
  "/contact",
  "Contact Aman Kumar",
  "Write to Aman Kumar about a role, a project or a system that needs to hold. Email, LinkedIn and GitHub.",
);

export default function ContactPage() {
  return (
    <div className={`shell ${styles.page}`}>
      <header className={styles.head}>
        <p className="label label--caps">Contact</p>
        <h1>Write to me.</h1>
        <p>
          A role, a project, a question about something I’ve built, or a system you need to stay steady. I read every message
          and reply from <a href={`mailto:${profile.email}`}>{profile.email}</a>.
        </p>
        <ul role="list" className={styles.direct}>
          <li><a href={`mailto:${profile.email}`}>Email</a></li>
          <li><a href={profile.linkedin} target="_blank" rel="me noopener">LinkedIn ↗</a></li>
          <li><a href={profile.github} target="_blank" rel="me noopener">GitHub ↗</a></li>
          <li><a href={profile.resume}>Resume (PDF)</a></li>
        </ul>
      </header>
      <ContactForm email={profile.email} />
    </div>
  );
}
