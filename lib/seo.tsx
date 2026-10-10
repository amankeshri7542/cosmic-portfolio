import type { Metadata } from "next";
import { SITE_URL, profile } from "@/content/profile";

export const OG_VERSION = "20261010";

export function pageMetadata(path: string, title: string, description: string, extra: Partial<Metadata> = {}): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url, types: { "application/rss+xml": `${SITE_URL}/blogs/rss.xml` } },
    openGraph: { type: "website", url, title, description, siteName: profile.name, locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    ...extra,
  };
}

/** Inline JSON-LD. `<` is escaped so content can never close the script element. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const personId = `${SITE_URL}/#person`;
export const websiteId = `${SITE_URL}/#website`;

export const personLd = {
  "@type": "Person",
  "@id": personId,
  name: profile.name,
  url: SITE_URL,
  jobTitle: "Full-stack Software Engineer",
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "JSS Academy of Technical Education, Bengaluru" },
  worksFor: { "@type": "Organization", name: "CodeApto India" },
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", name: "AWS Certified Solutions Architect – Associate (SAA-C03)", credentialCategory: "certification" },
  ],
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Rust", "PostgreSQL", "DynamoDB", "AWS", "Serverless", "Retrieval-augmented generation"],
  sameAs: [profile.github, profile.linkedin],
};

export const websiteLd = {
  "@type": "WebSite",
  "@id": websiteId,
  url: SITE_URL,
  name: "Aman Kumar",
  inLanguage: "en",
  publisher: { "@id": personId },
};
