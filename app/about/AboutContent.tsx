import Link from "next/link";
import GitHubActivity from "@/components/GitHubActivity";
import { profile } from "@/lib/portfolio";
export default function AboutContent() {
  return (
    <main id="main-content" className="reading-page section-shell about-page">
      <header className="page-heading">
        <p className="eyebrow">Aman Kumar / Bengaluru, India</p>
        <h1>
          Understand the need.
          <br />
          <em>Build the whole thing.</em>
        </h1>
      </header>
      <div className="about-grid">
        <div className="about-body">
          <p>
            I’m a full-stack software engineer and AWS Certified Solutions
            Architect. I build across the interface, backend, database and
            deployment — because a feature is only useful when all of them work
            together.
          </p>
          <p>
            Currently, I’m a Full-Stack Software Engineering Intern at CodeApto,
            working on an enterprise Procure-to-Pay platform with React,
            TypeScript, Rust, Axum and PostgreSQL.
          </p>
          <p>
            My independent work includes a production ERP for a hardware
            business, serverless communication systems, and smaller experiments
            in cloud and AI.
          </p>
          <p>
            I start by understanding what the business and its users need. Then I
            carry the work from the interface through the backend and into
            production, with an eye on how the product will grow.
          </p>
          <p>
            I care about the details that are easy to miss: a transaction that
            cannot leave half a record, a permission checked at the right
            boundary, a deployment that can be rolled back.
          </p>
          <div className="ram-inscription">
            <span lang="hi">राम</span>
            <span>
              Beyond the complexity,
              <br />
              Ram Naam is my quieter center.
            </span>
          </div>
          <p className="about-letter-signature">Still learning. Still looking up.</p>
          <div className="text-links">
            <a href={profile.resume} target="_blank" rel="noopener noreferrer">
              Read my resume ↗
            </a>
            <Link href="/contact">Start a conversation ↗</Link>
          </div>
        </div>
        <aside className="about-aside">
          <h2>Learning, with intent.</h2>
          <ul className="credentials">
            <li>
              <span>Feb 2026</span>
              <strong>AWS Certified Solutions Architect — Associate</strong>
              <p>Amazon Web Services · SAA-C03</p>
            </li>
            <li>
              <span>Apr 2026</span>
              <strong>
                Advanced Certification in Cloud Computing & DevOps
              </strong>
              <p>E&ICT Academy, IIT Guwahati</p>
            </li>
            <li>
              <span>Oct 2025</span>
              <strong>AWS Certified Cloud Practitioner</strong>
              <p>Amazon Web Services</p>
            </li>
            <li>
              <span>2021 — 2025</span>
              <strong>B.E. Computer Science</strong>
              <p>JSS Academy of Technical Education, Bengaluru</p>
            </li>
            <li>
              <span>Mar 2023</span>
              <strong>CODEATHON — 3rd place</strong>
              <p>JSS Academy of Technical Education</p>
            </li>
          </ul>
        </aside>
      </div>
      <section className="career-section">
        <p className="eyebrow">Experience</p>
        <h2>The work so far.</h2>
        <div className="career-entry">
          <time>Jun 2026 — present</time>
          <div>
            <h3>CodeApto India Private Limited</h3>
            <p>
              Full-Stack Software Engineering Intern. Enterprise procurement
              workflows, tenant-specific data handling, workflow rules and tests
              across React, Rust and PostgreSQL.
            </p>
          </div>
        </div>
        <div className="career-entry">
          <time>Aug 2025 — Mar 2026</time>
          <div>
            <h3>Shiv Cement Store</h3>
            <p>
              Contract full-stack development. A business platform connecting a
              customer website, staff mobile app, REST API and an AI-assisted
              enquiry flow.
            </p>
            <Link className="text-link" href="/work#shiv-cement">
              Explore the project ↗
            </Link>
          </div>
        </div>
        <div className="career-entry">
          <time>Feb 2025 — Aug 2025</time>
          <div>
            <h3>Technosys IT Management</h3>
            <p>
              Cloud & Full-Stack Engineering Intern. AWS migration, EC2
              deployment, Route 53, IAM and Security Groups, with Docker and
              GitHub Actions release workflows.
            </p>
          </div>
        </div>
      </section>
      <GitHubActivity />
    </main>
  );
}
