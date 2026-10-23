import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Ambient } from "@/components/acid/Ambient";
import { PageHead } from "@/components/acid/PageHead";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="lab">
          <Ambient />
          <div className="shell short-page">
            <PageHead
              kicker="404 ✺ NOT FOUND"
              title="This page isn’t *built* yet."
              lede="The page may have moved, or the link has a typo. Try the work, the blog, or press / to find a page."
            >
              <p className="row">
                <Link className="cta cta-main cta-sm" href="/">Home</Link>
                <Link className="cta cta-ghost cta-sm" href="/work">Work</Link>
                <Link className="cta cta-ghost cta-sm" href="/blogs">Blog</Link>
              </p>
            </PageHead>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
