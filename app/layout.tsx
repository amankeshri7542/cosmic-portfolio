import "@/styles/global.css";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { SITE_URL, profile } from "@/content/profile";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Aman Kumar — full-stack software engineer, Bengaluru", template: "%s · Aman Kumar" },
  description: profile.summary,
  applicationName: "Aman Kumar",
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  alternates: { canonical: SITE_URL, types: { "application/rss+xml": `${SITE_URL}/blogs/rss.xml` } },
  openGraph: { type: "website", siteName: profile.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = { themeColor: "#0f2c57", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Before first paint: let the home story start from an empty canvas when motion is allowed. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement;var off=false;try{off=localStorage.getItem('story-motion')==='off'}catch(e){}if(!off&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('story-motion');setTimeout(function(){if(!d.classList.contains('story-live'))d.classList.remove('story-motion')},6000)}}catch(e){}})()",
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
