// The freelance side of the site: what you can hire Aman for, how a project runs, and the fresh live builds.
// Facts only. The three terms below stay null until Aman sets them; null terms are simply not shown.

export const terms: { startingPrice: string | null; replyTime: string | null; supportPeriod: string | null } = {
  startingPrice: null, // e.g. "₹40,000"
  replyTime: null, // e.g. "24 hours"
  supportPeriod: null, // e.g. "30 days"
};

export type Service = { kicker: string; title: string; body: string; proof: string };

export const services: Service[] = [
  { kicker: "INTERFACE", title: "Web apps & dashboards", body: "Fast, accessible screens in React, Next.js and TypeScript that work on a cheap phone and a big monitor.", proof: "Procure-to-Pay platform" },
  { kicker: "SERVICES", title: "Backends & APIs", body: "Node.js or Rust with PostgreSQL and Redis. Role-based access and transactions that never leave data half-written.", proof: "Hardware Store ERP" },
  { kicker: "CLOUD", title: "AWS setup & deployment", body: "EC2, S3, Lambda, Route 53 and CI/CD with Docker and GitHub Actions. Repeatable releases, simple rollback.", proof: "Vartalaap, client AWS migration" },
  { kicker: "APPLIED AI", title: "AI on your own data", body: "RAG assistants that answer from your records in Hindi, English or Hinglish, plus vision and voice tools.", proof: "Shiv Cement Store, MedScan AI" },
];

export const habits = [
  { title: "Start with the business", body: "Who uses it, what slows them down, what must never be wrong. Only then do I open the editor." },
  { title: "Follow the feature through every layer", body: "Interface, API, data model and cloud, and applied AI where it genuinely helps. I don’t stop at the boundary of my part." },
  { title: "Design for the bad day", body: "Transactions that can’t leave half a record, permissions checked where they matter, deployments that roll back cleanly." },
];

export function processSteps() {
  return [
    { title: "Brief", body: "You tell me the problem. A short call or message is enough." },
    { title: "Plan & price", body: "A written scope, timeline and price before any code." },
    { title: "Build in the open", body: "A preview link you can click, updated as I go." },
    {
      title: "Launch & support",
      body: terms.supportPeriod
        ? `Deployed on your domain, documented, with ${terms.supportPeriod} of fixes.`
        : "Deployed on your domain, documented, and handed over with a walkthrough.",
    },
  ];
}

/** Where each tool shows up in the work. Keys match content/profile.ts `stack`. */
export const usedIn: Record<string, string[]> = {
  React: ["Hardware Store ERP", "Procure-to-Pay platform", "Foxpop.in"],
  "Next.js": ["Vartalaap", "Shiv Cement Store", "MedScan AI", "URL Shortener", "Prompt Enhancer"],
  TypeScript: ["Procure-to-Pay platform", "URL Shortener"],
  "HTML & CSS": ["Every web project on this page"],
  "React Native / Expo": ["Shiv Cement staff & admin app", "MedScan AI (Android)"],
  "Node.js": ["Hardware Store ERP", "AI-Powered Alexa Assistant", "Foxpop.in"],
  Express: ["Hardware Store ERP", "Shiv Cement Store API", "Foxpop.in"],
  "Rust / Axum": ["Procure-to-Pay platform (CodeApto)"],
  REST: ["Shiv Cement Store API", "Hardware Store ERP"],
  WebSockets: ["Vartalaap (API Gateway WebSockets)"],
  JWT: ["Auth on the APIs I build"],
  PostgreSQL: ["Hardware Store ERP (one transaction per sale)", "Procure-to-Pay platform"],
  MongoDB: ["Shiv Cement Store", "Foxpop.in"],
  Redis: ["Hardware Store ERP (BullMQ job queues)"],
  DynamoDB: ["Vartalaap (single-table design)", "AI-Powered Alexa Assistant"],
  EC2: ["Foxpop.in", "Technosys client migration"],
  S3: ["Hardware Store ERP (private invoice PDFs)", "Shiv Cement Store uploads"],
  RDS: ["Hardware Store ERP"],
  Lambda: ["Vartalaap", "AI-Powered Alexa Assistant", "Serverless Notification System"],
  "API Gateway": ["Vartalaap", "Serverless Notification System"],
  CloudFront: ["Hardware Store ERP"],
  "Route 53": ["Technosys client migration"],
  IAM: ["Technosys client migration"],
  VPC: ["Technosys client migration (security groups)"],
  CloudWatch: ["AI-Powered Alexa Assistant"],
  Docker: ["Technosys release workflows"],
  "GitHub Actions": ["Technosys release workflows"],
  Nginx: ["Foxpop.in"],
  Linux: ["Hardware Store ERP (Ubuntu)"],
  OpenAI: ["Shiv Cement RAG assistant", "AI-Powered Alexa Assistant", "Prompt Enhancer"],
  RAG: ["Shiv Cement RAG assistant (Hindi, English, Hinglish)"],
  "Gemini Vision": ["MedScan AI"],
};

export const layerBlurbs: Record<string, string> = {
  Interface: "What your users touch, on every screen size.",
  Services: "APIs that check who is asking before anything moves.",
  Data: "Records that stay in agreement, even mid-failure.",
  Cloud: "AWS, set up properly. Two AWS certifications.",
  Delivery: "Repeatable releases and boring rollbacks.",
  "Applied AI": "Grounded in your data, not guesses.",
};

