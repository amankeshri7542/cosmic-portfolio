import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/content/profile";
import { terms } from "@/content/services";
import { Ambient } from "@/components/acid/Ambient";
import { PageHead } from "@/components/acid/PageHead";

export const metadata: Metadata = { title: "Message sent", robots: { index: false, follow: false } };

export default function ThankYou() {
  return (
    <div className="lab">
      <Ambient />
      <div className="shell short-page">
        <PageHead
          kicker="CONTACT ✺ DELIVERED, 0 RECORDS LOST"
          title="Message *sent.*"
          lede={`Thank you for writing. I’ll reply from ${profile.email}${terms.replyTime ? ` within ${terms.replyTime}` : ", usually within a couple of days"}.`}
        >
          <p className="row">
            <Link className="cta cta-main cta-sm" href="/work">See the work</Link>
            <Link className="cta cta-ghost cta-sm" href="/blogs">Read the blog</Link>
          </p>
        </PageHead>
      </div>
    </div>
  );
}
