import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
    <SiteHeader />
    <main id="main">
    <div className="shell" style={{ paddingBlock: "calc(var(--header-h) + 6rem) 8rem", display: "grid", gap: "1.2rem", maxWidth: "44rem" }}>
      <p className="label label--caps">404 · not found</p>
      <h1 style={{ fontSize: "var(--step-5)", }}>This page isn’t built yet.</h1>
      <p style={{ fontSize: "var(--step-1)", color: "var(--ink-2)" }}>
        The page may have moved, or the link has a typo. Try the work, the blog, or press <kbd>/</kbd> to find a page.
      </p>
      <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link className="button button--solid" href="/">Home</Link>
        <Link className="button" href="/work">Work</Link>
        <Link className="button" href="/blogs">Blog</Link>
      </p>
    </div>
    </main>
    <SiteFooter />
    </>
  );
}
