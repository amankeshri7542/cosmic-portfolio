import Link from "next/link";
import Image from "next/image";
import EngineeringStudies from "@/components/EngineeringStudies";
import ProjectArchive from "@/components/ProjectArchive";
import ObjectStudy from "@/components/observatory/ObjectStudy";
import FieldEffects from "@/components/observatory/FieldEffects";
import InterferenceStudy from "@/components/observatory/InterferenceStudy";
import BlogFeature from "@/components/BlogFeature";
import { getAllBlogs } from "@/lib/blog";
import { profile } from "@/lib/portfolio";

export const dynamic = "force-dynamic";
export default async function Home() {
  const posts = await getAllBlogs();
  const latestPost = posts.find(post => !post.sample) ?? posts[0];
  return <main id="main-content">
    <FieldEffects />
    <section className="cosmic-hero" id="threshold">
      <div className="hero-landscape"><Image src="/observatory/cosmic-landscape-v2.png" alt="An ink-drawn planetary horizon above winding mineral formations" fill priority sizes="(max-width: 760px) 1400px, 100vw" /></div>
      <div className="hero-shade" />
      <div className="hero-content section-shell">
        <p className="eyebrow">Aman Kumar <span className="label-divider">/</span> Full-stack engineer</p>
        <h1>Small details.<br /><span>Infinite</span><br /><em>curiosity.</em></h1>
        <p className="hero-intro">I build software from the interface down.<br />And keep looking a little further out.</p>
        <a className="hero-cta" href="#work">Come explore the work <span aria-hidden="true">↓</span></a>
      </div>
      <div className="hero-marginalia handwritten" aria-hidden="true">Different scales.<br />The same curiosity.<svg viewBox="0 0 130 90"><path d="M7 4q85 0 104 63m-19-8 21 12 0-22" /></svg></div>
      <div className="hero-satellite"><ObjectStudy kind="satellite" compact /></div>
      <div className="hero-foot section-shell"><p><span className="status-dot" /> Currently at CodeApto <span className="muted">· Bengaluru, India</span></p><span className="micro">A field journal of things built &amp; wondered about</span></div>
    </section>
    <section className="stack-section paper-section" id="stack"><div className="section-shell stack-layout">
      <div className="stack-copy"><p className="eyebrow">Between the interface &amp; the infrastructure</p><h2>I like knowing<br />how it <em>all connects.</em></h2><p>A screen is one part of a system. I work through the services, data and deployment that make it useful.</p><div className="stack-layers">
        <div><span className="stack-layer-mark">UI</span><div><h3>The part you use</h3><p>React · Next.js · TypeScript · Tailwind CSS</p></div></div>
        <div><span className="stack-layer-mark">API</span><div><h3>The rules underneath</h3><p>Rust / Axum · Node.js · Express · Python</p></div></div>
        <div><span className="stack-layer-mark">DATA</span><div><h3>The things that must hold</h3><p>PostgreSQL · DynamoDB · Redis · AWS · Docker</p></div></div>
      </div></div><div className="stack-figure"><p className="figure-label micro">A study in layers / drag to separate</p><ObjectStudy kind="circuit" /><span className="figure-side-note handwritten">The interesting bits<br />are often underneath.</span></div>
    </div></section>
    <section className="selected-section paper-section" id="work"><div className="section-shell"><header className="section-intro"><div><p className="eyebrow">Selected work</p><h2>Ideas, with their<br /><em>feet on the ground.</em></h2></div><p>Business software. Guarded workflows.<br />Conversations that keep moving.<br />A few things I’ve been building.</p></header><EngineeringStudies /></div></section>
    <section className="light-passage" id="ground"><div className="section-shell light-layout"><div className="light-copy"><p className="eyebrow">A little further out</p><h2>There’s more here<br />than meets <em>the eye.</em></h2><p>I’m drawn to the patterns in nature — light, matter, the scale of the universe. The things that make you pause before trying to explain them.</p><p>Engineering is how I work with complexity.<br />Ram Naam is what keeps me grounded within it.</p><details className="quiet-discovery"><summary><span lang="hi">राम</span><span>A quiet constant <span aria-hidden="true">+</span></span></summary><p>For me, Ram Naam is the thread holding everything together. Something immense, held in a very small word.</p></details><Link href="/about" className="text-link">A little more about me ↗</Link></div><div className="light-figure"><ObjectStudy kind="prism" /><p className="spectrum-caption">Visible light · roughly 380–700 nm<br /><span>An illustration of how a prism separates visible light.</span></p></div></div><div className="section-shell"><InterferenceStudy /></div></section>
    <section className="archive-section paper-section" id="archive"><div className="section-shell"><header className="archive-heading"><div><p className="eyebrow">The rest of the notebook</p><h2>Built out of <em>curiosity.</em></h2></div><p>Small tools, business platforms<br />and experiments that became something.</p></header><ProjectArchive /></div></section>
    {latestPost && <section className="home-writing paper-section" id="blog"><div className="section-shell"><header className="writing-heading"><div><p className="eyebrow">From the blog</p><h2>Working things out,<br /><em>in writing.</em></h2></div><Link className="text-link" href="/blogs">Visit the blog <span aria-hidden="true">↗</span></Link></header><BlogFeature blog={latestPost} home /></div></section>}
    <section className="contact-invitation"><div className="section-shell"><p className="eyebrow">The next page is unwritten</p><h2>What are you<br /><em>working on?</em></h2><div className="contact-invitation-bottom"><Link className="hero-cta" href="/contact">Let’s talk <span>↗</span></Link><a href={`mailto:${profile.email}`}>{profile.email}</a><Link href="/blogs">Read the blog ↗</Link></div><span className="contact-scribble handwritten">Good things start<br />with a conversation.</span></div></section>
  </main>;
}