/** Logos in /public/stack (devicon, MIT). Tools without one show as text. */
export const toolLogos: Record<string, string> = {
  React: "/stack/react.svg",
  "Next.js": "/stack/nextjs.svg",
  TypeScript: "/stack/typescript.svg",
  "HTML & CSS": "/stack/html5.svg",
  "Node.js": "/stack/nodejs.svg",
  Express: "/stack/express.svg",
  "Rust / Axum": "/stack/rust.svg",
  PostgreSQL: "/stack/postgresql.svg",
  MongoDB: "/stack/mongodb.svg",
  Redis: "/stack/redis.svg",
  DynamoDB: "/stack/dynamodb.svg",
  EC2: "/stack/aws.svg",
  Docker: "/stack/docker.svg",
  "GitHub Actions": "/stack/githubactions.svg",
  Nginx: "/stack/nginx.svg",
  Linux: "/stack/linux.svg",
};

/** Short case-study headlines for the home deck; the details come from content/work.ts plates. */
export const caseHeads: Record<string, { short: string; thesis: string }> = {
  "hardware-erp": { short: "ERP", thesis: "Everything goes through. Or *nothing* does." },
  procurement: { short: "Procure-to-Pay", thesis: "Check the role. Check the state. Then *move.*" },
  vartalaap: { short: "Vartalaap", thesis: "One recipient goes quiet. Everyone else still *hears.*" },
};

export const fresh = {
  systemLab: {
    href: "https://sys-design-learning.vercel.app/",
    kicker: "SYSTEM LAB · INTERACTIVE LEARNING · 18 LESSONS",
    title: "Watch systems work. Then watch them *break.*",
    body: "An animated field guide to system design. Every lesson is a live simulation: see a problem, switch on a fix and watch response time, cache hits and failures react. It ends with a capstone: keep a URL shortener alive under growing traffic.",
    tags: ["Load balancing", "Caching & CDNs", "Sharding", "Queues & retries", "Circuit breakers", "Autoscaling"],
  },
  dreamHome: {
    href: "https://dream-home-liard-nine.vercel.app/",
    kicker: "DREAM HOME · 3D SANDBOX",
    title: "Build the home you keep *imagining.*",
    body: "A warm, playful 3D sandbox. Plan the rooms, doors, furniture and garden, then walk through the home you designed. Works as a home-screen web app on iPhone.",
  },
  subhangi: {
    href: "https://subhangi-keshri.vercel.app/",
    kicker: "CLIENT SITE · INTERIOR DESIGNER PORTFOLIO",
    title: "From AutoCAD layout to *site.*",
    body: "Portfolio for Subhangi Keshri, an interior designer in Bangalore: a guided studio tour, a room-by-room case study, resume with CV download, and light and dark modes.",
  },
};

export const homeFaq = [
  { q: "Who are you, exactly?", a: "I’m Aman Kumar Keshri, a full-stack software engineer in Bengaluru, India. I build products end to end: React and Next.js interfaces, Node.js and Rust (Axum) APIs, PostgreSQL and DynamoDB data models, and AWS infrastructure, with applied AI such as retrieval-augmented assistants where it helps." },
  { q: "Can I hire you for a freelance project?", a: "Yes. Customer websites, admin dashboards, mobile apps, billing and workflow systems, real-time features, AI assistants and AWS setups. Email amankeshri7479@gmail.com or use the brief builder above." },
  { q: "What have you built?", a: "A Hardware Store ERP that records every sale in one PostgreSQL transaction, a procure-to-pay platform with Rust and PostgreSQL, Vartalaap (serverless real-time chat on AWS), and a Hindi, English and Hinglish RAG assistant for Shiv Cement Store, plus the live builds above." },
  { q: "What’s your stack?", a: "React, Next.js, TypeScript and React Native in front; Node.js, Express and Rust (Axum) behind; PostgreSQL, MongoDB, Redis and DynamoDB for data; AWS, Docker, GitHub Actions, Nginx and Linux to run it; OpenAI, RAG and Gemini Vision for applied AI." },
  { q: "What are your qualifications?", a: "B.E. in Computer Science from JSS Academy of Technical Education, Bengaluru (2021–2025). AWS Certified Solutions Architect – Associate (Feb 2026), AWS Certified Cloud Practitioner (Oct 2025), and an Advanced Certification in Cloud Computing & DevOps from E&ICT Academy, IIT Guwahati (Apr 2026)." },
  { q: "Do you work with clients outside Bengaluru?", a: "Yes. I’ve worked remotely (Technosys) and for a client in Patna (Shiv Cement Store), and I work with clients anywhere over email, calls and a shared preview link." },
];

export const chaosLines = [
  { t: "$ chaos --kill-random-server", cls: "" },
  { t: "✗ server down. letters lost: all of them", cls: "bad" },
  { t: "$ restore --from latest-backup", cls: "" },
  { t: "✓ restored in 2.1s · 0 records lost", cls: "ok" },
  { t: "Design for the bad day. Need that for your product? amankeshri7479@gmail.com", cls: "say" },
];
