import Link from "next/link";
import Image from "next/image";
import EngineeringStudies from "@/components/EngineeringStudies";
import ProjectArchive from "@/components/ProjectArchive";
import TechStack from "@/components/TechStack";
import BlogFeature from "@/components/BlogFeature";
import { getAllBlogs } from "@/lib/blog";
import { archive, profile } from "@/lib/portfolio";

export const dynamic = "force-dynamic";
export default async function Home() {
  const posts = await getAllBlogs();
  const latestPost = posts.find(post => !post.sample) ?? posts[0];
  return <main id="main-content">
    <section className="engineer-hero section-shell">
      <div className="engineer-intro">
        <p className="eyebrow"><span className="status-dot" /> Aman Kumar / Software engineer</p>
        <h1>I build the<br />whole product.<br /><span>From UI to AI<br />to cloud.</span></h1>
        <p className="hero-positioning">Full-stack engineering. Applied AI.<br />The infrastructure to bring it to life.</p>
        <p className="hero-description">I understand the business, build the product, and own the details between the interface and production.</p>
        <div className="hero-actions"><a className="primary-link" href="#work">Explore my work <span aria-hidden="true">↘</span></a><a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">Read my resume ↗</a></div>
        <div className="hero-credentials"><span>Full-stack at CodeApto</span><span>AWS Certified Solutions Architect</span></div>
      </div>
      <TechStack />
    </section>
    <section id="stack" className="stack-strip section-shell" aria-label="My technology stack">
      <p className="micro">Tools I build with</p>
      <div>{[["react","React"],["nextjs","Next.js"],["typescript","TypeScript"],["rust","Rust"],["python","Python"],["postgresql","PostgreSQL"],["amazonwebservices","AWS"],["docker","Docker"]].map(([icon,label]) => <span key={icon}><Image src={`/stack/${icon}.svg`} alt="" width={24} height={24} className={`tech-icon icon-${icon}`} />{label}</span>)}</div>
    </section>
    <section className="selected-section section-shell" id="work">
      <header className="section-intro"><div><p className="eyebrow">Selected engineering</p><h2>Real problems.<br /><span className="soft-heading">Working systems.</span></h2></div><p>From a shop’s daily billing to enterprise workflows and real-time communication. What I built, and the decisions behind it.</p></header>
      <EngineeringStudies />
    </section>
    <section className="ai-section section-shell" id="ai-work"><header className="section-intro"><div><p className="eyebrow">Applied intelligence</p><h2>AI, inside<br /><span className="soft-heading">the product.</span></h2></div><p>Useful experiences built around language, voice and vision. Connected to the people and workflows they serve.</p></header><div className="ai-projects">{[archive[0],archive[1],archive[4]].map(project => <article key={project.id}><Link className="ai-project-image" href={`/work#${project.id}`}><Image src={project.image} alt={`${project.title} product interface`} width={650} height={400} sizes="(max-width: 760px) 90vw, 30vw" /></Link><p className="micro">{project.kind}</p><h3><Link href={`/work#${project.id}`}>{project.title} <span aria-hidden="true">↗</span></Link></h3><p>{project.id === "shiv-cement" ? "A retail platform with a multilingual RAG assistant, connected web and mobile tools, and real business workflows." : project.description}</p><span className="stack">{project.tech}</span></article>)}</div></section>
    <section className="ownership-section section-shell"><div><p className="eyebrow">How I work</p><h2>The whole product.<br /><span className="soft-heading">Not just my part.</span></h2><Link href="/about" className="text-link">Meet the engineer ↗</Link></div><div className="ownership-steps"><article><span className="micro">Understand</span><h3>Start with the business.</h3><p>The users, the daily friction, the constraints. A useful product begins with the right problem.</p></article><article><span className="micro">Build</span><h3>Connect every layer.</h3><p>Interface, API, data and AI where it helps. I follow the feature across boundaries.</p></article><article><span className="micro">Operate</span><h3>Design for what comes next.</h3><p>Transactions, background workers, caching and repeatable deployments. Concrete foundations for growth.</p></article></div></section>
    <section className="archive-section section-shell" id="archive"><header className="archive-heading"><div><p className="eyebrow">More things I’ve shipped</p><h2>The project archive.</h2></div><p>AI experiments, business platforms,<br />cloud infrastructure and focused tools.</p></header><ProjectArchive /></section>
    {latestPost && <section className="home-writing section-shell" id="blog"><header className="writing-heading"><div><p className="eyebrow">Engineering notes</p><h2>Thinking through<br /><span className="soft-heading">the details.</span></h2></div><Link className="text-link" href="/blogs">Read the blog ↗</Link></header><BlogFeature blog={latestPost} home /></section>}
    <section className="contact-invitation"><div className="section-shell"><p className="eyebrow">For teams with ambition. And problems worth solving.</p><h2>Let’s build<br /><span className="soft-heading">something useful.</span></h2><div className="contact-invitation-bottom"><Link className="primary-link" href="/contact">Start a conversation <span>↗</span></Link><a href={`mailto:${profile.email}`}>{profile.email}</a></div><p className="quiet-signature"><span lang="hi">राम</span> Curiosity in the work. A quiet constant underneath.</p></div></section>
  </main>;
}
