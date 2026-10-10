import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/content/profile";

export const metadata: Metadata = { title: "Message sent", robots: { index: false, follow: false } };

export default function ThankYou() {
  return (
    <div className="shell" style={{ paddingBlock: "calc(var(--header-h) + 6rem) 8rem", display: "grid", gap: "1.2rem", maxWidth: "44rem" }}>
      <p className="label label--caps">Contact print · fixed</p>
      <h1 style={{ fontSize: "var(--step-5)" }}>Message sent.</h1>
      <p style={{ fontSize: "var(--step-1)", color: "var(--ink-2)" }}>
        Thank you for writing. I’ll reply from <a href={`mailto:${profile.email}`}>{profile.email}</a> — usually within a couple of days.
      </p>
      <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link className="button" href="/work">See the work</Link>
        <Link className="button" href="/blogs">Read the blog</Link>
      </p>
    </div>
  );
}
