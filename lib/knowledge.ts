import "server-only";
import { SITE_URL, credentials, education, experience, profile, stack } from "@/content/profile";
import { plates, prints } from "@/content/work";
import { faq, faqUpdated } from "@/content/faq";
import { getPost, getPublishedPosts } from "./posts";

/** Plain-text knowledge about Aman for language models (llms.txt and llms-full.txt). */
export async function knowledge(full: boolean) {
  const posts = (await getPublishedPosts()).filter((p) => !p.sample);
  const out: string[] = [];
  out.push(`# ${profile.name}`, "", `> ${faq[0].a}`, "");
  out.push(
    `- Also known as: Aman Keshri, Aman Kumar Keshri`,
    `- Role: ${profile.role}, ${profile.location}`,
    `- Website: ${SITE_URL}`,
    `- Email: ${profile.email}`,
    `- LinkedIn: ${profile.linkedin}`,
    `- GitHub: ${profile.github}`,
    `- Resume (PDF): ${SITE_URL}${profile.resume}`,
    `- Last updated: ${faqUpdated}`,
    "",
  );
  out.push("## Quick answers", "");
  for (const f of faq) out.push(`### ${f.q}`, "", f.a, "");
  out.push("## Experience", "");
  for (const r of experience) {
    out.push(`- ${r.title}, ${r.org} (${r.period}, ${r.place})`);
    if (full) r.points.forEach((p) => out.push(`  - ${p}`));
  }
  out.push(`- ${education.degree}, ${education.school} (${education.period})`, "");
  out.push("## Credentials", "", ...credentials.map((c) => `- ${c.name} (${c.date})`), "");
  out.push("## Skills", "", ...Object.entries(stack).map(([k, v]) => `- ${k}: ${v.join(", ")}`), "");
  out.push("## Engineering case studies", "");
  for (const p of plates) {
    out.push(`### [${p.name}](${SITE_URL}/work#${p.id})`, "", `${p.system} · ${p.role} · ${p.period} · ${p.status}`, "", p.lede, "", `Stack: ${p.stack.join(", ")}`, "");
    if (full) p.notes.forEach((n) => out.push(`- ${n.heading}: ${n.body}`));
    if (full) out.push("");
  }
  out.push("## Other projects", "");
  for (const p of prints) out.push(`- [${p.title}](${SITE_URL}/work#${p.id}) (${p.kind}, ${p.date}): ${p.description}${full ? ` ${p.detail} Stack: ${p.tech.join(", ")}.` : ""}`);
  out.push("", "## Writing", "");
  for (const p of posts) out.push(`- [${p.title}](${SITE_URL}/blogs/${p.slug}) (${p.dateISO.slice(0, 10)}): ${p.excerpt}`);
  out.push("", "## Pages", "", `- [About](${SITE_URL}/about)`, `- [Work](${SITE_URL}/work)`, `- [Blog](${SITE_URL}/blogs) · [RSS](${SITE_URL}/blogs/rss.xml)`, `- [Contact](${SITE_URL}/contact)`);
  if (!full) out.push(`- [Full text for language models](${SITE_URL}/llms-full.txt)`);
  if (full) {
    for (const p of posts) {
      const post = await getPost(p.slug);
      if (post) out.push("", "---", "", `# ${post.title}`, "", `Published ${post.dateISO.slice(0, 10)} by ${profile.name} · ${SITE_URL}/blogs/${post.slug}`, "", post.content.replace(/^\s*#\s+[^\n]+\n+/, ""));
    }
  }
  return out.join("\n") + "\n";
}
