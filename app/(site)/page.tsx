import { Story } from "@/components/story/Story";
import { Projects } from "@/components/home/Projects";
import { Experience } from "@/components/home/Experience";
import { LatestNote } from "@/components/home/LatestNote";
import { ContactCta } from "@/components/home/ContactCta";
import { plates, prints } from "@/content/work";
import { JsonLd } from "@/lib/seo";
import { SITE_URL } from "@/content/profile";

export default function Home() {
  return (
    <>
      <Story />
      <Projects />
      <Experience />
      <LatestNote />
      <ContactCta />
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
