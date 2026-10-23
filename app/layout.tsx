import "@/styles/global.css";
import "@/styles/acid.css";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { SITE_URL, profile } from "@/content/profile";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Aman Keshri (Aman Kumar) — freelance full-stack developer, Bengaluru", template: "%s · Aman Keshri" },
  description: profile.summary,
  applicationName: "Aman Keshri",
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  alternates: { canonical: SITE_URL, types: { "application/rss+xml": `${SITE_URL}/blogs/rss.xml` } },
  openGraph: { type: "website", siteName: profile.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  // Search-engine ownership checks (Google Search Console, Bing Webmaster Tools), set as env vars on Vercel.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = { themeColor: "#0A0A0F", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Before first paint: restore this visitor's palette and "Pause motion" choice, so nothing flashes. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement,p=localStorage.getItem('pal');if(p&&p!=='0')d.dataset.pal=p;if(localStorage.getItem('motion')==='off')d.dataset.motion='off'}catch(e){}})()",
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
