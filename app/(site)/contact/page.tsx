import type { Metadata } from "next";
import { profile } from "@/content/profile";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import { Ambient } from "@/components/acid/Ambient";
import { PageHead } from "@/components/acid/PageHead";
import { terms } from "@/content/services";
import styles from "./contact.module.css";

export const metadata: Metadata = pageMetadata(
  "/contact",
  "Contact me — Aman Kumar",
  "I’m Aman Kumar (Aman Keshri). Write to me about a project, a role or a system that needs to hold. Email, LinkedIn and GitHub.",
);

export default function ContactPage() {
  return (
    <div className="lab">
    <Ambient />
    <div className={`shell ${styles.page}`}>
      <PageHead
        kicker="CONTACT ✺ START A PROJECT"
        title="Write to *me.*"
        lede={`A project, a role, a question about something I’ve built, or a system you need to stay steady. I read every message and reply with a plan${terms.replyTime ? ` within ${terms.replyTime}` : ""}.`}
      >
        <ul role="list" className={styles.direct}>
          <li><a href={`mailto:${profile.email}`}>Email</a></li>
          <li><a href={profile.linkedin} target="_blank" rel="me noopener">LinkedIn ↗</a></li>
          <li><a href={profile.github} target="_blank" rel="me noopener">GitHub ↗</a></li>
          <li><a href={profile.resume}>Resume (PDF)</a></li>
        </ul>
      </PageHead>
      <section className="sec" data-sec="form" aria-label="Contact form">
        <ContactForm email={profile.email} />
      </section>
    </div>
    </div>
  );
}
