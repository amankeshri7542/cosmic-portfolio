import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Enhance } from "@/components/Enhance";
import { JsonLd, personLd, websiteLd } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [personLd, websiteLd] }} />
      <Suspense fallback={null}><Enhance /></Suspense>
    </>
  );
}
