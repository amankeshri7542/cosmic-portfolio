import type { Metadata } from "next";
import { SITE_URL, profile } from "@/content/profile";

export const OG_VERSION = "20261010b"; // bump to make social networks fetch a new preview image

// Site-wide preview image (app/opengraph-image.tsx). Articles override it with their own.
const ogImageRef = { url: `/opengraph-image?v=${OG_VERSION}`, width: 1200, height: 630, alt: "Aman Kumar — Let’s build a product, together." };

export function pageMetadata(path: string, title: string, description: string, extra: Partial<Metadata> = {}): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url, types: { "application/rss+xml": `${SITE_URL}/blogs/rss.xml` } },
    openGraph: { type: "website", url, title, description, siteName: "Aman Keshri", locale: "en_IN", images: [ogImageRef] },
    twitter: { card: "summary_large_image", title, description, images: [ogImageRef] },
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
  name: "Aman Kumar Keshri",
  alternateName: ["Aman Keshri", "Aman Kumar"],
  url: SITE_URL,
  image: `${SITE_URL}/about/aman.webp`,
  description: profile.summary,
  jobTitle: "Freelance Full-stack Developer",
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
  homeLocation: { "@type": "Place", name: "Bengaluru, India" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "JSS Academy of Technical Education, Bengaluru" },
  worksFor: { "@type": "Organization", name: "CodeApto India" },
  hasOccupation: {
    "@type": "Occupation",
    name: "Full-stack Software Engineer",
    occupationLocation: { "@type": "City", name: "Bengaluru" },
    skills: "React, Next.js, TypeScript, Node.js, Rust (Axum), PostgreSQL, Redis, DynamoDB, AWS, Docker, GitHub Actions, retrieval-augmented generation",
  },
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", name: "AWS Certified Solutions Architect – Associate (SAA-C03)", credentialCategory: "certification", recognizedBy: { "@type": "Organization", name: "Amazon Web Services" } },
    { "@type": "EducationalOccupationalCredential", name: "AWS Certified Cloud Practitioner", credentialCategory: "certification", recognizedBy: { "@type": "Organization", name: "Amazon Web Services" } },
    { "@type": "EducationalOccupationalCredential", name: "Advanced Certification in Cloud Computing & DevOps", credentialCategory: "certificate", recognizedBy: { "@type": "Organization", name: "E&ICT Academy, IIT Guwahati" } },
    { "@type": "EducationalOccupationalCredential", name: "B.E. Computer Science", credentialCategory: "degree", recognizedBy: { "@type": "CollegeOrUniversity", name: "JSS Academy of Technical Education, Bengaluru" } },
  ],
  award: "CODEATHON 2023 — 3rd place, JSS Academy of Technical Education",
  knowsAbout: ["Full-stack development", "Freelance web development", "React", "Next.js", "TypeScript", "Node.js", "Rust", "Axum", "PostgreSQL", "Database transactions", "Redis", "DynamoDB", "AWS", "Serverless", "Docker", "CI/CD", "Retrieval-augmented generation", "Procure-to-pay systems", "ERP systems"],
  sameAs: [profile.github, profile.linkedin],
};

export const websiteLd = {
  "@type": "WebSite",
  "@id": websiteId,
  url: SITE_URL,
  name: "Aman Keshri",
  alternateName: ["Aman Kumar", "amankeshri.com"],
  inLanguage: "en",
  publisher: { "@id": personId },
};
