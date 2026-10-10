import { Story } from "@/components/story/Story";
import { Projects } from "@/components/home/Projects";
import { Experience } from "@/components/home/Experience";
import { LatestNote } from "@/components/home/LatestNote";
import { BuildYours } from "@/components/home/BuildYours";
import { plates, prints } from "@/content/work";
import { JsonLd } from "@/lib/seo";
import { SITE_URL, profile } from "@/content/profile";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata(
    "/",
    "Aman Kumar — full-stack software engineer, Bengaluru",
    `${profile.summary} Scroll to watch a product get built, layer by layer — and try it.`,
  ),
  title: { absolute: "Aman Kumar — full-stack software engineer, Bengaluru" },
};

export default function Home() {
  return (
    <>
      <Story />
      <BuildYours />
      <Projects />
      <Experience />
      <LatestNote />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Projects by Aman Kumar",
          itemListElement: [...plates.map((p) => ({ name: p.name, id: p.id })), ...prints.map((p) => ({ name: p.title, id: p.id }))].map((x, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: x.name,
            url: `${SITE_URL}/work#${x.id}`,
          })),
        }}
      />
    </>
  );
}
