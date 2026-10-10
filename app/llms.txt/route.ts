import { getPublishedPosts } from "@/lib/posts";
import { SITE_URL, credentials, experience, profile } from "@/content/profile";
import { plates, prints } from "@/content/work";

// A plain-text map of the site for language models and other agents (llmstxt.org).
export async function GET() {
  const posts = (await getPublishedPosts()).filter((p) => !p.sample);
  const body = `# ${profile.name}

> ${profile.summary}

${profile.name} is based in ${profile.location}. Contact: ${profile.email}. GitHub: ${profile.github}. LinkedIn: ${profile.linkedin}. Resume: ${SITE_URL}${profile.resume}

## Experience
${experience.map((r) => `- ${r.title}, ${r.org} (${r.period})`).join("\n")}

## Credentials
${credentials.map((c) => `- ${c.name} (${c.date})`).join("\n")}

## Case studies
${plates.map((p) => `- [${p.name}](${SITE_URL}/work#${p.id}): ${p.lede} Stack: ${p.stack.join(", ")}.`).join("\n")}

## Other projects
${prints.map((p) => `- [${p.title}](${SITE_URL}/work#${p.id}): ${p.description}`).join("\n")}

## Writing
${posts.map((p) => `- [${p.title}](${SITE_URL}/blogs/${p.slug}): ${p.excerpt}`).join("\n")}

## Pages
- [About](${SITE_URL}/about)
- [Work](${SITE_URL}/work)
- [Blog](${SITE_URL}/blogs) · [RSS](${SITE_URL}/blogs/rss.xml)
- [Contact](${SITE_URL}/contact)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
